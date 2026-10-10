import Link from "next/link";

// Landing provisional: el diseño final se hace a partir de las referencias.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-5">
      <h1 className="text-4xl font-semibold tracking-tight">NFC personalizado para tu negocio</h1>
      <p className="text-lg text-ink/70">Stands, tarjetas de PVC y camisas con chip NFC.</p>
      <Link href="/cotizar" className="w-fit rounded-full bg-ink px-6 py-3 text-paper">
        Cotizar
      </Link>
    </main>
  );
}
