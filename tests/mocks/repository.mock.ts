import { mock } from "bun:test";

interface RepositoryMock {
	select: ReturnType<typeof mock<() => RepositoryMock>>;
	from: ReturnType<typeof mock<() => RepositoryMock>>;
	where: ReturnType<typeof mock<() => RepositoryMock>>;
	limit: ReturnType<typeof mock<() => RepositoryMock>>;
	orderBy: ReturnType<typeof mock<() => RepositoryMock>>;
	prepare: ReturnType<typeof mock<() => RepositoryMock>>;
	$dynamic: ReturnType<typeof mock<() => RepositoryMock>>;
	execute: ReturnType<typeof mock<() => Promise<unknown[]>>>;
	insert: ReturnType<typeof mock<() => RepositoryMock>>;
	update: ReturnType<typeof mock<() => RepositoryMock>>;
	set: ReturnType<typeof mock<() => RepositoryMock>>;
	values: ReturnType<typeof mock<() => RepositoryMock>>;
	onConflictDoNothing: ReturnType<typeof mock<() => RepositoryMock>>;
	returning: ReturnType<typeof mock<() => Promise<unknown[]>>>;
	[key: string]: unknown;
}

export const createRepositoryMock = (): RepositoryMock => {
	const mockObj: RepositoryMock = {
		select: mock(() => mockObj),
		from: mock(() => mockObj),
		where: mock(() => mockObj),
		limit: mock(() => mockObj),
		orderBy: mock(() => mockObj),
		prepare: mock(() => mockObj),
		$dynamic: mock(() => mockObj),
		execute: mock().mockResolvedValue([]),
		insert: mock(() => mockObj),
		update: mock(() => mockObj),
		set: mock(() => mockObj),
		values: mock(() => mockObj),
		onConflictDoNothing: mock(() => mockObj),
		returning: mock().mockResolvedValue([]),
	};
	return mockObj;
};

export const repositoryMock = createRepositoryMock();
