import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import { and, eq, sql } from "drizzle-orm";
import credentials from "../entity";
import { default as schema } from "../schema";

export default async function getFindByParams(params: { provider?: string; subject?: string; identityId?: string }) {
	const validRequest = await schema.actions.find.safeParseAsync(params);
	if (!validRequest.success) throw new Error("Invalid find parameters");

	const { data } = validRequest;
	const reference = tag("credentials", "find", data);

	const cached = await cache.json.get<credentials[]>(reference);
	if (cached) return cached;

	const prepare = repository
		.select()
		.from(credentials)
		.where(
			and(
				data.provider ? eq(credentials.provider, sql.placeholder("provider")) : undefined,
				data.subject ? eq(credentials.subject, sql.placeholder("subject")) : undefined,
				data.identityId ? eq(credentials.identityId, sql.placeholder("identityId")) : undefined,
			),
		)
		.prepare("get_credentials_by_params");

	const content = await prepare.execute(validRequest.data);

	if (content.length) await cache.json.set(reference, content, 60 * 10);

	return content;
}
