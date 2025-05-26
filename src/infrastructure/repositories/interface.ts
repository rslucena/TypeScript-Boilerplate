import type { AnyType } from "@infrastructure/server/interface";

export type refer = {
	domain: string;
	method: string;
	conditions: { [key: string]: AnyType };
};
