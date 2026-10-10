import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest } from "next/server";
import { QuotePdf } from "@/components/QuotePdf";
import { buildQuote, decodeQuote } from "@/lib/quote";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const input = decodeQuote(req.nextUrl.searchParams.get("q") ?? "");
  if (!input) return new Response("Cotización inválida", { status: 400 });

  const quote = buildQuote(input);
  const business = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "AshtonCR";
  const pdf = await renderToBuffer(QuotePdf({ quote, business }));
  const disposition = req.nextUrl.searchParams.get("download") ? "attachment" : "inline";

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${quote.number}.pdf"`,
      "Cache-Control": "private, max-age=0",
    },
  });
}
