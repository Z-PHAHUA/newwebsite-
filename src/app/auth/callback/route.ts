import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { customers } from "@/db/schema";

// Supabase redirects here after OAuth / email confirmation with a `code`.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") ?? "/account";
  const supabase = await createSupabaseServerClient();
  if (!code || !supabase) return NextResponse.redirect(new URL("/login?error=Invalid+callback", req.url));
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error?.message ?? "Sign in failed")}`, req.url));
  const email = (data.user.email ?? "").toLowerCase();
  const name = (data.user.user_metadata?.full_name as string) || (data.user.user_metadata?.name as string) || email.split("@")[0];
  if (email) {
    await db.insert(customers).values({ id: data.user.id, email, name, provider: "supabase" })
      .onConflictDoUpdate({ target: customers.email, set: { name, provider: "supabase" } });
  }
  return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/account", req.url));
}
