import { getAdminSession } from "@/lib/auth";
import { AdminAccountForm } from "@/components/admin/account-form";

export default async function AdminAccountPage() {
  const admin = (await getAdminSession())!;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Account</h1><p className="text-sm text-neutral-500">Update your admin login details. Role: <span className="capitalize font-medium">{admin.role}</span></p></div>
      <AdminAccountForm admin={admin} />
    </div>
  );
}
