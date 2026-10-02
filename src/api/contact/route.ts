import { NextRequest } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";

export async function POST(req: NextRequest) {
  const b = await req.json();
  if (!b.name || !b.email || !b.message) return Response.json({ error: "Missing fields" }, { status: 400 });
  await db.insert(messages).values({ name: b.name, email: b.email, subject: b.subject || null, message: b.message });
  return Response.json({ ok: true });
}
