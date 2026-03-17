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
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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

async function runAgent(agentName: string) {
	const promptPath = join(process.cwd(), ".agent", "prompts", `${agentName}.md`);

	const agentPrompt = await readFile(promptPath, "utf-8").catch(() => {
		console.error(`❌ Agent prompt file not found: ${promptPath}`);
		process.exit(1);
	});

	console.log(`🤖 Starting analysis with agent: ${agentName}...`);
	const context = await getProjectContext(join(process.cwd(), "src"));

	const fullPrompt = `
${agentPrompt}

Context from the repository (src folder):
${context}

Instructions:
1. Analyze the context based on your Mission and Rules.
2. If you find something relevant to report, output ONLY a single GitHub Issue following the template specified in your Rules.
3. If no issues are found, output: "NO_ISSUES_FOUND".
`;

	const result = await model.generateContent(fullPrompt);
	const responseText = result.response.text();

	if (responseText.includes("NO_ISSUES_FOUND")) {
		console.log("✅ No issues identified by the agent.");
		return;
	}

	console.log("📝 Generating GitHub Issue...");

	// Create temporary file for issue body to handle multiline content safely
	const issueBodyPath = join(process.cwd(), "temp-issue-body.md");
	const lines = responseText.split("\n");
	const title =
		lines[0]
			.replace(/^#+\s*/, "")
			.substring(0, 100)
			.trim() || `Agent Discovery: ${agentName}`;
	const body = responseText;

	await writeFile(issueBodyPath, body);

	const labels = agentName === "sentinel" ? "bug,security" : "feat,performance";

	try {
		execSync(`gh issue create --title "${title}" --body-file "${issueBodyPath}" --label "${labels}"`, {
			stdio: "inherit",
		});
		console.log(`🚀 Issue created successfully for ${agentName}!`);
	} catch (_) {
		console.error("❌ Failed to create issue via gh CLI. Body preview:");
		console.log(body);
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
