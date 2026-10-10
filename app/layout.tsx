import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cotiza tus productos NFC",
  description: "Stands, tarjetas y camisas NFC personalizados en Costa Rica.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
