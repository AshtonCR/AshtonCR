"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";
import { formatCRC } from "@/lib/quote";

type Props = {
  product: Product;
  initialQty?: number;
  initialNotes?: string;
  onClose: () => void;
  onSave: (qty: number, notes: string) => void;
};

export function ProductModal({ product, initialQty = 1, initialNotes = "", onClose, onSave }: Props) {
  const [qty, setQty] = useState(initialQty);
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const safeQty = Math.min(9999, Math.max(1, Math.floor(qty) || 1));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        onClick={(e) => e.stopPropagation()}
        className="grid max-h-[92vh] w-full max-w-4xl overflow-auto rounded-t-3xl bg-paper sm:rounded-3xl md:grid-cols-2"
      >
        <div className="flex gap-0 overflow-x-auto md:block md:overflow-visible">
          <img src={product.image} alt={product.name} className="aspect-square w-full flex-none object-cover md:w-full" />
          <img src={product.imageInUse} alt={`${product.name} en uso`} className="aspect-square w-full flex-none object-cover md:hidden" />
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-semibold">{product.name}</h2>
            <button onClick={onClose} aria-label="Cerrar" className="text-2xl leading-none">×</button>
          </div>
          <p className="text-ink/70">{product.tagline}</p>
          <p>
            <span className="text-2xl font-semibold">{formatCRC(product.price)}</span>{" "}
            <span className="text-ink/60">+ IVA por unidad</span>
          </p>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Cantidad
            <input
              type="number" min={1} max={9999} value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-28 rounded-lg border border-line bg-white px-3 py-2 text-base"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Personalización (opcional)
            <textarea
              value={notes} maxLength={300} rows={4}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={product.notesHint}
              className="rounded-lg border border-line bg-white px-3 py-2 text-base font-normal"
            />
          </label>

          <button
            onClick={() => onSave(safeQty, notes.trim())}
            className="mt-auto rounded-full bg-ink px-6 py-3 text-paper"
          >
            Agregar a mi cotización · {formatCRC(product.price * safeQty)}
          </button>
        </div>
      </div>
    </div>
  );
}
