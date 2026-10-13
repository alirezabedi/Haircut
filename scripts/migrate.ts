// Applies Drizzle migrations to ./data/haircut.db (creating it if needed), then seeds the
// first shop with 100 credits if there is no shop yet (docs/SPEC.md §4).
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../lib/db/schema";
import { seedFirstShop } from "../lib/db/seed";

const dbPath = path.join(process.cwd(), "data", "haircut.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
const seeded = seedFirstShop(db);
sqlite.close();

console.log(`Migrations applied to ${path.relative(process.cwd(), dbPath)}`);
if (seeded) console.log("Seeded the first shop with 100 credits.");
