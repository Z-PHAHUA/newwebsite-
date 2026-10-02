import { getCurrentUser, getCustomerProfile } from "@/lib/customer-auth";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;
  const profile = await getCustomerProfile(user.id);
  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">Profile & shipping address</h2>
      <ProfileForm initial={{ name: profile?.name ?? user.name, phone: profile?.phone ?? "", address: profile?.address ?? "", city: profile?.city ?? "", postalCode: profile?.postalCode ?? "", country: profile?.country ?? "United States" }} email={user.email} />
    </div>
  );
}
