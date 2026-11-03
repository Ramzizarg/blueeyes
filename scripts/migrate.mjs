import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schema = readFileSync(resolve(root, "db/schema.sql"), "utf8");

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED or DATABASE_URL is required");
  process.exit(1);
}

const statements = schema
  .split(";")
  .map((s) =>
    s
      .split("\n")
      .map((line) => line.replace(/--.*$/, ""))
      .join("\n")
      .trim(),
  )
  .filter(Boolean);

const sql = neon(url);
for (const statement of statements) {
  await sql.query(statement);
  console.log(`OK: ${statement.slice(0, 60).replace(/\s+/g, " ")}…`);
}
console.log("Applied db/schema.sql");
