import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/interface";
import { desc, eq, sql } from "drizzle-orm";
import credentials from "../entity";
import schema from "../schema";

export default async function getById(request: container) {
	request.status(200);

	const validRequest = await schema.actions.id.safeParseAsync(request.params());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("credentials", "find{id}"));

	const { id } = validRequest.data;

	const prepare = repository
		.select()
		.from(credentials)
		.where(eq(credentials.id, sql.placeholder("id")))
		.limit(1)
		.orderBy(desc(credentials.id))
		.prepare("/credentials/id");

	const content = await prepare.execute({ id });

	if (!content.length) throw request.notFound(request.language(), tag("credentials", "find{id}"));

	return content;
}
