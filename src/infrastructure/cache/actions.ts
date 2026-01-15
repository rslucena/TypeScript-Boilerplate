import { safeParse } from "@infrastructure/server/transforms";
import { env } from "@infrastructure/settings/environment";
import client from "./connection";
import type { actions, setmode } from "./interfaces";

const isStack = () => env.REDIS_STACK;

const cache: actions = {
	text: {
		del: (hash) => del({ type: "text", hash } as setmode),
		get: <t>(hash: string, force?: boolean) => get<t>({ hash, type: "text" } as setmode, force),
		set: (hash, vals, ttl, tags) => set({ type: "text", hash, vals, ttl, tags }).catch(() => ""),
	},
	json: {
		del: (hash) => del({ type: "json", hash } as setmode),
		get: <t>(hash: string, force?: boolean) => get<t>({ hash, type: "json" } as setmode, force),
		set: (hash, vals, ttl, tags) => set({ type: "json", hash, vals, ttl, tags }).catch(() => ""),
	},
	invalidate: (tag) => invalidate(tag),
	ping: () => client.ping(),
};

async function get<t>({ hash }: setmode, force = false): Promise<null | t> {
	if (force) return null;
	const action = await (isStack() ? client.json.get(hash) : client.get(hash));
	if (!action) return null;

	if (isStack()) return action as t;
	return safeParse<t>(action as string) ?? (action as t);
}

async function set({ hash, vals, ttl, tags }: setmode): Promise<string | null> {
	if (!isStack()) vals = JSON.stringify(vals);

	const action = await (isStack()
		? client.json.set(hash, "$", JSON.parse(JSON.stringify(vals)))
		: client.set(hash, vals as string));

	if (ttl) await client.expire(hash, ttl);

	if (tags?.length) for (const tag of tags) await client.sAdd(`tags/${tag}`, hash);

	return action;
}

async function del({ hash }: setmode): Promise<number> {
	return await client.del(hash);
}

async function invalidate(tag: string): Promise<number> {
	const tagKey = `tags:${tag}`;
	const keys = await client.sMembers(tagKey);
	if (!keys.length) return 0;
	await client.del(keys);
	await client.del(tagKey);
	return keys.length;
}

export default cache;
