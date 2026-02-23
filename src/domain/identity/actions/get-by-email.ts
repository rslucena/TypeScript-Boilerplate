import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import { eq, sql } from "drizzle-orm";
import identity from "../entity";

export default async function getByEmail(email: string) {
	const reference = tag("identity", "find", { email });

	const cached = await cache.json.get<identity[]>(reference);
	if (cached) return cached;

	const prepare = repository
		.select()
		.from(identity)
		.where(eq(identity.email, sql.placeholder("email")))
		.prepare("get_identity_by_email");

	const content = await prepare.execute({ email });

	if (content.length) await cache.json.set(reference, content, 60 * 10);

	return content;
}
