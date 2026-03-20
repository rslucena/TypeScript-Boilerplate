import { execSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
	console.error("❌ GEMINI_API_KEY not set");
	process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
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
# [bolt] <short-title>

## Problem
...

## Impact
...

## Evidence
...

## Suggested Fix
...
`;

function run(command: string): string {
	return execSync(command, { encoding: "utf-8" }).trim();
}

function safe(str: string) {
	return str.replace(/"/g, '\\"');
}

async function getRelevantContext(): Promise<string> {
	const base = join(process.cwd(), "src");
	const files = readdirSync(base);
	let context = "";
	const MAX_FILE_SIZE = 5000;

	for (const file of files) {
		const full = join(base, file);

		if (statSync(full).isDirectory()) continue;
		if (!file.match(/\.(ts|js)$/)) continue;

		const content = (await readFile(full, "utf-8")).slice(0, MAX_FILE_SIZE);

		context += `\n--- FILE: ${file} ---\n${content}\n`;
	}

	return context;
}

async function buildPrompt(): Promise<string> {
	const rules = await readFile(".agent/rules.md", "utf-8").catch(() => "");
	const agentPrompt = await readFile(".agent/prompts/bolt.md", "utf-8");
	const context = await getRelevantContext();
	return prompts(rules, agentPrompt, context);
}

function issueExists(): boolean {
	try {
		const result = run(`gh issue list --state open --search "[bolt]" --json title`);
		const issues = JSON.parse(result);
		return issues.length > 0;
	} catch {
		return false;
	}
}

function getLabels(content: string): string[] {
	const lower = content.toLowerCase();
	if (lower.includes("bug") || lower.includes("leak")) {
		return ["fix", "core"];
	}
	return ["chore", "core"];
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

	const url = run(`gh issue create --title "${safe(title)}" --body-file "${tempPath}" --label "${labels}"`);

	console.log("🚀 Issue created:", url);

	await unlink(tempPath);
}

async function runBolt() {
	console.log("⚡ Bolt starting (performance discovery)...");

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

runBolt().catch((err) => {
	console.error("❌ Bolt failed:", err.message);
});
