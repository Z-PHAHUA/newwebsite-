export const metadata = { title: "FAQ" };

const faqs = [
  ["How long does shipping take?", "Standard shipping takes 3–5 business days. Express (1–2 days) is available at checkout. Orders over $100 ship free."],
  ["What is your return policy?", "You can return or exchange any unworn item within 30 days for a full refund. Returns are free in the US, UK, and EU."],
  ["How do I find my size?", "Check our Size Guide for detailed measurements. If you're between sizes, we recommend sizing up for outerwear and down for knits."],
  ["Do you offer cash on delivery?", "Yes! Select Cash on Delivery at checkout and pay when your order arrives."],
  ["Can I change or cancel my order?", "Contact us within 2 hours of ordering and we'll do our best. Once an order is processing, it cannot be changed."],
  ["How can I track my order?", "Use the Track Order page with your order number and email address to see real-time status updates."],
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="font-serif text-5xl text-center mb-12">Frequently Asked Questions</h1>
      <div className="divide-y divide-neutral-200">
        {faqs.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="flex justify-between cursor-pointer font-medium list-none">{q}<span className="text-neutral-400 group-open:rotate-45 transition">+</span></summary>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
