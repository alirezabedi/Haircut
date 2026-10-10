import "server-only";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export const DB_PATH = path.join(process.cwd(), "data", "haircut.db");

function open() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

// Reuse one connection across dev hot reloads.
const globalForDb = globalThis as unknown as { db?: ReturnType<typeof open> };
export const db = globalForDb.db ?? open();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
