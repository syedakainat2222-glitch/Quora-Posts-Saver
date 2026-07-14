import { Pool } from "pg"

// Reuse a single pool across hot-reloads / serverless invocations.
const globalForPool = globalThis as unknown as { pgPool?: Pool }

export const pool =
  globalForPool.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
  })

if (process.env.NODE_ENV !== "production") {
  globalForPool.pgPool = pool
}
