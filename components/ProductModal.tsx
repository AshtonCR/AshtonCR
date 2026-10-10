"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { LIMITS, formatCRC } from "@/lib/quote";

type Props = {
  product: Product;
  initialQty?: number;
  initialNotes?: string;
  /** true si el producto ya está en la cotización (se está editando). */
  editing?: boolean;
  onClose: () => void;
  onSave: (qty: number, notes: string) => void;
};

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function ProductModal({ product, initialQty = 1, initialNotes = "", editing = false, onClose, onSave }: Props) {
  // Se guarda como texto para poder borrar el campo y escribir otro número sin que salte a 0.
  const [qty, setQty] = useState(String(initialQty));
  const [notes, setNotes] = useState(initialNotes);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // bloquea el scroll del fondo
    // Foco al diálogo (no al campo) para no abrir el teclado del celular de entrada.
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      // Mantiene el foco dentro del diálogo.
      const els = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;
      if (active === dialogRef.current || !dialogRef.current.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  const parsed = Math.floor(Number(qty));
  const safeQty = Number.isFinite(parsed) ? Math.min(LIMITS.qtyMax, Math.max(LIMITS.qtyMin, parsed)) : LIMITS.qtyMin;

  // Cierra solo si el clic empezó y terminó en el fondo (evita cerrar al seleccionar texto y soltar fuera).
  const downOnBackdrop = useRef(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overscroll-contain bg-ink/60 p-0 sm:items-center sm:p-6"
      onMouseDown={(e) => { downOnBackdrop.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (downOnBackdrop.current && e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="grid max-h-[92vh] w-full max-w-4xl overflow-auto overscroll-contain rounded-t-3xl outline-none bg-paper sm:rounded-3xl md:grid-cols-2"
      >
        <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto md:block md:overflow-visible">
          <img src={product.image} alt={product.name} className="aspect-square w-full flex-none snap-start object-cover" />
          <img src={product.imageInUse} alt={`${product.name} en uso`} className="aspect-square w-full flex-none snap-start object-cover md:hidden" />
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="text-2xl font-semibold">{product.name}</h2>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="text-2xl leading-none">×</button>
          </div>
          <p className="text-ink/70">{product.tagline}</p>
          <p>
            <span className="text-2xl font-semibold">{formatCRC(product.price)}</span>{" "}
            <span className="text-ink/60">+ IVA por unidad</span>
          </p>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Cantidad
            <input
              type="number" inputMode="numeric" min={LIMITS.qtyMin} max={LIMITS.qtyMax} step={1} value={qty}
              onChange={(e) => setQty(e.target.value)}
              onBlur={() => setQty(String(safeQty))}
              className="w-28 rounded-lg border border-line bg-white px-3 py-2 text-base"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Personalización (opcional)
            <textarea
              value={notes} maxLength={LIMITS.notes} rows={4}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={product.notesHint}
              className="rounded-lg border border-line bg-white px-3 py-2 text-base font-normal"
            />
          </label>

          <button
            type="button"
            onClick={() => onSave(safeQty, notes.trim())}
            className="mt-auto rounded-full bg-ink px-6 py-3 text-paper"
          >
            {editing ? "Guardar cambios" : "Agregar a mi cotización"} · {formatCRC(product.price * safeQty)}
          </button>
        </div>
      </div>
    </div>
  );
}
