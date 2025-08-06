import fs from "fs/promises";
import path from "path";

export const read = async (table) => {
  const tablePath = path.join("data", `${table}.json`);

  const data = await fs.readFile(tablePath, "utf-8");

  return JSON.parse(data);
};

export const write = async (table, record) => {
  const tablePath = path.join("data", `${table}.json`);

  const parsedData = await read(table);

  parsedData.push(record);

  await fs.writeFile(tablePath, JSON.stringify(parsedData, null, 2));
};

export const clearAndWrite = async (table, records) => {
  const tablePath = path.join("data", `${table}.json`);

  await fs.writeFile(tablePath, JSON.stringify(records, null, 2));
};
