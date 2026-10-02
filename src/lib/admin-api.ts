import { getAdminSession, canWrite, canManageTeam, logActivity, type AdminSession } from "./auth";

type Guard = { denied: Response; admin: null } | { denied: null; admin: AdminSession };

/** Any authenticated admin. */
export async function requireAdmin(): Promise<Response | null> {
  const admin = await getAdminSession();
  return admin ? null : Response.json({ error: "Unauthorized" }, { status: 401 });
}

/** Owner or manager (can create/update/delete store data). Staff is read-only. */
export async function requireWrite(): Promise<Guard> {
  const admin = await getAdminSession();
  if (!admin) return { denied: Response.json({ error: "Unauthorized" }, { status: 401 }), admin: null };
  if (!canWrite(admin.role)) return { denied: Response.json({ error: "Your role is read-only" }, { status: 403 }), admin: null };
  return { denied: null, admin };
}

/** Owner only (team management). */
export async function requireOwner(): Promise<Guard> {
  const admin = await getAdminSession();
  if (!admin) return { denied: Response.json({ error: "Unauthorized" }, { status: 401 }), admin: null };
  if (!canManageTeam(admin.role)) return { denied: Response.json({ error: "Only the owner can manage the team" }, { status: 403 }), admin: null };
  return { denied: null, admin };
}

export function idFrom(params: { id: string }) {
  const id = Number(params.id);
  return isNaN(id) ? null : id;
}

export { logActivity };
