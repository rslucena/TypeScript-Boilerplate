export interface functions {
	set: (hash: string, vals: string | object, ttl?: number, tags?: string[]) => Promise<string | null>;
	get: <t>(hash: string, force?: boolean) => Promise<t | null>;
	del: (hash: string) => Promise<number>;
}

export interface setmode {
	type: "json" | "text";
	hash: string;
	vals: string | object;
	ttl?: number;
	tags?: string[];
}

export interface actions {
	text: functions;
	json: functions;
	invalidate: (tag: string) => Promise<number>;
	ping: () => Promise<string>;
}
