// Order + user storage.
//
// Two backends behind one interface: Postgres when DATABASE_URL is set (the
// only option that works on Vercel), and an in-memory Map otherwise so the
// demo runs locally with zero setup. The fallback resets whenever the process
// restarts — fine for a laptop, useless on a serverless host, which is why
// hasDatabase() is surfaced to the UI.

import { randomBytes } from "node:crypto";
import type { CartItem } from "@/lib/cart";
import { hasDatabase, query } from "./db";

// Crockford-ish alphabet: no I, L, O, 0 or 1, so a code read aloud or typed
// from a printed ticket can't be mistyped into a different valid code.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Unguessable id. These are not merely display codes — they are the ONLY key
 * to /tickets/[id], so a predictable value would expose every order. The
 * earlier implementation derived codes from the item name, which meant every
 * buyer of the same tour got the same code; that is unsafe the moment a ticket
 * is reachable by URL.
 */
export function newId(prefix: string, length = 10): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `${prefix}-${out}`;
}

export function newTicketCode(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `BSD-${out.slice(0, 4)}-${out.slice(4)}`;
}

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
  createdAt: string;
};

export type OrderTicket = {
  code: string;
  itemName: string;
  subtitle?: string;
  price: string;
  image?: string;
  /** Only on a ferry line — the crossing the e-ticket must print. */
  ferry?: CartItem["ferry"];
};

export type StoredOrder = {
  id: string;
  userId: string | null;
  buyerName: string;
  email: string;
  currency: "SGD" | "IDR";
  totalSgd: number;
  createdAt: string;
  tickets: OrderTicket[];
  emailedAt: string | null;
};

// ── In-memory fallback ───────────────────────────────────────────────────────
type Memory = { users: Map<string, StoredUser>; orders: Map<string, StoredOrder> };

declare global {
  var __bsdMemory: Memory | undefined;
}

function memory(): Memory {
  if (!global.__bsdMemory) {
    global.__bsdMemory = { users: new Map(), orders: new Map() };
  }
  return global.__bsdMemory;
}

// ── Orders ───────────────────────────────────────────────────────────────────
export async function createOrder(order: StoredOrder): Promise<StoredOrder> {
  if (!hasDatabase()) {
    memory().orders.set(order.id, order);
    return order;
  }
  await query(
    `insert into orders (id, user_id, buyer_name, email, currency, total_sgd, created_at, items)
     values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      order.id,
      order.userId,
      order.buyerName,
      order.email,
      order.currency,
      order.totalSgd,
      order.createdAt,
      JSON.stringify({ tickets: order.tickets }),
    ],
  );
  return order;
}

function rowToOrder(r: Record<string, unknown>): StoredOrder {
  const items = (r.items ?? {}) as { tickets?: OrderTicket[] };
  return {
    id: String(r.id),
    userId: (r.user_id as string | null) ?? null,
    buyerName: String(r.buyer_name),
    email: String(r.email),
    currency: r.currency as "SGD" | "IDR",
    totalSgd: Number(r.total_sgd),
    createdAt: new Date(r.created_at as string).toISOString(),
    tickets: items.tickets ?? [],
    emailedAt: r.emailed_at ? new Date(r.emailed_at as string).toISOString() : null,
  };
}

export async function getOrder(id: string): Promise<StoredOrder | null> {
  if (!hasDatabase()) return memory().orders.get(id) ?? null;
  const rows = await query(`select * from orders where id = $1`, [id]);
  return rows.length ? rowToOrder(rows[0]) : null;
}

/** Orders belonging to a signed-in user, newest first. */
export async function listOrdersForUser(userId: string): Promise<StoredOrder[]> {
  if (!hasDatabase()) {
    return [...memory().orders.values()]
      .filter((o) => o.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const rows = await query(
    `select * from orders where user_id = $1 order by created_at desc`,
    [userId],
  );
  return rows.map(rowToOrder);
}

/** Attaches anonymous orders to a user the first time they sign in with the
    same email. Without this, tickets bought before signing in would be
    invisible in their account forever. */
export async function claimOrdersByEmail(email: string, userId: string): Promise<number> {
  if (!hasDatabase()) {
    let n = 0;
    const e = email.trim().toLowerCase();
    for (const o of memory().orders.values()) {
      if (o.userId === null && o.email.trim().toLowerCase() === e) {
        o.userId = userId;
        n++;
      }
    }
    return n;
  }
  await query(`update orders set user_id = $1 where user_id is null and lower(email) = lower($2)`, [
    userId,
    email.trim(),
  ]);
  const rows = await query<{ n: string }>(
    `select count(*)::text as n from orders where user_id = $1 and lower(email) = lower($2)`,
    [userId, email.trim()],
  );
  return Number(rows[0]?.n ?? 0);
}

export async function markOrderEmailed(id: string): Promise<void> {
  const at = new Date().toISOString();
  if (!hasDatabase()) {
    const o = memory().orders.get(id);
    if (o) o.emailedAt = at;
    return;
  }
  await query(`update orders set emailed_at = $2 where id = $1`, [id, at]);
}

// ── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(input: {
  email: string;
  name: string;
  picture?: string | null;
}): Promise<StoredUser> {
  const email = input.email.trim().toLowerCase();
  if (!hasDatabase()) {
    const mem = memory();
    for (const u of mem.users.values()) {
      if (u.email === email) {
        // Keep the freshest name/photo from the provider.
        u.name = input.name || u.name;
        u.picture = input.picture ?? u.picture;
        return u;
      }
    }
    const user: StoredUser = {
      id: newId("USR"),
      email,
      name: input.name,
      picture: input.picture ?? null,
      createdAt: new Date().toISOString(),
    };
    mem.users.set(user.id, user);
    return user;
  }

  const rows = await query(
    `insert into users (id, email, name, picture)
     values ($1, $2, $3, $4)
     on conflict (email) do update
       set name = excluded.name,
           picture = coalesce(excluded.picture, users.picture)
     returning *`,
    [newId("USR"), email, input.name, input.picture ?? null],
  );
  const r = rows[0];
  return {
    id: String(r.id),
    email: String(r.email),
    name: String(r.name),
    picture: (r.picture as string | null) ?? null,
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

export async function getUserById(id: string): Promise<StoredUser | null> {
  if (!hasDatabase()) return memory().users.get(id) ?? null;
  const rows = await query(`select * from users where id = $1`, [id]);
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: String(r.id),
    email: String(r.email),
    name: String(r.name),
    picture: (r.picture as string | null) ?? null,
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}
