import fs from "node:fs";
import path from "node:path";
import { build, type Options } from "tsup";
import pm2Workspace from "./pm2-workspace";

const [command] = process.argv.slice(2) as [string | undefined];

const worker = !command ? undefined : command.replace("--", "").split("=");
const jobs = worker ? pm2Workspace.find((configs) => configs.name === worker[1]) : pm2Workspace;

if (!jobs) {
	console.error(new Error("Unable to locate the script, provider, or container for execution."));
	process.exit();
}

const rootdir = process.cwd();
const tsPath = path.resolve(rootdir, "tsconfig.json");

function readJsonWithComments(filePath: string) {
	const content = fs.readFileSync(filePath, "utf-8");
	const clean = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
	return JSON.parse(clean);
}

const config = readJsonWithComments(tsPath);
const excludes: string[] = (config.exclude || []).map((v: string) => v.replace("/**", "").replace("/*", ""));

const outers = new Set<string>();
const crossdependency = new Set<string>();
const processed = new Set<string>();

const execution = path.resolve(rootdir, "./src/commands/exec-process.ts");
dependencies(execution);
crossdependency.add(execution);

const workspace = Array.isArray(jobs) ? jobs : [jobs];
for (let i = 0; i < workspace.length; i++) {
	const job = path.resolve(rootdir, workspace[i].tsx);
	dependencies(job);
	crossdependency.add(job);
}

function resolveModule(moduleName: string, currentFileDir: string): string | null {
	let targetPath: string;

	if (moduleName.startsWith("@commands/")) {
		targetPath = path.resolve(rootdir, "./src/commands", moduleName.slice("@commands/".length));
	} else if (moduleName.startsWith("@domain/")) {
		targetPath = path.resolve(rootdir, "./src/domain", moduleName.slice("@domain/".length));
	} else if (moduleName.startsWith("@infrastructure/")) {
		targetPath = path.resolve(rootdir, "./src/infrastructure", moduleName.slice("@infrastructure/".length));
	} else if (moduleName.startsWith("@providers/")) {
		targetPath = path.resolve(rootdir, "./src/functions", moduleName.slice("@providers/".length));
	} else if (moduleName.startsWith("@tests/")) {
		targetPath = path.resolve(rootdir, "./tests", moduleName.slice("@tests/".length));
	} else if (moduleName.startsWith("@templates/")) {
		targetPath = path.resolve(rootdir, "./src/templates", moduleName.slice("@templates/".length));
	} else if (moduleName.startsWith(".")) {
		targetPath = path.resolve(currentFileDir, moduleName);
	} else {
		return null;
	}

	const candidates = [
		targetPath,
		`${targetPath}.ts`,
		`${targetPath}.tsx`,
		path.join(targetPath, "index.ts"),
		path.join(targetPath, "index.tsx"),
	];

	for (const cand of candidates) {
		if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
			return cand;
		}
	}

	return null;
}

function getImports(content: string): string[] {
	const results: string[] = [];
	const regex = /(?:import|export)\s+[\s\S]*?\s+from\s+["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;
	for (const match of content.matchAll(regex)) {
		const specifier = match[1] || match[2];
		if (specifier) {
			results.push(specifier);
		}
	}
	return results;
}

function dependencies(entry: string) {
	if (processed.has(entry)) return;

	const exclude = excludes.some((term) => entry.includes(term.toString()));
	if (exclude) return;

	const directory = path.dirname(entry);
	if (fs.existsSync(directory)) {
		for (const file of fs.readdirSync(directory)) {
			const fullPath = path.join(directory, file);
			const status = fs.statSync(fullPath);
			if (status.isFile() && path.extname(file) !== ".ts") outers.add(fullPath);
		}
	}

	processed.add(entry);
	if (!fs.existsSync(entry)) return;

	const content = fs.readFileSync(entry, "utf-8");
	const moduleNames = getImports(content);

	for (const moduleName of moduleNames) {
		const resolvedFileName = resolveModule(moduleName, directory);
		if (resolvedFileName) {
			const isEx = excludes.some((term) => resolvedFileName.includes(term.toString()));
			if (!isEx) {
				crossdependency.add(resolvedFileName);
				dependencies(resolvedFileName);
			}
		}
	}
}

async function execute(dependency: string[]) {
	const tsupConfig: Options = {
		format: ["esm"],
		entry: dependency,
		tsconfig: tsPath,
		dts: false,
		clean: true,
		bundle: true,
		minify: true,
		outDir: "dist",
		metafile: true,
		splitting: false,
		platform: "node",
		sourcemap: false,
		minifySyntax: true,
		minifyWhitespace: true,
		minifyIdentifiers: true,
		env: { NODE_ENV: "production" },
	};
	await build(tsupConfig)
		.then(async () => await saveouthers(Array.from(outers)))
		.catch((err) => console.error(err))
		.finally(() => process.exit());
}

async function saveouthers(files: string[]) {
	for (let i = 0; i < files.length; i++) {
		const sourcePath = files[i];
		const destPath = sourcePath.replace(path.join(rootdir, "src"), path.join(rootdir, "dist"));

		const destDir = path.dirname(destPath);
		if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

		const content = fs.readFileSync(sourcePath, "utf-8");
		fs.writeFileSync(destPath, content);
	}
}

await execute(Array.from(crossdependency));
