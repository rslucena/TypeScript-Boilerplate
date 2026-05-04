import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
	console.error("❌ GEMINI_API_KEY not set");
	process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const prompts = (rules: string, agentPrompt: string, context: string) => `
PROJECT RULES:
${rules}

AGENT (BOLT - PERFORMANCE SPECIALIST):
${agentPrompt}

CODEBASE (PARTIAL CONTEXT):
${context}

STRICT INSTRUCTIONS:
- Identify EXACTLY ONE high-impact performance issue
- Prefer CPU, memory, I/O, or algorithm inefficiency
- DO NOT suggest micro-optimizations
- DO NOT invent problems
- If nothing relevant, output EXACTLY: NO_ISSUES_FOUND

OUTPUT FORMAT:
# <short-title>

## Problem
...

## Impact
...

## Evidence
...

## Suggested Fix
...
`;

function runExec(command: string): string {
	return execSync(command, { encoding: "utf-8" }).trim();
}

function safe(str: string) {
	return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function getRelevantContext(): Promise<string> {
	const base = join(process.cwd(), "src");
	let context = "";
	const MAX_TOTAL_SIZE = 100000;
	const MAX_FILE_SIZE = 5000;

	async function walk(dir: string) {
		const entries = readdirSync(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(dir, entry.name);

			if (context.length > MAX_TOTAL_SIZE) break;

			if (entry.isDirectory()) {
				await walk(fullPath);
				continue;
			}

			if (!entry.name.match(/\.(ts|js)$/)) continue;

			const relativePath = relative(process.cwd(), fullPath);
			const content = (await readFile(fullPath, "utf-8")).slice(0, MAX_FILE_SIZE);

			context += `\n--- FILE: ${relativePath} ---\n${content}\n`;
		}
	}

	await walk(base);
	return context;
}

async function buildPrompt(): Promise<string> {
	const rules = await readFile(".agent/rules.md", "utf-8").catch(() => "");
	const agentPrompt = await readFile(".agent/prompts/performance.md", "utf-8");
	const context = await getRelevantContext();
	return prompts(rules, agentPrompt, context);
}

function issueExists(): boolean {
	try {
		const result = runExec(`gh issue list --state open --label "automations" --json title`);
		const issues = JSON.parse(result);
		return issues.length > 0;
	} catch {
		return false;
	}
}

function getLabels(content: string): string[] {
	const lower = content.toLowerCase();
	const labels = ["automations"];
	if (lower.includes("bug") || lower.includes("leak")) {
		labels.push("fix");
	} else {
		labels.push("chore");
	}
	return labels;
}

async function createIssue(content: string) {
	const title = content
		.split("\n")[0]
		.replace(/^#+\s*/, "")
		.slice(0, 100);

	if (issueExists()) {
		console.log("⏭️ Similar issue already exists. Skipping...");
		return;
	}

	const labels = getLabels(content).join(",");
	const tempPath = join(process.cwd(), "issue.md");

	await writeFile(tempPath, content);

	const url = runExec(`gh issue create --title "${safe(title)}" --body-file "${tempPath}" --label "${labels}"`);

	console.log("🚀 Issue created:", url);

	await unlink(tempPath);
}

async function run() {
	console.log("⚡ Agent Performance starting (performance discovery)...");

	const prompt = await buildPrompt();

	console.log("🤖 Calling Gemini...");
	const result = await model.generateContent(prompt);
	const response = result.response.text();

	console.log("📄 Response:");
	console.log(response);

	if (response.trim() === "NO_ISSUES_FOUND") {
		console.log("✅ No performance issues found.");
		return;
	}

	if (!response.startsWith("#")) {
		console.log("⚠️ Invalid response format. Skipping...");
		return;
	}

	await createIssue(response);
}

run().catch((err) => {
	console.error("❌ Agent Performance failed:", err.message);
});
