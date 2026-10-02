import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/customer-auth";

export const metadata = { title: "Create Account" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/account");
  return <Suspense><AuthForm mode="register" /></Suspense>;
}
