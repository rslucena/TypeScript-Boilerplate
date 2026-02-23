import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import { and, eq, sql } from "drizzle-orm";
import credentials from "../entity";

export default async function getByProviderSubject(provider: string, subject: string) {
	const reference = tag("credentials", "find", { provider, subject });

	const cached = await cache.json.get<credentials[]>(reference);
	if (cached) return cached;

	const prepare = repository
		.select()
		.from(credentials)
		.where(
			and(eq(credentials.provider, sql.placeholder("provider")), eq(credentials.subject, sql.placeholder("subject"))),
		)
		.prepare("get_credentials_by_provider_subject");

	const content = await prepare.execute({ provider, subject });

	if (content.length) await cache.json.set(reference, content, 60 * 10);

	return content;
}
