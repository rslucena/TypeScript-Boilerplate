import Logs from "@infrastructure/logs/handler";
import pm2, { type Proc, type ProcessDescription } from "pm2";
import type { worker } from "./pm2-workspace";

function format(args: ProcessDescription, eng: string) {
	const { pid, name, pm2_env, monit } = args;
	return {
		pid,
		name,
		engine: eng,
		status: pm2_env?.status,
		trigger: `${(monit?.memory ?? 0) / 1024 / 1024}mb`,
	};
}

const list = (engine: "tsx" | "node" | "bun") =>
	pm2.list((err, list) => {
		if (err) return Logs.console.error("Unable to list the workers.", err);
		console.table(list.map((worker) => format(worker, engine)));
	});

const start = (engine: "tsx" | "node" | "bun", worker: worker, force?: boolean) =>
	new Promise((resolve, reject) => {
		if (engine === "tsx")
			Object.assign(worker.options, {
				autorestart: false,
				interpreter_args: "--import tsx",
			});
		if (!force && !worker.activated) return resolve(null);
		const job = {
			name: worker.name,
			script: worker[engine],
			watch: engine === "tsx",
			...worker.options,
		};
		pm2.start(job, (err, app: Proc) => (err ? reject(err) : resolve({ ...app, ...worker })));
	});

const info = (name: string | undefined, engine: string) =>
	pm2.list((err, list) => {
		if (err) return Logs.console.error("Unable to list the workers.", err);
		const worker = list.find((worker) => worker.name === name);
		if (!worker) return Logs.console.error("Unable to locate the worker.");
		console.table(format(worker, engine));
	});

const restart = (name: string | undefined) =>
	pm2.list((err, list) => {
		if (err) return Logs.console.error("Unable to list the workers.", err);
		const worker = list.find((worker) => worker.name === name);
		if (!worker) return Logs.console.error("Unable to locate the worker.");
		pm2.restart(worker.name as string, (err, app) => (err ? console.log(err) : console.table(app)));
	});

const find = (listprocess: pm2.ProcessDescription[], name: string | undefined) =>
	listprocess.find((el) => el.name === name);

export default { start, list, info, find, restart };
