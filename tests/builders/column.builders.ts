import type { Mock } from "bun:test";
import { mock } from "bun:test";

export interface Column {
	name: string;
	dataType: string;
	notNullValue: boolean;
	uniqueValue: boolean;
	primaryKeyValue: boolean;
	defaultRandomValue: boolean;
	defaultNowValue: boolean;
	notNull: Mock<() => Column>;
	unique: Mock<() => Column>;
	primaryKey: Mock<() => Column>;
	defaultRandom: Mock<() => Column>;
	defaultNow: Mock<() => Column>;
	default: Mock<() => Column>;
	setName: Mock<(name: string) => Column>;
	defaultConfig: Record<string, unknown>;
	indexConfig: Record<string, unknown>;
}

const columnBuilder = (): Column => {
	const col: Column = {
		name: "column",
		dataType: "string",
		notNullValue: false,
		uniqueValue: false,
		primaryKeyValue: false,
		defaultRandomValue: false,
		defaultNowValue: false,
		notNull: mock(() => {
			col.notNullValue = true;
			return col;
		}),
		unique: mock(() => {
			col.uniqueValue = true;
			return col;
		}),
		primaryKey: mock(() => {
			col.primaryKeyValue = true;
			return col;
		}),
		defaultRandom: mock(() => {
			col.defaultRandomValue = true;
			return col;
		}),
		defaultNow: mock(() => {
			col.defaultNowValue = true;
			return col;
		}),
		default: mock(() => col),
		setName: mock((name: string) => {
			col.name = name;
			return col;
		}),
		defaultConfig: {},
		indexConfig: {},
	};
	return col;
};

const pgTableBuilder = mock((_, columns, callback) => {
	const table = { ...columns, $inferSelect: {} };
	if (typeof callback === "function") callback(table);
	return table;
});

const varcharBuilder = mock((name: string, options?: { length?: number }): Column => {
	const col = columnBuilder();
	col.name = name;
	col.notNullValue = !options?.length;
	return col;
});

const pgIndexBuilder = mock((..._args) => {
	return {};
});

export { columnBuilder, pgIndexBuilder, pgTableBuilder, varcharBuilder };
