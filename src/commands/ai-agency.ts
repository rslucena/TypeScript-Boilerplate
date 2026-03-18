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
const PROJECT_NUMBER = process.env.GH_PROJECT_NUMBER;
const OWNER = process.env.GH_PROJECT_OWNER;
const STATUS_FIELD_ID = process.env.GH_STATUS_FIELD_ID;
const IN_PROGRESS_OPTION_ID = process.env.GH_IN_PROGRESS_OPTION_ID;

if (
	!process.env.GH_PROJECT_NUMBER ||
	!process.env.GH_PROJECT_OWNER ||
	!process.env.GH_STATUS_FIELD_ID ||
	!process.env.GH_IN_PROGRESS_OPTION_ID
) {
	console.error("❌ Error: Missing GitHub Project environment variables.");
	process.exit(1);
}

interface ProjectItem {
	id: string;
	status: string;
	content?: {
		type: string;
		title: string;
		body: string;
		number?: number;
	};
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

async function getTodoIssue(): Promise<{ itemId: string; title: string; body: string; number?: number } | null> {
	try {
		console.log("🔍 Searching for tasks in 'Todo' column...");
		const output = execSync(`gh project item-list ${PROJECT_NUMBER} --owner ${OWNER} --format json`, {
			encoding: "utf-8",
		});
		const data = JSON.parse(output);

		const todoItem = data.items.find((item: ProjectItem) => item.status === "Todo" && item.content?.type === "Issue");

		if (!todoItem) return null;

		return {
			itemId: todoItem.id,
			title: todoItem.content?.title || "",
			body: todoItem.content?.body || "",
			number: todoItem.content?.number,
		};
	} catch (_) {
		console.error("❌ Failed to fetch items from project board.");
		return null;
	}
}

async function startTask(itemId: string) {
	try {
		console.log("🚀 Moving task to 'In Progress'...");
		execSync(
			`gh project item-edit --id ${itemId} --field-id "${STATUS_FIELD_ID}" --project ${PROJECT_NUMBER} --option-id "${IN_PROGRESS_OPTION_ID}" --owner ${OWNER}`,
			{ stdio: "inherit" },
		);
	} catch (_) {
		console.error("❌ Failed to move item to 'In Progress'.");
	}
}

async function runAgent(agentName: string) {
	const promptPath = join(process.cwd(), ".agent", "prompts", `${agentName}.md`);

	const agentPrompt = await readFile(promptPath, "utf-8").catch(() => {
		console.error(`❌ Agent prompt file not found: ${promptPath}`);
		process.exit(1);
	});

	let hammerIssueContext = "";
	let selectedIssue: { itemId: string; title: string; body: string; number?: number } | null = null;

	if (agentName === "hammer") {
		selectedIssue = await getTodoIssue();
		if (!selectedIssue) {
			console.log("✅ No tasks found in 'Todo' column. Hammer is resting.");
			return;
		}

		console.log(`🔨 Hammer picked up task: ${selectedIssue.title}`);
		await startTask(selectedIssue.itemId);

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
${agentPrompt}

${hammerIssueContext}

Context from the repository (src folder):
${context}

Instructions:
1. If you are Bolt/Sentinel (Discovery): Output ONLY a single GitHub Issue diagnosis. If nothing is found, output: "NO_ISSUES_FOUND".
2. If you are Hammer (Execution): 
   - Analyze the SELECTED ISSUE and the code context.
   - Output your implementation in a structured format so I can automate the PR:
     BRANCH: [type/short-description, e.g., feat/optimize-cache or fix/sanitize-input. NO NUMBERS.]
     TITLE: [PR Title]
     DESCRIPTION: [Detailed PR Description, including 'Closes #${selectedIssue?.number}']
     
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
		// Sanitize branch name (remove numbers as per rule, although AI should follow it)
		const branchName = prBranchRaw.replace(/\d+/g, "").replace(/-+$/g, "").replace(/\/+$/g, "") || `fix/automated-fix`;

		const prTitle = titleMatch ? titleMatch[1].trim() : `Fix: ${selectedIssue.title}`;
		const prDescription = descMatch ? descMatch[1].trim() : selectedIssue.body;

		// Parse files: FILE: path\ncontent\nENDFILE
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
			} catch (_) {
				console.error("❌ Hammer encountered an error during PR creation.");
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

		execSync(`gh project item-add ${PROJECT_NUMBER} --owner ${OWNER} --url ${issueUrl}`, {
			stdio: "inherit",
		});
		console.log(`🚀 Issue added to Project board #${PROJECT_NUMBER}!`);
	} catch (_) {
		console.error("❌ Failed to create issue or add to project via gh CLI.");
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
