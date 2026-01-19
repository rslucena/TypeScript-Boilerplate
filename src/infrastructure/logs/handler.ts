import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import { env } from "@infrastructure/settings/environment";
import pino from "pino";
import type actions from "./interfaces";

const bindings = (bindings: pino.Bindings) => ({ ...bindings, node_version: process.versions.node });

const configs = {
	level: env.LOG_LEVEL,
	redact: ["headers.authorization"],
	enabled: env.SHOW_LOG,
	formatters: { bindings },
};

const folder = `${path.resolve(".")}/temp/`;
!existsSync(folder) ? mkdirSync(folder) : undefined;

const handler = (filename: string) => {
	const shape = settings(filename);
	return pino(shape);
};

const settings = (filename: string) => {
	const file = existsSync(`${folder}/${filename}.log`);
	if (!file) writeFileSync(`${folder}/${filename}.log`, "");
	const transport = {
		target: "pino/file",
		options: { destination: `${folder}/${filename}.log` },
	};
	return { ...configs, transport };
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
	settings,
};

export default Logs;
