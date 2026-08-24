import { ImportForm } from "@/app/admin/(console)/products/import/import-form";

export default function ImportProductsPage() {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-orange">Catalog</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Import models from CSV</h1>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-brand-muted lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
          <p className="font-semibold text-brand-dark">1. Download the template</p>
          <p className="mt-1">One row per model. Same slug updates an existing model.</p>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
          <p className="font-semibold text-brand-dark">2. Fill specs</p>
          <p className="mt-1">
            Colours: <code>Beige|#C4A574|default||Black|#111111</code>. Features:{" "}
            <code>rechargeable|bluetooth</code>.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
          <p className="font-semibold text-brand-dark">3. Add photos after</p>
          <p className="mt-1">CSV can include image URLs. Colour photos are easiest on the model page.</p>
        </div>
      </div>
      <div className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-black/5">
        <ImportForm />
      </div>
    </div>
  );
}
