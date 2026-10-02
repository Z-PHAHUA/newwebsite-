import { NextRequest } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { requireOwner, logActivity } from "@/lib/admin-api";
import { hashPassword, ADMIN_ROLES, type AdminRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { denied, admin } = await requireOwner();
  if (denied) return denied;
  const b = await req.json();
  const email = String(b.email ?? "").trim().toLowerCase();
  const password = String(b.password ?? "");
  const name = String(b.name ?? "").trim();
  const role: AdminRole = ADMIN_ROLES.includes(b.role) ? b.role : "manager";
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: "Valid name and email required" }, { status: 400 });
  if (password.length < 6) return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  try {
    const [u] = await db.insert(adminUsers).values({ name, email, role, passwordHash: hashPassword(password) }).returning();
    await logActivity(admin, "team.create", `Added admin ${email} (${role})`);
    const { passwordHash: _p, ...safe } = u; void _p;
    return Response.json(safe);
  } catch {
    return Response.json({ error: "An admin with this email already exists" }, { status: 400 });
  }
}
