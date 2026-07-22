import { Pool } from "pg";

console.log("DATABASE_URL =", process.env.DATABASE_URL?.substring(0, 80));

const globalForPool = globalThis as unknown as {
  pgPool?: Pool;
};

export const pool =
  globalForPool.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 3,
  });

pool.query("SELECT current_database(), current_schema()")
  .then(r => console.log("DB INFO:", r.rows))
  .catch(console.error);

pool.query(`
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public'
`)
.then(r => console.log("TABLES:", r.rows))
.catch(console.error);
