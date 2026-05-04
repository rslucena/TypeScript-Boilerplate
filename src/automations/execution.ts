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
	try {
		return execSync(cmd, { encoding: "utf-8", stdio: "pipe" }).trim();
	} catch (err: unknown) {
		const error = err instanceof Error ? err.message : String(err);
		const output = (err as { stdout?: Buffer })?.stdout?.toString() || "";
		const stderr = (err as { stderr?: Buffer })?.stderr?.toString() || "";
		throw new Error(`${output}\n${stderr}\n${error}`);
	}
}

function safe(str: string) {
	return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
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

function hasAutomationComment(issueNumber: number): boolean {
	try {
		const raw = runExec(`gh issue view ${issueNumber} --json comments`);
		const data = JSON.parse(raw);
		return data.comments.some((c: { body: string }) => c.body.includes("<!-- hammer:fix-applied -->"));
	} catch {
		return false;
	}
}

function pickIssue(): { number: number; title: string; body: string } | null {
	try {
		const raw = runExec(`gh issue list --state open --label "automations" --json number,title,body`);

		const issues = JSON.parse(raw);

		if (!issues.length) return null;

		for (const issue of issues) {
			if (!hasAutomationComment(issue.number)) {
				return issue;
			}
		}

		return null;
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

async function verify(): Promise<{ success: boolean; error?: string }> {
	try {
		console.log("🔍 Running Quality Gate (Lint, Build, Test)...");

		console.log("   - [1/3] Checking Lint/Format (biome)...");
		runExec("bun run lint");

		console.log("   - [2/3] Checking Types/Build (typescript)...");
		runExec("bun run build");

		console.log("   - [3/3] Running Unit Tests (bun:test)...");
		runExec("bun run tests");

		return { success: true };
	} catch (err: unknown) {
		return { success: false, error: err instanceof Error ? err.message : String(err) };
	}
}

function buildRetryPrompt(originalPrompt: string, response: string, error: string) {
	return `
${originalPrompt}

---
YOUR PREVIOUS ATTEMPT FAILED WITH THESE ERRORS:
${error}

YOUR PREVIOUS RESPONSE:
${response}

STRICT INSTRUCTIONS:
- Analyze the errors above and fix them.
- Ensure the code follows ALL project rules.
- Output the COMPLETELY CORRECTED files.
`;
}

async function writeFiles(response: string) {
	const fileBlocks = response.split(/FILE:\s*/i).slice(1);
	if (!fileBlocks.length) throw new Error("No files returned in response");

	for (const block of fileBlocks) {
		const [path, ...rest] = block
			.split(/ENDFILE/i)[0]
			.trim()
			.split("\n");
		const filePath = path.trim();
		const content = rest.join("\n");

		console.log(`📝 Writing file: ${filePath}`);
		await writeFile(join(process.cwd(), filePath), content);
	}
}

async function commitAndPush(response: string, issue: Issue, error?: string) {
	const branchRaw = response.match(/BRANCH:\s*(.*)/i)?.[1]?.trim();
	if (!branchRaw) throw new Error("No BRANCH found in response");
	const branch = branchRaw.replace(/[0-9]/g, "");

	const title = response.match(/TITLE:\s*(.*)/i)?.[1]?.trim() || "fix(core): auto fix";
	const description = response.match(/DESCRIPTION:\s*([\s\S]*?)(?=COMMIT:|FILE:|$)/i)?.[1]?.trim() || "auto fix";
	const commitRaw = response.match(/COMMIT:\s*(.*)/i)?.[1]?.trim() || "fix: auto";
	const commit = commitRaw.replace(/"/g, "'");

	const fileBlocks = response.split(/FILE:\s*/i).slice(1);
	for (const block of fileBlocks) {
		const path = block.split("\n")[0].trim();
		runExec(`git add ${path}`);
	}

	console.log(`🌿 Creating branch: ${branch}`);
	runExec(`git checkout -b ${branch}`);

	console.log(`💾 Committing changes...`);
	runExec(`git commit -m "${commit}" --no-verify`);

	console.log(`⬆️ Pushing to origin...`);
	runExec(`git push -u origin ${branch}`);

	if (!error) {
		const prPath = join(process.cwd(), `pr-${issue.number}.md`);
		const commentPath = join(process.cwd(), `comment-${issue.number}.md`);
		await writeFile(prPath, description);

		console.log(`🚀 Creating Pull Request...`);
		const prUrl = runExec(
			`gh pr create --title "${safe(title)}" --body-file "${prPath}" --base staging --head ${branch}`,
		);

		console.log(`💬 Adding success comment to issue #${issue.number}...`);
		const commentBody = `
Hello! I've implemented an automated fix for this issue. 
The Pull Request with the changes is now open: ${prUrl}

All local quality checks (lint, build, tests) passed. 
<!-- hammer:fix-applied -->
`.trim();

		await writeFile(commentPath, commentBody);
		runExec(`gh issue comment ${issue.number} --body-file "${commentPath}"`);

		await unlink(prPath);
		await unlink(commentPath);
	} else {
		const failurePath = join(process.cwd(), `failure-${issue.number}.md`);
		console.log(`💬 Adding failure comment to issue #${issue.number}...`);
		const commentBody = `
Hello! I attempted to fix this issue automatically, but the generated code failed local quality checks (lint, build, or tests) after multiple attempts.

The changes have been pushed to the branch \`${branch}\` for human review. 
Please perform a deep analysis of the code and the tests.

**Error Details:**
\`\`\`
${error}
\`\`\`
<!-- hammer:fix-applied -->
`.trim();

		await writeFile(failurePath, commentBody);
		runExec(`gh issue comment ${issue.number} --body-file "${failurePath}"`);
		await unlink(failurePath);
	}
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

	let currentPrompt = buildPrompt(issue, rules, context, agentPrompt);
	let attempts = 0;
	const MAX_ATTEMPTS = 3;
	let lastResponse = "";
	let lastError = "";

	while (attempts < MAX_ATTEMPTS) {
		attempts++;
		console.log(`🤖 [Attempt ${attempts}/${MAX_ATTEMPTS}] Calling Gemini...`);

		const result = await model.generateContent(currentPrompt);
		const response = result.response.text();
		lastResponse = response;

		try {
			await writeFiles(response);

			const resultGate = await verify();
			if (resultGate.success) {
				console.log("✨ Quality Gate PASSED!");
				await commitAndPush(response, issue);
				return;
			}

			console.warn(`❌ Quality Gate FAILED on attempt ${attempts}.`);
			lastError = resultGate.error || "Unknown error";
			console.log(lastError);

			currentPrompt = buildRetryPrompt(currentPrompt, response, lastError);
		} catch (err: unknown) {
			lastError = err instanceof Error ? err.message : String(err);
			console.error(`❌ Error during application on attempt ${attempts}:`, lastError);
			currentPrompt = buildRetryPrompt(currentPrompt, response, lastError);
		}
	}

	console.error("💀 Maximum attempts reached. Pushing anyway for human review.");
	await commitAndPush(lastResponse, issue, lastError);
}

run().catch((err) => {
	console.error("❌ Hammer failed:", err.message);
});
