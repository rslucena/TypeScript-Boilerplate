import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import { container } from "@infrastructure/server/interface";
import { eq } from "drizzle-orm";
import credentials from "../entity";
import schema from "../schema";
import getById from "./get-by-id";

export default async function deleteEntity(request: container) {
	request.status(200);

	const validRequest = await schema.actions.id.safeParseAsync(request.params());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("credentials", "delete{id}"));

	const validBody = await schema.actions.delete.safeParseAsync(request.body());
	if (!validBody.success) throw request.badRequest(request.language(), tag("credentials", "delete{id}"));

	const { revokedReason } = validBody.data;

	const content = await repository
		.update(credentials)
		.set({
			revokedAt: new Date(),
			revokedReason: revokedReason ? revokedReason : "manual_revoke",
			activated: false,
		})
		.where(eq(credentials.id, validRequest.data.id))
		.returning();

	if (!content.length) throw request.notFound(request.language(), tag("credentials", "delete"));

	return getById(new container({ params: { id: content[0].id } }));
}
