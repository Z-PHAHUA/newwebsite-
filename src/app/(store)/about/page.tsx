export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div>
      <section className="relative h-[50vh] min-h-[360px] bg-neutral-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.pexels.com/photos/6769357/pexels-photo-6769357.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="relative h-full flex items-center justify-center text-center text-white px-4">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-3">Our Story</p>
            <h1 className="font-serif text-5xl sm:text-6xl">Made to be worn for years</h1>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-20 space-y-8 text-neutral-700 leading-relaxed">
        <p className="text-xl font-serif text-neutral-900">VOGUE ATELIER started in 2018 with a simple frustration: clothes that looked great for a season and fell apart the next.</p>
        <p>We design in small batches, working directly with family-run mills in Portugal and Italy. Every fabric is chosen for how it feels after fifty washes — not just on the rack. Our silhouettes are deliberately timeless so you can build a wardrobe instead of chasing a trend.</p>
        <div className="grid sm:grid-cols-3 gap-6 py-6">
          {[["40k+", "Happy customers"], ["12", "Partner workshops"], ["94%", "Would buy again"]].map(([n, l]) => (
            <div key={l} className="text-center border border-neutral-200 rounded-xl p-6"><p className="font-serif text-4xl text-neutral-900">{n}</p><p className="text-xs uppercase tracking-wider text-neutral-500 mt-1">{l}</p></div>
          ))}
        </div>
        <h2 className="font-serif text-3xl text-neutral-900">Responsibility</h2>
        <p>We use organic cotton, recycled nylon and vegetable-tanned leathers wherever possible. Our packaging is plastic-free, and we offer free repairs on any product for life. Fashion should be something you keep.</p>
      </div>
    </div>
  );
}
