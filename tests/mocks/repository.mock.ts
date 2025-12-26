import { mock } from "bun:test";

interface repositoryMock {
	select: ReturnType<typeof mock<() => repositoryMock>>;
	from: ReturnType<typeof mock<() => repositoryMock>>;
	where: ReturnType<typeof mock<() => repositoryMock>>;
	limit: ReturnType<typeof mock<() => repositoryMock>>;
	orderBy: ReturnType<typeof mock<() => repositoryMock>>;
	prepare: ReturnType<typeof mock<() => repositoryMock>>;
	$dynamic: ReturnType<typeof mock<() => repositoryMock>>;
	execute: ReturnType<typeof mock<() => Promise<unknown[]>>>;
	insert: ReturnType<typeof mock<() => repositoryMock>>;
	values: ReturnType<typeof mock<() => repositoryMock>>;
	onConflictDoNothing: ReturnType<typeof mock<() => repositoryMock>>;
	returning: ReturnType<typeof mock<() => Promise<unknown[]>>>;
	[key: string]: unknown;
}

export const repositoryMock: repositoryMock = {
	select: mock(() => repositoryMock),
	from: mock(() => repositoryMock),
	where: mock(() => repositoryMock),
	limit: mock(() => repositoryMock),
	orderBy: mock(() => repositoryMock),
	prepare: mock(() => repositoryMock),
	$dynamic: mock(() => repositoryMock),
	execute: mock().mockResolvedValue([]),
	insert: mock(() => repositoryMock),
	values: mock(() => repositoryMock),
	onConflictDoNothing: mock(() => repositoryMock),
	returning: mock().mockResolvedValue([]),
};
