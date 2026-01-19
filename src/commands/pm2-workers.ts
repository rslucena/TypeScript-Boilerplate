import { type ChildProcess, spawn } from "node:child_process";
import { messages } from "@infrastructure/messages/actions";
import pm2 from "pm2";
import pm2Commands from "./pm2-commands";
import type { ProcHeart, worker } from "./pm2-workspace";

const isDev = process.env.npm_lifecycle_event === "dev";
const isBun = typeof Bun !== "undefined";
const engineer = isDev ? (isBun ? "bun" : "tsx") : isBun ? "bun" : "node";
const abort = { signal: AbortSignal.timeout(1000) };

async function debug(jobs: worker[]) {
	const children: ChildProcess[] = [];

	for (let i = 0; i < jobs.length; i++) {
		const command = `${engineer} ${isBun ? "--watch" : "watch"} --env-file=.env -- ${jobs[i].tsx}`;
		const child = spawn(command, { stdio: "inherit", shell: true });
		children.push(child);
		child.on("error", (error) => console.error("command error:", error));
		child.on("close", (code) => {
			if (code !== 0) console.error(`command exited with code ${code}`);
		});
	}

	const cleanup = () => {
		for (const child of children) {
			child.kill();
		}
		process.exit();
	};

	process.on("SIGINT", cleanup);
	process.on("SIGTERM", cleanup);

	setInterval(() => {}, 1000);
}

async function execute(jobs: worker[], force?: boolean) {
	pm2.connect(async (err) => {
		if (err) {
			console.error(err);
			process.exit();
		}
		if (!jobs.length) {
			console.log(new Error("Unable to locate the script, provider, or container for execution."));
			process.exit();
		}

		const workers = Promise.all(jobs.map((job) => pm2Commands.start(engineer, job, force)));

		workers.catch((err) => console.error(err));

		workers.then(async (workers) => {
			for (let i = 0; i < workers.length; i++) {
				const worker = workers[i] as ProcHeart;
				if (!worker.heartbeat) continue;
				const updown = worker.status === "online" ? "up" : "down";
				await fetch(`${worker.heartbeat}?status=${updown}`, abort).catch(() => null);
			}
			pm2Commands.list(engineer);
		});

		await messages.sub("workers:server:info", async (message: unknown) =>
			pm2Commands.info(message as string, engineer),
		);

		await messages.sub("workers:server:restart", async (message: unknown) => pm2Commands.restart(message as string));
	});
}

export default { execute, debug };
