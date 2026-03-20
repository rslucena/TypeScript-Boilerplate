import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
	console.error("❌ GEMINI_API_KEY not set");
	process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

function runExec(cmd: string): string {
	return execSync(cmd, { encoding: "utf-8" }).trim();
}

function safe(str: string) {
	return str.replace(/"/g, '\\"');
}

async function setupGitConfig() {
	try {
		console.log("👤 Discovering identity from GH_TOKEN...");
		const userRaw = runExec("gh api user");
		const user = JSON.parse(userRaw);

		const name = user.name || user.login;
		const email = user.email || `${user.login}@users.noreply.github.com`;

		console.log(`✅ Identity found: ${name} <${email}>`);

		runExec(`git config --global user.name "${name}"`);
		runExec(`git config --global user.email "${email}"`);
	} catch (err: unknown) {
		console.warn("⚠️ Failed to auto-configure git identity:", err instanceof Error ? err.message : String(err));
	}
}

async function getContext(): Promise<string> {
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

function pickIssue(): { number: number; title: string; body: string } | null {
	try {
		const raw = runExec(`gh issue list --state open --label "automations" --json number,title,body`);

		const issues = JSON.parse(raw);

		if (!issues.length) return null;

		// Pick the oldest one
		return issues[0];
	} catch {
		return null;
	}
}

type Issue = { number: number; title: string; body: string };

function buildPrompt(issue: Issue, rules: string, context: string, agentPrompt: string) {
	return `
PROJECT RULES:
${rules}

AGENT (HAMMER - EXECUTION SPECIALIST):
${agentPrompt}

ISSUE TO SOLVE:
#${issue.number} - ${issue.title}

${issue.body}

CODEBASE (CONTEXT):
${context}

STRICT INSTRUCTIONS:
- Fix the issue completely
- Do not break existing behavior
- Prefer minimal, precise changes
- Use the provided OUTPUT FORMAT strictly
- BRANCH name MUST NOT contain numbers. Example: fix/optimize-logic

OUTPUT FORMAT:

BRANCH: fix/<short-name>
TITLE: fix(core): <description>
DESCRIPTION:
<full PR description (including Closes #${issue.number})>

COMMIT:
<commit message>

FILE: path/to/file.ts
<full file content>
ENDFILE
`;
}

async function apply(response: string) {
	const branchRaw = response.match(/BRANCH:\s*(.*)/i)?.[1]?.trim();
	if (!branchRaw) throw new Error("No BRANCH found in response");

	// Ensure branch name has no numbers as per rules
	const branch = branchRaw.replace(/[0-9]/g, "");

	const title = response.match(/TITLE:\s*(.*)/i)?.[1]?.trim() || "fix(core): auto fix";

	const description = response.match(/DESCRIPTION:\s*([\s\S]*?)(?=COMMIT:|FILE:|$)/i)?.[1]?.trim() || "auto fix";

	const commitRaw = response.match(/COMMIT:\s*(.*)/i)?.[1]?.trim() || "fix: auto";
	const commit = commitRaw.replace(/"/g, "'");

	const fileBlocks = response.split(/FILE:\s*/i).slice(1);

	if (!fileBlocks.length) throw new Error("No files returned");

	console.log(`🌿 Creating branch: ${branch}`);
	runExec(`git checkout -b ${branch}`);

	for (const block of fileBlocks) {
		const [path, ...rest] = block
			.split(/ENDFILE/i)[0]
			.trim()
			.split("\n");

		const filePath = path.trim();
		const content = rest.join("\n");

		console.log(`📝 Writing file: ${filePath}`);
		await writeFile(join(process.cwd(), filePath), content);
		runExec(`git add ${filePath}`);
	}

	console.log(`💾 Committing changes...`);
	runExec(`git commit -m "${commit}"`);

	console.log(`⬆️ Pushing to origin...`);
	runExec(`git push -u origin ${branch}`);

	const tempPath = join(process.cwd(), "pr.md");
	await writeFile(tempPath, description);

	console.log(`🚀 Creating Pull Request...`);
	runExec(`gh pr create --title "${safe(title)}" --body-file "${tempPath}" --base staging --head ${branch}`);

	await unlink(tempPath);
}

async function run() {
	console.log("🔨 Hammer starting (execution)...");

	await setupGitConfig();

	const issue = pickIssue();

	if (!issue) {
		console.log("😴 No issues available with 'automations' label.");
		return;
	}

	console.log(`🎯 Found issue: #${issue.number} - ${issue.title}`);

	const rules = await readFile(".agent/rules.md", "utf-8").catch(() => "");
	const agentPrompt = await readFile(".agent/prompts/hammer.md", "utf-8");
	const context = await getContext();

	console.log("🤖 Calling Gemini for the fix...");
	const prompt = buildPrompt(issue, rules, context, agentPrompt);
	const result = await model.generateContent(prompt);
	const response = result.response.text();

	console.log("📄 Response received. Applying fix...");
	console.log(response);

	await apply(response);
}

run().catch((err) => {
	console.error("❌ Hammer failed:", err.message);
});
