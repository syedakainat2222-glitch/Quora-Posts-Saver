import { Pool } from "pg";

// Global pool instance to avoid connection limits in serverless environments
const globalForPool = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPool.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3, // Maximum connections in the pool
    ssl: { rejectUnauthorized: false }, // Required for Supabase / Neon
  });

if (process.env.NODE_ENV !== "production") {
  globalForPool.pgPool = pool;
}
