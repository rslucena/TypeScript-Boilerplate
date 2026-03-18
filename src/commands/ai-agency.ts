import { execSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

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
		const prOutput = execSync("gh pr list --state open --json body", { encoding: "utf-8" });
		const prs = JSON.parse(prOutput) as GitHubPR[];

		const linkedIssues = new Set<number>();
		const issueRegex = /#(\d+)/g;

		for (const pr of prs) {
			const matches = pr.body.matchAll(issueRegex);
			for (const match of matches) {
				linkedIssues.add(Number.parseInt(match[1]));
			}
		}

		if (linkedIssues.size > 0) {
			console.log(`ℹ️ Skipping issues already linked in open PRs: ${Array.from(linkedIssues).join(", ")}`);
		}

		console.log("🔍 Searching for available open issues...");
		const issueOutput = execSync("gh issue list --state open --json number,title,body --limit 10", {
			encoding: "utf-8",
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
	} catch (error) {
		console.error("❌ Failed to fetch issues or PRs from repository:", (error as Error).message);
		return null;
	}
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
	let selectedIssue: { number: number; title: string; body: string } | null = null;

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

	const fullPrompt = `
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
     - [context]: [Message for files in this context]
     (IMPORTANT: DO NOT USE BRACKETS [] AROUND THE TYPE OR CONTEXT IN THE ACTUAL COMMIT MESSAGE. EX: core: message)
     
     FILE: src/path/to/file.ts
     [Complete file content here]
     ENDFILE
`;

	const result = await model.generateContent(fullPrompt);
	const responseText = result.response.text();

	if (responseText.toUpperCase().includes("NO_ISSUES_FOUND")) {
		console.log("✅ No issues identified by the agent.");
		return;
	}

	if (agentName === "hammer" && selectedIssue) {
		console.log("🛠️ Hammer analysis complete. Processing implementation...");

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

		if (fileBlocks.length > 0) {
			try {
				console.log(`📦 Creating branch: ${branchName}`);
				try {
					execSync(`git branch -D ${branchName}`, { stdio: "ignore" });
				} catch (_) {}
				execSync(`git checkout -b ${branchName}`, { stdio: "inherit" });

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
					let contextName = "core";
					if (filePath.startsWith("src/domain/")) {
						contextName = filePath.split("/")[2] || "domain";
					} else if (filePath.startsWith("src/infrastructure/")) {
						contextName = filePath.split("/")[3] || filePath.split("/")[2] || "infra";
					}

					if (!filesByContext[contextName]) {
						// Try to find specific message from commit plan if available
						let message = `${contextName}: update ${contextName} implementation`;
						if (commitPlanMatch) {
							const planLines = commitPlanMatch[1].trim().split("\n");
							const contextLine = planLines.find(
								(l) =>
									l.toLowerCase().includes(`(${contextName.toLowerCase()})`) ||
									l.toLowerCase().includes(`[${contextName.toLowerCase()}]`),
							);
							if (contextLine) message = contextLine.replace(/^\s*-\s*/, "").trim();
						}
						// Sanitize message: Remove brackets []
						message = message.replace(/\[|\]/g, "");
						filesByContext[contextName] = { paths: [], message };
					}
					filesByContext[contextName].paths.push(filePath);
				}

				console.log("🛠️ Performing semantic commits...");
				for (const ctx in filesByContext) {
					const { paths, message } = filesByContext[ctx];
					console.log(`💬 Committing ${ctx}: ${message}`);
					execSync(`git add ${paths.join(" ")}`, { stdio: "inherit" });
					execSync(`git commit -m "${message}"`, { stdio: "inherit" });
				}

				console.log("🚀 Opening Pull Request to 'staging'...");
				const tempDescPath = join(process.cwd(), "temp-pr-desc.md");
				await writeFile(tempDescPath, prDescription);

				execSync(
					`gh pr create --title "${prTitle}" --body-file "${tempDescPath}" --base staging --head ${branchName} --fill || gh pr create --title "${prTitle}" --body-file "${tempDescPath}" --base staging --head ${branchName}`,
					{
						stdio: "inherit",
					},
				);
				await unlink(tempDescPath);

				console.log(`✨ Hammer successfully opened PR for Issue #${selectedIssue.number}!`);

				if (criticalNotesMatch) {
					console.log("💬 Adding critical implementation comment...");
					const criticalNotes = criticalNotesMatch[1].trim();
					const commentBody = `### Implementation Notes\n\n${criticalNotes}`;
					const tempCommentPath = join(process.cwd(), "temp-comment.md");
					await writeFile(tempCommentPath, commentBody);
					execSync(`gh pr comment --body-file "${tempCommentPath}"`, { stdio: "inherit" });
					await unlink(tempCommentPath);
				}

				execSync("git checkout -", { stdio: "inherit" });
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : String(err);
				console.error("❌ Hammer encountered an error during PR creation:", msg);
			}
		} else {
			console.log("⚠️ No specific 'FILE:' blocks found. Implementation printed below for manual review:");
			console.log(responseText);
		}
		return;
	}

	console.log("📝 Generating GitHub Issue (Discovery)...");
	const issueBodyPath = join(process.cwd(), "temp-issue-body.md");
	const lines = responseText.split("\n");
	const title =
		lines[0]
			.replace(/^#+\s*/, "")
			.substring(0, 100)
			.trim() || `Agent Discovery: ${agentName}`;
	const body = responseText;

	await writeFile(issueBodyPath, body);

	try {
		const issueUrl = execSync(`gh issue create --title "${title}" --body-file "${issueBodyPath}"`, {
			encoding: "utf-8",
		}).trim();
		console.log(`🚀 Issue created: ${issueUrl}`);
	} catch (error) {
		console.error("❌ Failed to create issue via gh CLI:", (error as Error).message);
	} finally {
		await unlink(issueBodyPath);
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
