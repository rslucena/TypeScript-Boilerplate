import path from "node:path";

if (!process.argv[2]) {
	console.error("Please provide a name: bun gen:domain <name>");
	process.exit(1);
}

const name = process.argv[2];
const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
const domainPath = path.join(process.cwd(), "src", "domain", name);
const testsPath = path.join(process.cwd(), "tests", "unit", "domain", name);
const tplDir = path.join(process.cwd(), "src", "templates", "domain");

const render = (content: string, vars: Record<string, string>) =>
	content.replace(/__name__/g, vars.name).replace(/__Capitalized__/g, vars.capitalized);

async function loadTemplate(filename: string) {
	return Bun.file(path.join(tplDir, filename)).text();
}

const templates = {
	entity: await loadTemplate("entity.ts"),
	schema: await loadTemplate("schema.ts"),
	routes: await loadTemplate("routes.ts"),
	actions: {
		getById: await loadTemplate("actions/get-by-id.ts"),
		findByParams: await loadTemplate("actions/get-find-by-params.ts"),
		create: await loadTemplate("actions/post-new-entity.ts"),
		update: await loadTemplate("actions/put-update-entity.ts"),
		delete: await loadTemplate("actions/delete-entity.ts"),
	},
};

const vars = { name, capitalized };

console.log(`🚀 Generating domain: ${name}...`);

const writes = [
	Bun.write(path.join(domainPath, "entity.ts"), render(templates.entity, vars)),
	Bun.write(path.join(domainPath, "schema.ts"), render(templates.schema, vars)),
	Bun.write(path.join(domainPath, "routes.ts"), render(templates.routes, vars)),
	Bun.write(path.join(domainPath, "actions", "get-by-id.ts"), render(templates.actions.getById, vars)),
	Bun.write(path.join(domainPath, "actions", "get-find-by-params.ts"), render(templates.actions.findByParams, vars)),
	Bun.write(path.join(domainPath, "actions", "post-new-entity.ts"), render(templates.actions.create, vars)),
	Bun.write(path.join(domainPath, "actions", "put-update-entity.ts"), render(templates.actions.update, vars)),
	Bun.write(path.join(domainPath, "actions", "delete-entity.ts"), render(templates.actions.delete, vars)),
];

Bun.spawn(["mkdir", "-p", path.join(domainPath, "actions")]);
Bun.spawn(["mkdir", "-p", testsPath]);

await Promise.all(writes);

const webserverPath = path.join(process.cwd(), "src", "functions", "http-primary-webserver.ts");
const webserverFile = Bun.file(webserverPath);

if (await webserverFile.exists()) {
	let content = await webserverFile.text();
	const importStatement = `import ${name}Routes from "@domain/${name}/routes";`;
	const registerStatement = `	server.register(${name}Routes, { prefix: "/api/v1/${name}s" });`;

	if (!content.includes(importStatement)) {
		const lastImportIndex = content.lastIndexOf("import ");

		if (lastImportIndex !== -1) {
			const endOfLastImport = content.indexOf("\n", lastImportIndex);
			content = `${content.slice(0, endOfLastImport + 1) + importStatement}\n${content.slice(endOfLastImport + 1)}`;
		}

		const lastRegisterIndex = content.lastIndexOf("server.register(");

		if (lastRegisterIndex !== -1) {
			const endOfLastRegister = content.indexOf(");", lastRegisterIndex);
			const endOfLine = content.indexOf("\n", endOfLastRegister);
			content = `${content.slice(0, endOfLine + 1) + registerStatement}\n${content.slice(endOfLine + 1)}`;
		}

		if (lastRegisterIndex === -1) {
			const serverCreate = content.indexOf("webserver.create()");
			if (serverCreate !== -1) {
				const endOfLine = content.indexOf("\n", serverCreate);
				content = `${content.slice(0, endOfLine + 1) + registerStatement}\n${content.slice(endOfLine + 1)}`;
			}
		}

		await Bun.write(webserverPath, content);
		console.log(`\n🔗 Injected route into http-primary-webserver.ts`);
	}
}

console.log(`\n✅ Domain "${name}" generated successfully!`);
console.log(`\n📍 Location: src/domain/${name}`);

console.log(`\n🎨 Running formatter...`);
Bun.spawn(["bunx", "biome", "check", "--write", domainPath, webserverPath]);

console.log(`\n✨ Done!`);
