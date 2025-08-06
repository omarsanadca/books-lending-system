import fs from "fs/promises";

const data = await fs.readFile("data/authors.json", "utf-8");
console.log(data);