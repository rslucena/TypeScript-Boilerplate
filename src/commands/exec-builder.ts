import fs from "node:fs";
import path from "node:path";
import { build, type Options } from "tsup";
import ts from "typescript";
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

const config = ts.readConfigFile(tsPath, ts.sys.readFile).config;
const commandline = ts.parseJsonConfigFileContent(
	config,
	{
		fileExists: ts.sys.fileExists,
		readFile: ts.sys.readFile,
		readDirectory: ts.sys.readDirectory,
		useCaseSensitiveFileNames: true,
	},
	path.dirname(tsPath),
);

const outers = new Set<string>();
const crossdependency = new Set<string>();
const processed = new Set<string>();
const excludes: string[] = config.exclude.map((v: string) => v.replace("/**", ""));
const programTS = ts.createProgram(commandline.fileNames, commandline.options);

const execution = path.resolve(rootdir, "./src/commands/exec-process.ts");
dependencies(execution);
crossdependency.add(execution);

const workspace = Array.isArray(jobs) ? jobs : [jobs];
for (let i = 0; i < workspace.length; i++) {
	const job = path.resolve(rootdir, workspace[i].tsx);
	dependencies(job);
	crossdependency.add(job);
}

function dependencies(entry: string) {
	if (processed.has(entry)) return;

	const exclude = excludes.some((term) => entry.includes(term.toString()));
	if (exclude) return;

	const directory = path.dirname(entry);
	for (const file of fs.readdirSync(directory)) {
		const fullPath = path.join(directory, file);
		const status = fs.statSync(fullPath);
		if (status.isFile() && path.extname(file) !== ".ts") outers.add(fullPath);
	}

	processed.add(entry);
	const source = programTS.getSourceFile(entry);
	if (!source) throw new Error("File not found");

	source.forEachChild((node) => nodes(node, source));
}

function nodes(node: ts.Node, source: ts.SourceFile) {
	const imports = ts.isImportDeclaration(node) || ts.isExportDeclaration(node);
	if (!imports) return;
	const specifier = node.moduleSpecifier;
	if (!specifier || !ts.isStringLiteral(specifier)) return;
	const moduleName = specifier.text;
	const resolve = ts.resolveModuleName(moduleName, source.fileName, commandline.options, ts.sys);
	if (!resolve.resolvedModule) return;
	const resolvedFileName = resolve.resolvedModule.resolvedFileName;
	const exclude = excludes.some((term) => resolvedFileName.includes(term.toString()));
	if (exclude) return;
	crossdependency.add(resolvedFileName);
	dependencies(resolvedFileName);
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
