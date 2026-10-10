import { IVA_RATE, PRODUCTS, productById } from "./products";

export type QuoteItemInput = { id: string; qty: number; notes: string };
export type QuoteInput = {
  number: string;
  date: string; // ISO yyyy-mm-dd (fecha de Costa Rica)
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

/** Límites compartidos por el formulario (cliente) y la validación del servidor. */
export const LIMITS = {
  qtyMin: 1,
  qtyMax: 9999,
  name: 80,
  company: 80,
  notes: 300,
  /**
   * Longitud máxima del token `q` aceptada por /api/pdf (protege contra DoS).
   * Peor caso legítimo del formulario (1.060 caracteres de 3 bytes UTF-8 en nombre, empresa y
   * 3 notas → encodeURIComponent ×9 → base64 ×4/3) ≈ 13.100; queda bajo el límite de 16 KB
   * de cabeceras de Node.
   */
  token: 14000,
} as const;

/**
 * Formato determinista (igual en servidor, navegador y PDF): ₡14.000.
 * No usa Intl para evitar diferencias de ICU entre Node y navegadores
 * (separador de miles con espacio fino U+202F, que además rompe la hidratación).
 */
export const formatCRC = (n: number) =>
  "₡" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Fecha de hoy en Costa Rica (UTC-6) como yyyy-mm-dd; toISOString() daría la fecha UTC. */
export function todayCR(now = new Date()) {
  const cr = new Date(now.getTime() - 6 * 60 * 60 * 1000); // Costa Rica no usa horario de verano
  return cr.toISOString().slice(0, 10);
}

/** yyyy-mm-dd -> dd/mm/yyyy (formato usado en Costa Rica). */
export const formatDateCR = (iso: string) => iso.split("-").reverse().join("/");

const QUOTE_NUMBER_RE = /^COT-[0-9]{6}-[A-Z0-9]{4}$/;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newQuoteNumber(now = new Date()) {
  const ymd = todayCR(now).slice(2).replace(/-/g, "");
  const bytes = new Uint8Array(4);
  globalThis.crypto.getRandomValues(bytes);
  const rand = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
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

const isValidIsoDate = (v: unknown): v is string => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};

/** Valida y limita el contenido; devuelve null si el token no es válido. */
export function decodeQuote(token: string): QuoteInput | null {
  if (!token || token.length > LIMITS.token || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
  try {
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const raw = JSON.parse(decodeURIComponent(atob(padded)));
    if (!raw || typeof raw !== "object" || !Array.isArray(raw.items)) return null;
    if (raw.items.length === 0 || raw.items.length > PRODUCTS.length) return null;
    const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
    const items: QuoteItemInput[] = [];
    const seen = new Set<string>();
    for (const it of raw.items) {
      const id = typeof it?.id === "string" ? it.id : "";
      const qty = it?.qty;
      if (!productById(id) || seen.has(id)) return null;
      if (typeof qty !== "number" || !Number.isInteger(qty) || qty < LIMITS.qtyMin || qty > LIMITS.qtyMax) return null;
      seen.add(id);
      items.push({ id, qty, notes: str(it.notes, LIMITS.notes) });
    }
    const name = str(raw.name, LIMITS.name);
    if (!name) return null;
    const date = isValidIsoDate(raw.date) ? raw.date : todayCR();
    const number = typeof raw.number === "string" && QUOTE_NUMBER_RE.test(raw.number) ? raw.number : newQuoteNumber();
    return { number, date, name, company: str(raw.company, LIMITS.company), items };
  } catch {
    return null;
  }
}
