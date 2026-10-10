// Applies Drizzle migrations from ./drizzle to ./data/haircut.db (creating it if needed).
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const dbPath = path.join(process.cwd(), "data", "haircut.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

migrate(drizzle(sqlite), { migrationsFolder: path.join(process.cwd(), "drizzle") });
sqlite.close();

console.log(`Migrations applied to ${path.relative(process.cwd(), dbPath)}`);
