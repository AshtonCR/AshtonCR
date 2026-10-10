import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest } from "next/server";
import { QuotePdf } from "@/components/QuotePdf";
import { LIMITS, buildQuote, decodeQuote } from "@/lib/quote";

export const runtime = "nodejs";

const badRequest = (msg: string) =>
  new Response(msg, { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  // Se corta antes de decodificar: un token gigante no llega a atob/JSON.parse.
  if (q.length > LIMITS.token) return badRequest("Cotización demasiado larga");
  const input = decodeQuote(q);
  if (!input) return badRequest("Cotización inválida");

  // Los precios salen siempre de lib/products.ts (buildQuote), nunca del token.
  const quote = buildQuote(input);
  const business = process.env.NEXT_PUBLIC_BUSINESS_NAME || "AshtonCR";
  const pdf = await renderToBuffer(QuotePdf({ quote, business }));
  const disposition = req.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${quote.number}.pdf"`,
      "Cache-Control": "private, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
