import type { Metadata } from "next";
import { Cotizador } from "@/components/Cotizador";

export const metadata: Metadata = { title: "Cotizar" };

export default function CotizarPage() {
  return <Cotizador />;
}
