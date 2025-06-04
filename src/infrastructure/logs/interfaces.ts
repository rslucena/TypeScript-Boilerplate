import type { Logger, LoggerOptions } from "pino";

export default interface actions {
	console: methods;
	handler: (filename: string) => Logger;
	settings: (filename: string) => LoggerOptions;
}

interface methods {
	error: (message: string, props?: object | string) => void;
	warn: (message: string, props?: object | string) => void;
	info: (props: object | string) => void;
	debug: (props: object | string) => void;
}
