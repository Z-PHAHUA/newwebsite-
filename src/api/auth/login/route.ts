import { NextRequest } from "next/server";
import { signIn } from "@/lib/customer-auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const r = await signIn(String(email ?? ""), String(password ?? ""));
  return r.ok ? Response.json({ user: r.user }) : Response.json({ error: r.error }, { status: 401 });
}
