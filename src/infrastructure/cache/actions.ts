import client from "@infrastructure/cache/connection";
import { safeParse } from "@infrastructure/pipes/safe-parse";
import { env } from "@infrastructure/settings/environment";
import type { actions, setmode } from "./interfaces";

const isStack = () => env.REDIS_STACK;

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
	status: () => client.isOpen,
	ping: () => (client.isOpen ? client.ping() : Promise.resolve("PONG")),
	info: () => (client.isOpen ? client.info() : Promise.resolve("")),
};

async function get<t>({ type, hash }: setmode, force = false): Promise<null | t> {
	if (force || !client.isOpen) return null;

	const useStackJson = isStack() && type === "json";

	if (!hash.endsWith("*")) {
		const action = useStackJson
			? await client.json.get(hash).catch(() => null)
			: await client.get(hash).catch(() => null);

		if (!action) return null;
		if (useStackJson) return action as t;
		return (safeParse<t>(action as string) ?? action) as t;
	}

	const namespace = hash.replace("*", "");
	const setKey = `${namespace}:keys`;
	const keys = await client.sMembers(setKey).catch(() => []);
	if (!keys.length) return null;

	let results: (string | null | unknown)[];
	if (useStackJson) {
		const mget = await client.json.mGet(keys, "$").catch(() => []);
		results = mget.map((item) => (Array.isArray(item) ? item[0] : item));
	} else {
		results = await client.mGet(keys).catch(() => []);
	}

	const contents: { [key: string]: t | null } = {};
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const action = results[i];
		if (action === null || action === undefined) contents[key] = null;
		else if (useStackJson) contents[key] = action as t;
		else contents[key] = (safeParse<t>(action as string) ?? action) as t;
	}

	return contents as unknown as t;
}

async function set({ type, hash, vals, ttl, key }: setmode): Promise<string | null> {
	if (!client.isOpen) return null;

	const namespace = hash.split("{")[0];
	if (namespace && namespace !== hash) {
		await client.sAdd(`${namespace}:keys`, hash).catch(() => null);
	}

	const useStackJson = isStack() && type === "json";
	const data = useStackJson ? JSON.parse(JSON.stringify(vals)) : typeof vals === "string" ? vals : JSON.stringify(vals);

	const action = useStackJson
		? await client.json.set(hash, key ?? "$", data).catch(() => null)
		: await client.set(hash, data as string).catch(() => null);

	if (ttl) await client.expire(hash, ttl).catch(() => null);
	return action as string | null;
}

async function del({ hash }: setmode): Promise<number> {
	if (!client.isOpen) return 0;

	if (hash.endsWith("*")) {
		const namespace = hash.replace("*", "");
		const setKey = `${namespace}:keys`;
		const keys = await client.sMembers(setKey).catch(() => []);
		if (!keys.length) return 0;

		await client.del([...keys, setKey]).catch(() => null);
		return keys.length;
	}

	const result = await client.del(hash).catch(() => 0);
	return result;
}

export default cache;