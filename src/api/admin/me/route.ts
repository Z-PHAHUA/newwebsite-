import { NextRequest } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession, hashPassword, verifyPassword, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(admin);
}

/** Update own name / email / password. */
export async function PUT(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const [me] = await db.select().from(adminUsers).where(eq(adminUsers.id, admin.id));
  const patch: Partial<typeof adminUsers.$inferInsert> = {};
  if (b.name) patch.name = String(b.name).trim();
  if (b.email) {
    const email = String(b.email).trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: "Invalid email" }, { status: 400 });
    patch.email = email;
  }
  if (b.newPassword) {
    if (!verifyPassword(String(b.currentPassword ?? ""), me.passwordHash)) return Response.json({ error: "Current password is incorrect" }, { status: 400 });
    if (String(b.newPassword).length < 6) return Response.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    patch.passwordHash = hashPassword(String(b.newPassword));
  }
  try {
    await db.update(adminUsers).set(patch).where(eq(adminUsers.id, admin.id));
  } catch {
    return Response.json({ error: "Email already in use" }, { status: 400 });
  }
  await logActivity(admin, "profile.update", Object.keys(patch).join(", "));
  return Response.json({ ok: true });
}
