import { execSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const SKIP_VERIFY = process.env.SKIP_VERIFY !== "false"; // Default to true

if (!API_KEY) {
	console.error("❌ Error: GEMINI_API_KEY environment variable is not set.");
	process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

interface GitHubIssue {
	number: number;
	title: string;
	body: string;
}

interface GitHubPR {
	body: string;
}

function runCommand(command: string, options: { stdio: string } = { stdio: "inherit" }): string {
	try {
		const output = execSync(command, { encoding: "utf-8", ...options });
		return output || "";
	} catch (error: unknown) {
		const err = error as { stdout?: Buffer; stderr?: Buffer };
		const stdout = err.stdout?.toString() || "";
		const stderr = err.stderr?.toString() || "";
		throw new Error(`${stdout}\n${stderr}`);
	}
}

async function getProjectContext(dir: string): Promise<string> {
	let context = "";
	const files = readdirSync(dir);

	for (const file of files) {
		const fullPath = join(dir, file);
		const relativePath = relative(process.cwd(), fullPath);

		if (statSync(fullPath).isDirectory()) {
			if (file !== "node_modules" && file !== ".git" && file !== ".gemini" && file !== "dist") {
				context += await getProjectContext(fullPath);
			}
		} else {
			if (file.endsWith(".ts") || file.endsWith(".md") || file.endsWith(".json")) {
				const content = await readFile(fullPath, "utf-8");
				context += `\n--- File: ${relativePath} ---\n${content}\n`;
			}
		}
	}
	return context;
}

async function getIssueToSolve(): Promise<{ number: number; title: string; body: string } | null> {
	try {
		console.log("🔍 Checking open Pull Requests to avoid duplicate work...");
		const prOutput = runCommand("gh pr list --state open --json body", { stdio: "pipe" });
		const prs = JSON.parse(prOutput) as GitHubPR[];

		const linkedIssues = new Set<number>();
		const issueRegex = /#(\d+)/g;

		for (const pr of prs) {
			const matches = pr.body.matchAll(issueRegex);
			for (const match of matches) {
				linkedIssues.add(Number.parseInt(match[1], 10));
			}
		}

		if (linkedIssues.size > 0) {
			console.log(`ℹ️ Skipping issues already linked in open PRs: ${Array.from(linkedIssues).join(", ")}`);
		}

		console.log("🔍 Searching for available open issues...");
		const issueOutput = runCommand("gh issue list --state open --json number,title,body --limit 10", {
			stdio: "pipe",
		});
		const issues = JSON.parse(issueOutput) as GitHubIssue[];

		const availableIssue = issues.find((issue) => !linkedIssues.has(issue.number));

		if (!availableIssue) {
			console.log("✅ No unassigned open issues found.");
			return null;
		}

		return {
			number: availableIssue.number,
			title: availableIssue.title,
			body: availableIssue.body,
		};
	} catch (error: unknown) {
		console.error("❌ Failed to fetch issues or PRs from repository:", (error as Error).message);
		return null;
	}
}

async function applyImplementation(responseText: string, selectedIssue: GitHubIssue) {
	const branchMatch = responseText.match(/BRANCH:\s*(.*)/i);
	const titleMatch = responseText.match(/TITLE:\s*(.*)/i);
	const descMatch = responseText.match(/DESCRIPTION:\s*([\s\S]*?)(?=CRITICAL_NOTES:|COMMIT_PLAN:|FILE:|$)/i);
	const criticalNotesMatch = responseText.match(/CRITICAL_NOTES:\s*([\s\S]*?)(?=COMMIT_PLAN:|FILE:|$)/i);
	const commitPlanMatch = responseText.match(/COMMIT_PLAN:\s*([\s\S]*?)(?=FILE:|$)/i);

	const prBranchRaw = branchMatch ? branchMatch[1].trim() : `fix/hammer-fix-issue-${selectedIssue.number}`;
	const branchName = prBranchRaw.replace(/\d+/g, "").replace(/-+$/g, "").replace(/\/+$/g, "") || "fix/hammer-fix";

	let prTitle = titleMatch ? titleMatch[1].trim() : `fix(core): ${selectedIssue.title}`;
	if (!prTitle.includes("(") || !prTitle.includes("):")) {
		prTitle = `fix(core): ${prTitle.replace(/^fix\s*:\s*/i, "").replace(/^feat\s*:\s*/i, "")}`;
	}

	const prDescription = descMatch ? descMatch[1].trim() : selectedIssue.body;
	const fileBlocks = responseText.split(/FILE:\s*/i).slice(1);

	if (fileBlocks.length === 0) {
		throw new Error("No 'FILE:' blocks found in AI response.");
	}

	console.log(`📦 Creating branch: ${branchName}`);
	try {
		runCommand(`git branch -D ${branchName}`, { stdio: "ignore" });
	} catch (_) {}
	runCommand(`git checkout -b ${branchName}`, { stdio: "inherit" });

	const filesByContext: Record<string, { paths: string[]; message: string }> = {};

	for (const block of fileBlocks) {
		const [pathPart, ...contentParts] = block
			.split(/ENDFILE/i)[0]
			.trim()
			.split("\n");
		const filePath = pathPart.trim();
		const fileContent = contentParts.join("\n").trim();

		console.log(`📝 Applying changes to: ${filePath}`);
		const absolutePath = join(process.cwd(), filePath);
		await writeFile(absolutePath, fileContent);

		// Determine context for commit grouping
		const parts = filePath.split("/");
		const fileName = parts[parts.length - 1].replace(/\.ts$|\.spec\.ts$/, "");
		let moduleName = "core";
		if (filePath.startsWith("src/domain/")) {
			moduleName = parts[2] || "domain";
		} else if (filePath.startsWith("src/infrastructure/")) {
			moduleName = parts[3] || parts[2] || "infra";
		}

		if (!filesByContext[moduleName]) {
			let message = `fix(${moduleName}): refine ${moduleName} logic`;
			if (commitPlanMatch) {
				const planLines = commitPlanMatch[1].trim().split("\n");
				const contextLine = planLines.find((l) => {
					const low = l.toLowerCase();
					return (
						low.includes(`(${moduleName.toLowerCase()})`) ||
						low.includes(`[${moduleName.toLowerCase()}]`) ||
						low.includes(`(${fileName.toLowerCase()})`) ||
						low.includes(`[${fileName.toLowerCase()}]`)
					);
				});
				if (contextLine) message = contextLine.replace(/^\s*-\s*/, "").trim();
			}
			message = message.replace(/\[|\]/g, "");
			filesByContext[moduleName] = { paths: [], message };
		}
		filesByContext[moduleName].paths.push(filePath);
	}

	console.log("🛠️ Performing semantic commits...");
	try {
		runCommand("git config user.name", { stdio: "ignore" });
	} catch (_) {
		console.log("ℹ️ Setting local git identity for the agent...");
		runCommand('git config user.name "Hammer AI Agent"', { stdio: "inherit" });
		runCommand('git config user.email "agent@hammer.ai"', { stdio: "inherit" });
	}

	for (const ctx in filesByContext) {
		const { paths, message } = filesByContext[ctx];
		console.log(`💬 Committing ${ctx}: ${message}`);
		const verifyFlag = SKIP_VERIFY ? " --no-verify" : "";
		runCommand(`git add ${paths.join(" ")}`, { stdio: "inherit" });
		runCommand(`git commit -m "${message}"${verifyFlag}`, { stdio: "inherit" });
	}

	console.log(`🚀 Pushing branch '${branchName}' to origin...`);
	try {
		const verifyFlag = SKIP_VERIFY ? " --no-verify" : "";
		runCommand(`git push -u origin ${branchName}${verifyFlag}`, { stdio: "inherit" });
	} catch (pushError: unknown) {
		if (!SKIP_VERIFY) {
			console.error("\n❌ Push failed. This is often due to failing tests in the pre-push hook.");
			throw pushError; // Bubble up for repair loop
		}
		// If SKIP_VERIFY is true, push shouldn't fail due to hooks,
		// but if it fails for other reasons, we log it.
		console.error("\n❌ Push failed even with --no-verify:", (pushError as Error).message);
		throw pushError;
	}

	console.log("🚀 Opening Pull Request to 'staging'...");
	const tempDescPath = join(process.cwd(), "temp-pr-desc.md");
	await writeFile(tempDescPath, prDescription);

	runCommand(
		`gh pr create --title "${prTitle}" --body-file "${tempDescPath}" --base staging --head ${branchName} --fill || gh pr create --title "${prTitle}" --body-file "${tempDescPath}" --base staging --head ${branchName}`,
		{ stdio: "inherit" },
	);
	await unlink(tempDescPath);

	console.log(`✨ Hammer successfully opened PR for Issue #${selectedIssue.number}!`);

	if (criticalNotesMatch) {
		console.log("💬 Adding critical implementation comment...");
		const criticalNotes = criticalNotesMatch[1].trim();
		const commentBody = `### Implementation Notes\n\n${criticalNotes}`;
		const tempCommentPath = join(process.cwd(), "temp-comment.md");
		await writeFile(tempCommentPath, commentBody);
		runCommand(`gh pr comment --body-file "${tempCommentPath}"`, { stdio: "inherit" });
		await unlink(tempCommentPath);
	}

	runCommand("git checkout -", { stdio: "inherit" });
}

async function runAgent(agentName: string) {
	const promptPath = join(process.cwd(), ".agent", "prompts", `${agentName}.md`);
	const rulesPath = join(process.cwd(), ".agent", "rules.md");

	const agentPrompt = await readFile(promptPath, "utf-8").catch(() => {
		console.error(`❌ Agent prompt file not found: ${promptPath}`);
		process.exit(1);
	});

	const projectRules = await readFile(rulesPath, "utf-8").catch(() => {
		console.warn("⚠️ Warning: .agent/rules.md not found.");
		return "";
	});

	let hammerIssueContext = "";
	let selectedIssue: GitHubIssue | null = null;

	if (agentName === "hammer") {
		selectedIssue = await getIssueToSolve();
		if (!selectedIssue) {
			console.log("✅ Hammer is resting. No new issues to solve.");
			return;
		}

		console.log(`🔨 Hammer picked up Issue #${selectedIssue.number}: ${selectedIssue.title}`);

		hammerIssueContext = `
SELECTED ISSUE TO SOLVE:
Issue #${selectedIssue.number}: ${selectedIssue.title}
Issue Description:
${selectedIssue.body}
`;
	}

	console.log(`🤖 Starting analysis with agent: ${agentName}...`);
	const context = await getProjectContext(join(process.cwd(), "src"));

	const initialPrompt = `
PROJECT RULES AND STANDARDS:
${projectRules}

AGENT PROMPT:
${agentPrompt}

${hammerIssueContext}

Context from the repository (src folder):
${context}

Instructions:
1. If you are Bolt/Sentinel (Discovery): Output ONLY a single GitHub Issue diagnosis. If nothing is found, output: "NO_ISSUES_FOUND".
2. If you are Hammer (Execution): 
   - Analyze the SELECTED ISSUE and the code context.
   - Follow ALL PR and Implementation rules from the PROJECT RULES.
   - Output your implementation in a structured format:
     BRANCH: [tipo/descricao-curta. NO NUMBERS.]
     TITLE: [tipo(contexto): implementacao. EX: fix(cache): optimize scan]
     DESCRIPTION: [Detailed PR Description. MUST follow the structure of .github/pull_request_template.md. POPULATE the '## Issues' section with '- #${selectedIssue?.number}'.]
     
     CRITICAL_NOTES: [Technical description of critical logic, potential side effects, or architectural decisions.]

     COMMIT_PLAN:
     - [tipo](contexto): [A humanized, technical message. Use 'refactor' for optimizations. DO NOT just say 'update context'.]
     (IMPORTANT: DO NOT USE BRACKETS [] AROUND THE TYPE OR CONTEXT IN THE ACTUAL COMMIT MESSAGE. EX: refactor(cache): optimize scan)
     
     FILE: src/path/to/file.ts
     [Complete file content here]
     ENDFILE
`;

	try {
		console.log("Sending prompt to Gemini...");
		const result = await model.generateContent(initialPrompt);
		const responseText = result.response.text();

		console.log("Response from Gemini:");
		console.log(responseText);

		if (responseText.toUpperCase().includes("NO_ISSUES_FOUND")) {
			console.log("✅ No issues identified by the agent.");
			return;
		}

		if (agentName === "hammer" && selectedIssue) {
			try {
				await applyImplementation(responseText, selectedIssue);
			} catch (error: unknown) {
				console.log("\n🧪 Entering Self-Repair Loop...");
				console.log("🔍 Analyzing test failures...");

				const errorLogs = (error as Error).message;
				const repairPrompt = `
REPAIR TICKET:
The previous implementation for Issue #${selectedIssue.number} FAILED the quality checks (tests).

ORIGINAL IMPLEMENTATION:
${responseText}

ERROR LOGS FROM TESTS:
${errorLogs}

INSTRUCTIONS:
1. Analyze the ERROR LOGS and identify why the code failed.
2. Provide a FIXED implementation.
3. Keep the SAME BRANCH, TITLE, and DESCRIPTION unless explicitly wrong.
4. Output FULL FILES that need correction.
5. Use the SAME 'FILE: ... ENDFILE' structure.
6. Be brief in CRITICAL_NOTES about what you fixed.
`;
				console.log("Sending repair prompt to Gemini...");
				const repairResult = await model.generateContent(repairPrompt);
				const repairResponse = repairResult.response.text();

				console.log("Repair Response from Gemini:");
				console.log(repairResponse);

				console.log("🛠️ Attempting to apply fixes...");
				await applyImplementation(repairResponse, selectedIssue);
			}
		} else {
			// Discovery Logic (Bolt/Sentinel)
			console.log("📝 Generating GitHub Issue (Discovery)...");
			const issueBodyPath = join(process.cwd(), "temp-issue-body.md");
			const lines = responseText.split("\n");
			const title =
				lines[0]
					.replace(/^#+\s*/, "")
					.substring(0, 100)
					.trim() || "Agent Discovery";
			await writeFile(issueBodyPath, responseText);
			const issueUrl = runCommand(`gh issue create --title "${title}" --body-file "${issueBodyPath}"`, {
				stdio: "pipe",
			}).trim();
			console.log(`🚀 Issue created: ${issueUrl}`);
			await unlink(issueBodyPath);
		}
	} catch (error: unknown) {
		console.error("❌ Hammer critical failure:", (error as Error).message);
	}
}

// Entry point
const args = process.argv.slice(2);
const agent = args[0];

if (!agent || !["bolt", "sentinel", "hammer"].includes(agent)) {
	console.error("❌ Usage: bun src/commands/ai-agency.ts <bolt|sentinel|hammer>");
	process.exit(1);
}

runAgent(agent).catch(console.error);
