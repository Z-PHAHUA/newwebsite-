import { signOut } from "@/lib/customer-auth";

export async function POST() {
  await signOut();
  return Response.json({ ok: true });
}
