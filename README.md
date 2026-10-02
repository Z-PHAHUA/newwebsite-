# VOGUE ATELIER — Clothing store + Admin panel

Next.js (App Router) · Drizzle ORM · PostgreSQL / Supabase · Tailwind

## Connect to Supabase

1. Create a project at https://supabase.com.
2. **Database** – Project Settings → Database → Connection string → *Transaction pooler*.
   Put it in `.env` as `DATABASE_URL`. Then run `npx drizzle-kit push` to create all tables in Supabase.
3. **Auth** – Project Settings → API → copy *Project URL* and *anon public key* into
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   Customer Sign in / Register pages will now use Supabase Auth (email + password).
   Optionally disable "Confirm email" in Authentication → Providers → Email for instant sign-in.
4. Restart the app.

Without the Supabase keys the app runs fully with the local Postgres and a built-in
email/password auth fallback, so nothing breaks in development.

## Accounts
- Storefront: `/login`, `/register`, `/account` (orders, profile/address, password)
- Admin: `/admin/login` — default `admin@vogue.store` / `admin123` (override via env)
