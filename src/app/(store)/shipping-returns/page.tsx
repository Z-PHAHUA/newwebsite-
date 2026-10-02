export const metadata = { title: "Shipping & Returns" };

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 space-y-12">
      <div>
        <h1 className="font-serif text-5xl mb-8">Shipping & Returns</h1>
        <h2 className="font-semibold text-xl mb-3">Shipping</h2>
        <div className="card divide-y divide-neutral-100 text-sm">
          {[["Standard", "3–5 business days", "Free over $100, otherwise $8"], ["Express", "1–2 business days", "$18"], ["International", "7–14 business days", "Calculated at checkout"]].map(([a, b, c]) => (
            <div key={a} className="grid grid-cols-3 p-4"><span className="font-medium">{a}</span><span className="text-neutral-500">{b}</span><span>{c}</span></div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-xl mb-3">Returns & Exchanges</h2>
        <ul className="space-y-2 text-sm text-neutral-600 list-disc pl-5">
          <li>30 days to return or exchange from the date of delivery.</li>
          <li>Items must be unworn, unwashed, with original tags attached.</li>
          <li>Refunds are processed within 5 business days of receiving your return.</li>
          <li>Sale items can be exchanged or returned for store credit.</li>
        </ul>
      </div>
    </div>
  );
}
