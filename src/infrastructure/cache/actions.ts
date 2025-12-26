import { safeParse } from "@infrastructure/server/transforms";
import client from "./connection";
import type { actions, setmode } from "./interfaces";

const isStack = () => String(process.env.REDIS_STACK) === "true";

const cache: actions = {
	text: {
		del: (hash) => del({ type: "text", hash } as setmode),
		get: <t>(hash: string, force?: boolean) => get<t>({ hash, type: "text" } as setmode, force),
		set: (hash, vals, ttl) => set({ type: "text", hash, vals, ttl }).catch(() => ""),
	},
	json: {
		del: (hash) => del({ type: "json", hash } as setmode),
		get: <t>(hash: string, force?: boolean) => get<t>({ hash, type: "json" } as setmode, force),
		set: (hash, vals, ttl, key) => set({ type: "json", hash, vals, ttl, key }).catch(() => ""),
	},
	ping: () => client.ping(),
};

async function get<t>({ type, hash }: setmode, force = false): Promise<null | t> {
	if (force) return null;
	const keys = await scan(hash);
	if (!keys) return null;
	const actions = {
		text: async () => await client.get(hash),
		json: async () => await client.json.get(hash),
	};
	const contents: { [key: string]: t | null } = {};
	for (let i = 0; i < keys.length; i++) {
		const action = await actions[isStack() ? type : "text"]();
		if (!action) contents[hash] = null;
		else if (isStack()) contents[hash] = action as t;
		else contents[hash] = safeParse<t>(action as string) ?? (action as t);
	}
	return contents as t;
}

async function set({ type, hash, vals, ttl, key }: setmode): Promise<string | null> {
	if (!isStack()) vals = JSON.stringify(vals);
	const actions = {
		text: async () => await client.set(hash, vals as string),
		json: async () => await client.json.set(hash, key ?? "$", JSON.parse(JSON.stringify(vals))),
	};
	const action = actions[isStack() ? type : "text"]();
	if (ttl) await client.expire(hash, ttl);
	return action;
}

async function del({ hash }: setmode): Promise<number> {
	const keys = await scan(`${hash}*`);
	if (!keys.length) return 0;
	for (const key of keys) await client.del(key);
	return keys.length;
}

async function scan(hash: string) {
	let cursor = "0";
	const keys = [];
	do {
		const reply = await client.scan(cursor, { MATCH: hash });
		cursor = reply.cursor;
		keys.push(...reply.keys);
	} while (cursor !== "0");
	if (!keys.length) return [];
	return keys;
}

export default cache;
