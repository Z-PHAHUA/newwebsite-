"use client";

import { createContext, useContext, type ReactNode } from "react";

export type StoreUser = { id: string; name: string; email: string } | null;

const Ctx = createContext<StoreUser>(null);

export function UserProvider({ user, children }: { user: StoreUser; children: ReactNode }) {
  return <Ctx.Provider value={user}>{children}</Ctx.Provider>;
}

export function useUser() {
  return useContext(Ctx);
}

/** Returns the URL to send a visitor to when they try to buy: checkout if logged in, else login. */
export function checkoutHref(user: StoreUser) {
  return user ? "/checkout" : "/login?next=%2Fcheckout&reason=checkout";
}
