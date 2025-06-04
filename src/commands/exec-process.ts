import pm2Workers from "@commands/pm2-workers";
import pm2Workspace, { type worker } from "@commands/pm2-workspace";

const [command] = process.argv.slice(2) as [string | undefined];
if (!command) throw new Error("Command not found.");

const scripts = command.replace("--", "").split("=");
if (!["workers", "group"].includes(scripts[0])) throw new Error("Worker not found.");

let jobs: worker[] = [];
const mode = scripts[0] === "workers" ? "workers" : "group";

if (mode === "workers") jobs = pm2Workspace.filter((configs) => configs.name === scripts[1]);
if (mode === "group") jobs = pm2Workspace.filter((configs) => configs.group === scripts[1]);

if (!jobs.length) {
	console.error("Group or Worker not found.");
	process.exit();
}

process.argv[1].endsWith(".ts") ? await pm2Workers.debug(jobs) : await pm2Workers.execute(jobs, true);
