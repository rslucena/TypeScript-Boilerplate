import { mock } from "bun:test";

const notNullValue = <T extends { notNullValue: boolean }>(col: T) => { col.notNullValue = true; return col }
const uniqueValue = <T extends { uniqueValue: boolean }>(col: T) => { col.uniqueValue = true; return col};
const primaryKeyValue = <T extends { primaryKeyValue: boolean }>(col: T) => { col.primaryKeyValue = true;return col};
const defaultRandomValue = <T extends { defaultRandomValue: boolean }>(col: T) => { col.defaultRandomValue = true; return col};
const defaultNowValue = <T extends { defaultNowValue: boolean }>(col: T) => { col.defaultNowValue = true; return col};

const columnBuilder = () => {
  const col = {
    name: "column",
    dataType: "string",
    notNullValue: false,
    uniqueValue: false,
    primaryKeyValue: false,
    defaultRandomValue: false,
    defaultNowValue: false,
    notNull: mock(() => notNullValue),
    unique: mock(() => uniqueValue),
    primaryKey: mock(() => primaryKeyValue),
    defaultRandom: mock(() => defaultRandomValue),
    defaultNow: mock(() => defaultNowValue),
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
