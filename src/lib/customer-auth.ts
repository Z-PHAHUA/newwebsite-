import { cookies } from "next/headers";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customers, type Customer } from "@/db/schema";
import { createSupabaseServerClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import { signToken, verifyToken } from "./auth";

const CUSTOMER_COOKIE = "vogue_customer";

export type SessionUser = { id: string; email: string; name: string; provider: "supabase" | "local" };
export type AuthResult = { ok: true; user: SessionUser } | { ok: false; error: string };

/* ------------------------------------------------------------------ */
/* Password helpers (local fallback)                                   */
/* ------------------------------------------------------------------ */
function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  const test = scryptSync(password, salt, 64);
  const ref = Buffer.from(hash, "hex");
  return test.length === ref.length && timingSafeEqual(test, ref);
}

/* ------------------------------------------------------------------ */
/* Profile row in our own DB (kept for both providers)                 */
/* ------------------------------------------------------------------ */
async function upsertProfile(data: { id: string; email: string; name: string; provider: "supabase" | "local"; passwordHash?: string | null }) {
  const [row] = await db
    .insert(customers)
    .values({ id: data.id, email: data.email.toLowerCase(), name: data.name, provider: data.provider, passwordHash: data.passwordHash ?? null })
    .onConflictDoUpdate({ target: customers.email, set: { name: data.name, provider: data.provider } })
    .returning();
  return row;
}

export async function getCustomerProfile(id: string): Promise<Customer | null> {
  const [row] = await db.select().from(customers).where(eq(customers.id, id));
  return row ?? null;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */
export async function signUp(email: string, password: string, name: string): Promise<AuthResult> {
  email = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email address" };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
  if (!name.trim()) return { ok: false, error: "Name is required" };

  if (isSupabaseConfigured()) {
    const supabase = (await createSupabaseServerClient())!;
    const site = process.env.NEXT_PUBLIC_SITE_URL || "";
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: site ? `${site}/auth/callback` : undefined } });
    if (error) return { ok: false, error: error.message };
    if (!data.user) return { ok: false, error: "Sign up failed" };
    await upsertProfile({ id: data.user.id, email, name, provider: "supabase" });
    if (!data.session) {
      return { ok: false, error: "Account created. Please check your email to confirm your address, then sign in." };
    }
    return { ok: true, user: { id: data.user.id, email, name, provider: "supabase" } };
  }

  const [existing] = await db.select().from(customers).where(eq(customers.email, email));
  if (existing) return { ok: false, error: "An account with this email already exists" };
  const id = randomUUID();
  await upsertProfile({ id, email, name, provider: "local", passwordHash: hashPassword(password) });
  await setLocalSession(id);
  return { ok: true, user: { id, email, name, provider: "local" } };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  email = email.trim().toLowerCase();
  if (isSupabaseConfigured()) {
    const supabase = (await createSupabaseServerClient())!;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { ok: false, error: error?.message ?? "Invalid credentials" };
    const name = (data.user.user_metadata?.full_name as string) ?? email.split("@")[0];
    await upsertProfile({ id: data.user.id, email, name, provider: "supabase" });
    return { ok: true, user: { id: data.user.id, email, name, provider: "supabase" } };
  }

  const [user] = await db.select().from(customers).where(eq(customers.email, email));
  if (!user || !verifyPassword(password, user.passwordHash)) return { ok: false, error: "Invalid email or password" };
  await setLocalSession(user.id);
  return { ok: true, user: { id: user.id, email: user.email, name: user.name, provider: "local" } };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
  }
  const store = await cookies();
  store.delete(CUSTOMER_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase!.auth.getUser();
    if (!data.user) return null;
    const email = data.user.email ?? "";
    const profile = await getCustomerProfile(data.user.id);
    return { id: data.user.id, email, name: profile?.name || (data.user.user_metadata?.full_name as string) || email.split("@")[0], provider: "supabase" };
  }
  const store = await cookies();
  const token = store.get(CUSTOMER_COOKIE)?.value;
  if (!verifyToken(token)) return null;
  const id = token!.split(":")[1];
  const profile = await getCustomerProfile(id);
  if (!profile) return null;
  return { id: profile.id, email: profile.email, name: profile.name, provider: "local" };
}

export async function updateProfile(id: string, patch: Partial<Pick<Customer, "name" | "phone" | "address" | "city" | "postalCode" | "country">>) {
  const [row] = await db.update(customers).set(patch).where(eq(customers.id, id)).returning();
  return row;
}

export async function changePassword(user: SessionUser, current: string, next: string): Promise<AuthResult> {
  if (next.length < 6) return { ok: false, error: "New password must be at least 6 characters" };
  if (user.provider === "supabase") {
    const supabase = (await createSupabaseServerClient())!;
    const { error } = await supabase.auth.updateUser({ password: next });
    return error ? { ok: false, error: error.message } : { ok: true, user };
  }
  const profile = await getCustomerProfile(user.id);
  if (!profile || !verifyPassword(current, profile.passwordHash)) return { ok: false, error: "Current password is incorrect" };
  await db.update(customers).set({ passwordHash: hashPassword(next) }).where(eq(customers.id, user.id));
  return { ok: true, user };
}

/* ------------------------------------------------------------------ */
async function setLocalSession(id: string) {
  const store = await cookies();
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 30;
  store.set(CUSTOMER_COOKIE, signToken(`customer:${id}:${exp}`), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}
