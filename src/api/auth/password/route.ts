import { NextRequest } from "next/server";
import { getCurrentUser, changePassword } from "@/lib/customer-auth";

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { current, next } = await req.json();
  const r = await changePassword(user, String(current ?? ""), String(next ?? ""));
  return r.ok ? Response.json({ ok: true }) : Response.json({ error: r.error }, { status: 400 });
}
