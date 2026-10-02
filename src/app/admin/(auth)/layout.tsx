import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  if (await isAdmin()) redirect("/admin");
  return <>{children}</>;
}
