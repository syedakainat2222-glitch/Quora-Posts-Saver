import { Pool } from "pg";

console.log("POSTGRES_URL =", process.env.POSTGRES_URL);
console.log("DATABASE_URL =", process.env.DATABASE_URL);

const globalForPool = globalThis as unknown as {
  pgPool?: Pool;
};

export const pool =
  globalForPool.pgPool ??
  new Pool({
    connectionString:
      process.env.POSTGRES_URL || process.env.DATABASE_URL,

    ssl: {
      rejectUnauthorized: false,
    },

    max: 3,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPool.pgPool = pool;
}
