export const metadata = { title: "Size Guide" };

const rows = [["XS", "32-34", "25-27", "35-37"], ["S", "34-36", "27-29", "37-39"], ["M", "36-38", "29-31", "39-41"], ["L", "38-41", "31-34", "41-44"], ["XL", "41-44", "34-37", "44-47"], ["XXL", "44-47", "37-40", "47-50"]];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="font-serif text-5xl text-center mb-4">Size Guide</h1>
      <p className="text-center text-neutral-500 text-sm mb-12">All measurements in inches. Measure over light clothing.</p>
      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500"><tr><th className="p-4 text-left">Size</th><th className="p-4 text-left">Chest</th><th className="p-4 text-left">Waist</th><th className="p-4 text-left">Hips</th></tr></thead>
          <tbody className="divide-y divide-neutral-100">{rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={`p-4 ${i === 0 ? "font-semibold" : ""}`}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="mt-10 grid sm:grid-cols-3 gap-6 text-sm text-neutral-600">
        <div><p className="font-semibold text-neutral-900 mb-1">Chest</p>Measure around the fullest part, keeping the tape horizontal.</div>
        <div><p className="font-semibold text-neutral-900 mb-1">Waist</p>Measure around your natural waistline, above the navel.</div>
        <div><p className="font-semibold text-neutral-900 mb-1">Hips</p>Measure around the fullest part of your hips.</div>
      </div>
    </div>
  );
}
