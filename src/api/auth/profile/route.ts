import { NextRequest } from "next/server";
import { getCurrentUser, updateProfile } from "@/lib/customer-auth";

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const row = await updateProfile(user.id, {
    name: String(b.name ?? user.name).trim() || user.name,
    phone: b.phone || null,
    address: b.address || null,
    city: b.city || null,
    postalCode: b.postalCode || null,
    country: b.country || null,
  });
  return Response.json(row);
}
