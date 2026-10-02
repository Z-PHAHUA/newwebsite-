import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// DATABASE_URL can point to the local Postgres OR a Supabase Postgres
// connection string (Project Settings → Database → Connection string, use the
// "Transaction pooler" URI on port 6543 for serverless deployments).
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const isSupabase = /supabase\.(co|com)/.test(databaseUrl) || process.env.DATABASE_SSL === "true";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: isSupabase ? 5 : 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
