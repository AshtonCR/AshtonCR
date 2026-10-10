"use client";
import type { Product } from "@/lib/products";
import { formatCRC } from "@/lib/quote";

export function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="card group overflow-hidden rounded-2xl border border-line bg-white text-left outline-none transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-accent"
    >
      {/* Escritorio: foto del producto y, al pasar el mouse, producto en uso */}
      <div className="media-hover aspect-square">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        <img src={product.imageInUse} alt="" aria-hidden className="h-full w-full object-cover" />
      </div>
      {/* Celular: se desliza entre las dos fotos */}
      <div className="media-swipe aspect-square">
        <img src={product.image} alt={product.name} className="h-full object-cover" />
        <img src={product.imageInUse} alt="" aria-hidden className="h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="mt-1 text-sm text-ink/70">{product.tagline}</p>
        <p className="mt-3 text-sm">
          <span className="text-xl font-semibold">{formatCRC(product.price)}</span>{" "}
          <span className="text-ink/60">+ IVA c/u</span>
        </p>
      </div>
    </button>
  );
}
