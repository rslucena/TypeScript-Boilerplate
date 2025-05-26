import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import pino from "pino";
import type actions from "./interfaces";

const bindings = (bindings: pino.Bindings) => ({ ...bindings, node_version: process.versions.node });

const configs = {
	level: process.env.LOG_LEVEL ?? "info",
	redact: ["headers.authorization"],
	enabled: process.env.SHOW_LOG === "true",
	formatters: { bindings },
};

const folder = `${path.resolve(".")}/temp/`;
!existsSync(folder) ? mkdirSync(folder) : undefined;

const handler = (filename: string) => {
	const file = existsSync(`${folder}/${filename}.log`);
	if (!file) writeFileSync(`${folder}/${filename}.log`, "");
	return pino({
		...configs,
		...{
			transport: {
				target: "pino/file",
				options: { destination: `${folder}/${filename}.log` },
			},
		},
	});
};

const terminal: actions["console"] = {
	error: (message, props) => console.debug(message, props),
	warn: (message, props) => console.debug(message, props),
	info: (props) => console.debug(props),
	debug: (props) => console.debug(props),
};

export const Logs: actions = {
	console: terminal,
	handler,
};

export default Logs;
