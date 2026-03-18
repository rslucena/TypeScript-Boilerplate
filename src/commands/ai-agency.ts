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
     BRANCH: [type/short-description, e.g., feat/optimize-cache or fix/sanitize-input. NO NUMBERS.]
     TITLE: [PR Title]
     DESCRIPTION: [Detailed PR Description. YOU MUST populate the '## Issues' section of the template with '- #${selectedIssue?.number}' to link the issue.]
     
     FILE: src/path/to/file.ts
     [Complete file content here]
     ENDFILE
`;

	const result = await model.generateContent(fullPrompt);
	const responseText = result.response.text();

	if (responseText.includes("NO_ISSUES_FOUND")) {
		console.log("✅ No issues identified by the agent.");
		return;
	}

	if (agentName === "hammer" && selectedIssue) {
		console.log("🛠️ Hammer analysis complete. Processing implementation...");

		const branchMatch = responseText.match(/BRANCH:\s*(.*)/);
		const titleMatch = responseText.match(/TITLE:\s*(.*)/);
		const descMatch = responseText.match(/DESCRIPTION:\s*([\s\S]*?)(?=FILE:|$)/);

		const prBranchRaw = branchMatch ? branchMatch[1].trim() : `fix/issue-${selectedIssue.number || Date.now()}`;
		const branchName = prBranchRaw.replace(/\d+/g, "").replace(/-+$/g, "").replace(/\/+$/g, "") || `fix/automated-fix`;

		const prTitle = titleMatch ? titleMatch[1].trim() : `Fix: ${selectedIssue.title}`;
		const prDescription = descMatch ? descMatch[1].trim() : selectedIssue.body;

		const fileBlocks = responseText.split("FILE:").slice(1);

		if (fileBlocks.length > 0) {
			try {
				console.log(`📦 Creating branch: ${branchName}`);
				try {
					execSync(`git branch -D ${branchName}`, { stdio: "ignore" });
				} catch (_) {}
				execSync(`git checkout -b ${branchName}`, { stdio: "inherit" });

				for (const block of fileBlocks) {
					const [pathPart, ...contentParts] = block.split("ENDFILE")[0].trim().split("\n");
					const filePath = pathPart.trim();
					const fileContent = contentParts.join("\n").trim();

					console.log(`📝 Applying changes to: ${filePath}`);
					const absolutePath = join(process.cwd(), filePath);
					await writeFile(absolutePath, fileContent);
				}

				console.log("🚀 Opening Pull Request to 'staging'...");
				const tempDescPath = join(process.cwd(), "temp-pr-desc.md");
				await writeFile(tempDescPath, prDescription);
				execSync(
					`gh pr create --title "${prTitle}" --body-file "${tempDescPath}" --base staging --head ${branchName}`,
					{
						stdio: "inherit",
					},
				);
				await unlink(tempDescPath);

				execSync("git checkout -", { stdio: "inherit" });
				console.log(`✨ Hammer successfully opened PR for Issue #${selectedIssue.number}!`);
			} catch (error) {
				console.error("❌ Hammer encountered an error during PR creation:", (error as Error).message);
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
