import { PasswordForm } from "@/components/password-form";
import { getCurrentUser } from "@/lib/customer-auth";

export default async function SecurityPage() {
  const user = (await getCurrentUser())!;
  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">Change password</h2>
      <PasswordForm requireCurrent={user.provider === "local"} />
    </div>
  );
}
