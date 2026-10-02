import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { eq, count } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers, activityLogs } from "@/db/schema";

const COOKIE = "vogue_admin";

export type AdminRole = "owner" | "manager" | "staff";
export type AdminSession = { id: number; name: string; email: string; role: AdminRole };

export const ADMIN_ROLES: AdminRole[] = ["owner", "manager", "staff"];

function secret() {
  return process.env.ADMIN_SECRET || "vogue-dev-secret-change-me";
}
export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123";
}
export function adminEmail() {
  return (process.env.ADMIN_EMAIL || "admin@vogue.store").toLowerCase();
}

/* ---------- password hashing ---------- */
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, stored: string | null | undefined) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const ref = Buffer.from(hash, "hex");
  return test.length === ref.length && timingSafeEqual(test, ref);
}

/* ---------- signed tokens ---------- */
export function signToken(payload: string) {
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}
export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  if (sig.length !== expected.length) return false;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  const parts = payload.split(":");
  return Number(parts[parts.length - 1]) > Date.now();
}

/* ---------- bootstrap: ensure an owner account exists ---------- */
export async function ensureDefaultAdmin() {
  const [{ c }] = await db.select({ c: count() }).from(adminUsers);
  if (c === 0) {
    await db.insert(adminUsers).values({
      name: "Store Owner",
      email: adminEmail(),
      passwordHash: hashPassword(adminPassword()),
      role: "owner",
    }).onConflictDoNothing();
  }
}

/* ---------- login / session ---------- */
export async function adminLogin(email: string, password: string): Promise<AdminSession | null> {
  await ensureDefaultAdmin();
  const [u] = await db.select().from(adminUsers).where(eq(adminUsers.email, email.trim().toLowerCase()));
  if (!u || !u.isActive || !verifyPassword(password, u.passwordHash)) return null;
  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, u.id));
  const session: AdminSession = { id: u.id, name: u.name, email: u.email, role: u.role as AdminRole };
  const store = await cookies();
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  store.set(COOKIE, signToken(`admin:${u.id}:${exp}`), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  await logActivity(session, "login", `Signed in`);
  return session;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!verifyToken(token)) return null;
  const parts = token!.split(".")[0].split(":");
  const id = Number(parts[1]);
  if (!id) return null;
  const [u] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
  if (!u || !u.isActive) return null;
  return { id: u.id, name: u.name, email: u.email, role: u.role as AdminRole };
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

/* ---------- permissions ---------- */
export function canManageTeam(role: AdminRole) {
  return role === "owner";
}
export function canWrite(role: AdminRole) {
  return role === "owner" || role === "manager";
}

/* ---------- activity log ---------- */
export async function logActivity(admin: AdminSession, action: string, details?: string) {
  try {
    await db.insert(activityLogs).values({ adminId: admin.id, adminName: admin.name, action, details: details ?? null });
  } catch {}
}

export const ADMIN_COOKIE = COOKIE;
