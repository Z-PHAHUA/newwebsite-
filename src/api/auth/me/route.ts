import { getCurrentUser, getCustomerProfile } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ user: null });
  const profile = await getCustomerProfile(user.id);
  if (!profile) return Response.json({ user, profile: null });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _omit, ...safeProfile } = profile;
  return Response.json({ user, profile: safeProfile });
}
