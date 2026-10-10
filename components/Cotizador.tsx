"use client";
import { useMemo, useState } from "react";
import { PRODUCTS, productById, type Product } from "@/lib/products";
import {
  LIMITS, buildQuote, encodeQuote, formatCRC, newQuoteNumber, todayCR,
  type QuoteInput, type QuoteItemInput,
} from "@/lib/quote";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";

// Solo dígitos: wa.me no acepta "+", espacios ni guiones.
const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/\D/g, "");

export function Cotizador() {
  const [items, setItems] = useState<QuoteItemInput[]>([]);
  const [open, setOpen] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [error, setError] = useState("");
  const [number] = useState(() => newQuoteNumber());

  // Solo para mostrar el resumen; el servidor recalcula todo desde lib/products.ts.
  const quote = useMemo(
    () => buildQuote({ number, date: todayCR(), name, company, items }),
    [items, name, company, number],
  );
  const existing = open ? items.find((i) => i.id === open.id) : undefined;

  const save = (qty: number, notes: string) => {
    if (!open) return;
    const id = open.id;
    setItems((prev) =>
      prev.some((i) => i.id === id)
        ? prev.map((i) => (i.id === id ? { id, qty, notes } : i)) // editar sin cambiar el orden
        : [...prev, { id, qty, notes }],
    );
    setError("");
    setOpen(null);
  };

  const trimmedName = name.trim();
  const canGenerate = trimmedName.length > 0 && items.length > 0;
  // La fecha se toma al generar (no al cargar la página), en hora de Costa Rica.
  const tokenFor = (): string => {
    const input: QuoteInput = { number, date: todayCR(), name: trimmedName, company: company.trim(), items };
    return encodeQuote(input);
  };

  const generate = () => {
    setNameTouched(true);
    if (!canGenerate) return;
    const token = tokenFor();
    if (token.length > LIMITS.token) {
      setError("La cotización es demasiado larga. Acorta las notas de personalización e inténtalo de nuevo.");
      return;
    }
    setError("");
    const pdfUrl = `${window.location.origin}/api/pdf?q=${token}`;
    const resumen = quote.lines.map((l) => `• ${l.qty} × ${l.name}`).join("\n");
    const cliente = company.trim() ? `${trimmedName} (${company.trim()})` : trimmedName;
    const text =
      `Hola, soy ${cliente}. Quiero esta cotización (${quote.number}):\n${resumen}\n` +
      `Total: ${formatCRC(quote.total)} (IVA incluido)\n\nVer PDF: ${pdfUrl}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const pdfToken = canGenerate ? tokenFor() : "";
  const pdfHref = pdfToken && pdfToken.length <= LIMITS.token ? `/api/pdf?download=1&q=${pdfToken}` : undefined;
  const showNameError = nameTouched && !trimmedName;

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
                <div className="min-w-0">
                  <p className="font-medium">{l.qty} × {l.name}</p>
                  {l.notes && <p className="mt-0.5 break-words text-ink/60">{l.notes}</p>}
                  <button type="button" className="mt-1 text-accent underline" onClick={() => setOpen(productById(l.id) ?? null)}>Editar</button>
                  {" · "}
                  <button type="button" className="text-ink/60 underline" onClick={() => setItems((p) => p.filter((i) => i.id !== l.id))}>Quitar</button>
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
          <label className="flex flex-col gap-1 text-sm font-medium">
            Nombre *
            <input
              value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setNameTouched(true)}
              maxLength={LIMITS.name} required autoComplete="name" placeholder="Tu nombre"
              aria-invalid={showNameError} aria-describedby={showNameError ? "nombre-error" : undefined}
              className="rounded-lg border border-line px-3 py-2 text-base font-normal"
            />
            {showNameError && <span id="nombre-error" className="font-normal text-accent">Escribe tu nombre para generar la cotización.</span>}
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Empresa (opcional)
            <input
              value={company} onChange={(e) => setCompany(e.target.value)}
              maxLength={LIMITS.company} autoComplete="organization" placeholder="Nombre de tu empresa"
              className="rounded-lg border border-line px-3 py-2 text-base font-normal"
            />
          </label>
          <button type="button" onClick={generate} disabled={items.length === 0}
            className="rounded-full bg-ink px-6 py-3 text-paper disabled:cursor-not-allowed disabled:opacity-40">
            Cotizar y enviar por WhatsApp
          </button>
          {items.length === 0 && <p className="text-center text-xs text-ink/60">Agrega al menos un producto.</p>}
          {error && <p role="alert" className="text-sm text-accent">{error}</p>}
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
          editing={Boolean(existing)}
          onClose={() => setOpen(null)}
          onSave={save}
        />
      )}
    </div>
  );
}
