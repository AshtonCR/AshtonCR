import { IVA_RATE, productById } from "./products";

export type QuoteItemInput = { id: string; qty: number; notes: string };
export type QuoteInput = {
  number: string;
  date: string; // ISO yyyy-mm-dd
  name: string;
  company: string;
  items: QuoteItemInput[];
};

export type QuoteLine = {
  id: string;
  name: string;
  qty: number;
  unit: number;
  total: number;
  notes: string;
};
export type Quote = {
  number: string;
  date: string;
  name: string;
  company: string;
  lines: QuoteLine[];
  subtotal: number;
  iva: number;
  total: number;
};

export const formatCRC = (n: number) =>
  "₡" + Math.round(n).toLocaleString("es-CR", { maximumFractionDigits: 0 });

export function newQuoteNumber(now = new Date()) {
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `COT-${ymd}-${rand}`;
}

/** Recalcula todo con los precios del catálogo; nunca confía en precios del cliente. */
export function buildQuote(input: QuoteInput): Quote {
  const lines: QuoteLine[] = input.items.flatMap((it) => {
    const p = productById(it.id);
    if (!p) return [];
    return [{ id: p.id, name: p.name, qty: it.qty, unit: p.price, total: p.price * it.qty, notes: it.notes }];
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const iva = Math.round(subtotal * IVA_RATE);
  return { number: input.number, date: input.date, name: input.name, company: input.company, lines, subtotal, iva, total: subtotal + iva };
}

export const encodeQuote = (q: QuoteInput) =>
  btoa(encodeURIComponent(JSON.stringify(q))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** Valida y limita el contenido; devuelve null si el token no es válido. */
export function decodeQuote(token: string): QuoteInput | null {
  try {
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const raw = JSON.parse(decodeURIComponent(atob(b64)));
    if (!raw || !Array.isArray(raw.items) || raw.items.length === 0 || raw.items.length > 20) return null;
    const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
    const items: QuoteItemInput[] = [];
    for (const it of raw.items) {
      const qty = Number(it?.qty);
      if (!productById(String(it?.id)) || !Number.isInteger(qty) || qty < 1 || qty > 9999) return null;
      items.push({ id: String(it.id), qty, notes: str(it.notes, 300) });
    }
    const date = /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : new Date().toISOString().slice(0, 10);
    const number = /^COT-[0-9]{6}-[A-Z0-9]{4}$/.test(raw.number) ? raw.number : newQuoteNumber();
    const name = str(raw.name, 80);
    if (!name) return null;
    return { number, date, name, company: str(raw.company, 80), items };
  } catch {
    return null;
  }
}
