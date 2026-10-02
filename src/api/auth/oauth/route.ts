import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Starts a Supabase OAuth flow (e.g. Google). Enable the provider in
// Supabase Dashboard → Authentication → Providers first.
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const provider = (req.nextUrl.searchParams.get("provider") ?? "google") as "google" | "github" | "facebook";
  const next = req.nextUrl.searchParams.get("next") ?? "/account";
  if (!supabase) return NextResponse.redirect(new URL("/login?error=Supabase+is+not+configured", req.url));
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${req.nextUrl.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error?.message ?? "OAuth failed")}`, req.url));
  return NextResponse.redirect(data.url);
}
