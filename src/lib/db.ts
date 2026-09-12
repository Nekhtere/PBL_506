// Postgres connection + schema.
//
// Vercel's filesystem is read-only and its function instances don't share
// files, so a JSON file or SQLite cannot hold the orders — a database is the
// only store that survives a deploy. Any Postgres works (Neon, Supabase,
// Vercel Postgres); only DATABASE_URL differs.
//
// The pool is created lazily and cached on globalThis: Next.js hot-reloads
// modules in dev, and a fresh pool per reload would leak connections until
// Postgres refuses new ones.

import { Pool, type PoolClient } from "pg";

declare global {
  var __bsdPool: Pool | undefined;
  var __bsdSchemaReady: Promise<void> | undefined;
}

export function databaseUrl(): string | null {
  return process.env.DATABASE_URL?.trim() || null;
}

/** True when a real database is configured. Without it the app falls back to
    the in-memory store, which is fine locally but resets on every deploy. */
export function hasDatabase(): boolean {
  return databaseUrl() !== null;
}

function pool(): Pool {
  if (!global.__bsdPool) {
    global.__bsdPool = new Pool({
      connectionString: databaseUrl()!,
      // Neon and Supabase both terminate TLS with a cert node's default trust
      // store accepts; `ssl: { rejectUnauthorized: false }` would also work but
      // silently downgrades verification, so prefer the real cert.
      ssl: { rejectUnauthorized: true },
      max: 5,
    });
  }
  return global.__bsdPool;
}

const SCHEMA = `
  create table if not exists users (
    id          text primary key,
    email       text unique not null,
    name        text not null,
    picture     text,
    created_at  timestamptz not null default now()
  );

  create table if not exists orders (
    id          text primary key,
    user_id     text references users(id) on delete set null,
    buyer_name  text not null,
    email       text not null,
    currency    text not null,
    total_sgd   numeric(10,2) not null,
    created_at  timestamptz not null default now(),
    items       jsonb not null,
    emailed_at  timestamptz
  );

  create index if not exists orders_email_idx on orders (lower(email));
  create index if not exists orders_created_idx on orders (created_at desc);
`;

/** Runs the schema once per process, memoised so concurrent requests share it. */
export function ensureSchema(): Promise<void> {
  if (!global.__bsdSchemaReady) {
    global.__bsdSchemaReady = pool()
      .query(SCHEMA)
      .then(() => undefined)
      .catch((err) => {
        // Clear the memo so a transient failure (cold Neon, network) can retry
        // instead of poisoning every later request.
        global.__bsdSchemaReady = undefined;
        throw err;
      });
  }
  return global.__bsdSchemaReady;
}

export async function query<T extends Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  await ensureSchema();
  const res = await pool().query(text, params);
  return res.rows as T[];
}

/** For multi-statement writes that must not interleave. */
export async function withClient<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  await ensureSchema();
  const client = await pool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
