import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "VOGUE ATELIER — Considered Clothing", template: "%s · VOGUE ATELIER" },
  description: "Modern clothing store: dresses, outerwear, denim and essentials designed to last.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
