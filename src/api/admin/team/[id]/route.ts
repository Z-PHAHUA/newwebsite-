import { NextRequest } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { requireOwner, idFrom, logActivity } from "@/lib/admin-api";
import { hashPassword, ADMIN_ROLES } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { denied, admin } = await requireOwner();
  if (denied) return denied;
  const id = idFrom(await ctx.params);
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  const b = await req.json();
  const patch: Partial<typeof adminUsers.$inferInsert> = {};
  if (b.name) patch.name = String(b.name).trim();
  if (b.role && ADMIN_ROLES.includes(b.role)) patch.role = b.role;
  if (b.isActive !== undefined) patch.isActive = Boolean(b.isActive);
  if (b.password) {
    if (String(b.password).length < 6) return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    patch.passwordHash = hashPassword(String(b.password));
  }
  // Never demote/disable the last active owner
  if ((patch.role && patch.role !== "owner") || patch.isActive === false) {
    const [target] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    if (target?.role === "owner") {
      const [{ c }] = await db.select({ c: count() }).from(adminUsers).where(and(eq(adminUsers.role, "owner"), eq(adminUsers.isActive, true)));
      if (c <= 1) return Response.json({ error: "Cannot demote or disable the last owner" }, { status: 400 });
    }
  }
  const [u] = await db.update(adminUsers).set(patch).where(eq(adminUsers.id, id)).returning();
  await logActivity(admin, "team.update", `Updated admin #${id}: ${Object.keys(patch).join(", ")}`);
  const { passwordHash: _p, ...safe } = u; void _p;
  return Response.json(safe);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { denied, admin } = await requireOwner();
  if (denied) return denied;
  const id = idFrom(await ctx.params);
  if (!id) return Response.json({ error: "Bad id" }, { status: 400 });
  if (id === admin.id) return Response.json({ error: "You cannot delete your own account" }, { status: 400 });
  await db.delete(adminUsers).where(eq(adminUsers.id, id));
  await logActivity(admin, "team.delete", `Removed admin #${id}`);
  return Response.json({ ok: true });
}
