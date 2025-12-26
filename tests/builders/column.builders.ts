import { mock } from "bun:test";

const columnBuilder = () => {
	const col = {
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
	};
	return col;
};

const pgTableBuilder = mock((_, columns, callback) => {
	const table = { ...columns, $inferSelect: {} };
	if (typeof callback === "function") callback(table);
	return table;
});

const varcharBuilder = mock((name, options) => {
	const col = columnBuilder();
	col.name = name;
	col.notNullValue = !options?.length;
	return col;
});

const pgIndexBuilder = mock((...args) => {
	return {};
});

export { columnBuilder, pgIndexBuilder, pgTableBuilder, varcharBuilder };
