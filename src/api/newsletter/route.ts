import { NextRequest } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: "Enter a valid email" }, { status: 400 });
  await db.insert(subscribers).values({ email: email.toLowerCase() }).onConflictDoNothing();
  return Response.json({ ok: true });
}
