import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/customer-auth";
import { CheckoutForm } from "./checkout-form";

export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  // Purchasing requires an account: send visitors to login first.
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fcheckout&reason=checkout");
  return <CheckoutForm />;
}
