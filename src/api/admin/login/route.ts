import { NextRequest } from "next/server";
import { adminLogin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const session = await adminLogin(String(email ?? ""), String(password ?? ""));
  if (!session) return Response.json({ error: "Invalid credentials or account disabled" }, { status: 401 });
  return Response.json({ ok: true, admin: session });
}
