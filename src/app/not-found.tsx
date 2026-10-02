import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-3">404</p>
      <h1 className="font-serif text-5xl mb-4">Page not found</h1>
      <p className="text-neutral-500 mb-8">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}
