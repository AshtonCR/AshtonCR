"use client";
import { useMemo, useState } from "react";
import { PRODUCTS, productById, type Product } from "@/lib/products";
import { buildQuote, encodeQuote, formatCRC, newQuoteNumber, type QuoteItemInput } from "@/lib/quote";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "";

export function Cotizador() {
  const [items, setItems] = useState<QuoteItemInput[]>([]);
  const [open, setOpen] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [number] = useState(() => newQuoteNumber());

  const quote = useMemo(
    () => buildQuote({ number, date: new Date().toISOString().slice(0, 10), name, company, items }),
    [items, name, company, number],
  );
  const existing = open ? items.find((i) => i.id === open.id) : undefined;

  const save = (qty: number, notes: string) => {
    if (!open) return;
    setItems((prev) => [...prev.filter((i) => i.id !== open.id), { id: open.id, qty, notes }]);
    setOpen(null);
  };

  const generate = () => {
    if (!name.trim() || items.length === 0) return;
    const token = encodeQuote({ number, date: quote.date, name: name.trim(), company: company.trim(), items });
    const pdfUrl = `${window.location.origin}/api/pdf?q=${token}`;
    const resumen = quote.lines.map((l) => `• ${l.qty} x ${l.name}`).join("\n");
    const text =
      `Hola, quiero cotización de esto (${quote.number}):\n${resumen}\n` +
      `Total: ${formatCRC(quote.total)} (IVA incluido)\n\nVer PDF: ${pdfUrl}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const canGenerate = name.trim().length > 0 && items.length > 0;
  const pdfHref = canGenerate
    ? `/api/pdf?download=1&q=${encodeQuote({ number, date: quote.date, name: name.trim(), company: company.trim(), items })}`
    : undefined;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr_360px]">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Arma tu cotización</h1>
        <p className="mt-2 text-ink/70">Elige un producto, indica la cantidad y cuéntanos cómo lo quieres.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={() => setOpen(p)} />
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-6">
        <h2 className="text-lg font-semibold">Tu cotización</h2>
        {quote.lines.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">Aún no has agregado productos.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {quote.lines.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium">{l.qty} × {l.name}</p>
                  {l.notes && <p className="mt-0.5 text-ink/60">{l.notes}</p>}
                  <button className="mt-1 text-accent underline" onClick={() => setOpen(productById(l.id)!)}>Editar</button>
                  {" · "}
                  <button className="text-ink/60 underline" onClick={() => setItems((p) => p.filter((i) => i.id !== l.id))}>Quitar</button>
                </div>
                <span className="whitespace-nowrap">{formatCRC(l.total)}</span>
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCRC(quote.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>IVA (13%)</dt><dd>{formatCRC(quote.iva)}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{formatCRC(quote.total)}</dd></div>
        </dl>

        <div className="mt-4 flex flex-col gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Tu nombre *"
            className="rounded-lg border border-line px-3 py-2" />
          <input value={company} onChange={(e) => setCompany(e.target.value)} maxLength={80} placeholder="Empresa (opcional)"
            className="rounded-lg border border-line px-3 py-2" />
          <button onClick={generate} disabled={!canGenerate}
            className="rounded-full bg-ink px-6 py-3 text-paper disabled:cursor-not-allowed disabled:opacity-40">
            Cotizar y enviar por WhatsApp
          </button>
          {pdfHref && (
            <a href={pdfHref} className="text-center text-sm text-ink/70 underline">Solo descargar el PDF</a>
          )}
        </div>
      </aside>

      {open && (
        <ProductModal
          key={open.id}
          product={open}
          initialQty={existing?.qty}
          initialNotes={existing?.notes}
          onClose={() => setOpen(null)}
          onSave={save}
        />
      )}
    </div>
  );
}
