import { NextRequest } from "next/server";
import { signUp } from "@/lib/customer-auth";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  const r = await signUp(String(email ?? ""), String(password ?? ""), String(name ?? ""));
  return r.ok ? Response.json({ user: r.user }) : Response.json({ error: r.error }, { status: 400 });
}
