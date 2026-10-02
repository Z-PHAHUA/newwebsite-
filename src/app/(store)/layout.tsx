import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-context";
import { UserProvider } from "@/components/user-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { getSettings } from "@/lib/data";
import { getCurrentUser } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const [s, user] = await Promise.all([
    getSettings().catch(() => ({} as Record<string, string>)),
    getCurrentUser().catch(() => null),
  ]);
  const storeName = s.store_name || "VOGUE ATELIER";
  return (
    <UserProvider user={user ? { id: user.id, name: user.name, email: user.email } : null}>
    <CartProvider>
      <Header announcement={s.announcement} storeName={storeName} user={user ? { name: user.name } : null} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer storeName={storeName} supportEmail={s.support_email} />
      <CartDrawer />
    </CartProvider>
    </UserProvider>
  );
}
