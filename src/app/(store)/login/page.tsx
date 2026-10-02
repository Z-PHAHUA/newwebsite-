import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/customer-auth";

export const metadata = { title: "Sign In" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/account");
  return <Suspense><AuthForm mode="login" /></Suspense>;
}
