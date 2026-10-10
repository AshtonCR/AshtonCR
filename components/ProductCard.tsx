"use client";
import type { Product } from "@/lib/products";
import { formatCRC } from "@/lib/quote";

/*
 * La tarjeta es un <article> clicable con un <button> real en el título (teclado / lector de pantalla).
 * Antes era un <button> que envolvía <div>/<h3>/<p> (HTML inválido: un botón solo admite contenido
 * de frase) y además contenía el carrusel deslizable.
 */
export function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  return (
    <article
      onClick={onOpen}
      className="card group cursor-pointer overflow-hidden rounded-2xl border border-line bg-white text-left transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-accent"
    >
      {/* Escritorio (hover:hover): foto del producto y, al pasar el mouse, producto en uso */}
      <div className="media-hover aspect-square">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        <img src={product.imageInUse} alt="" aria-hidden="true" className="h-full w-full object-cover" />
      </div>
      {/* Táctil: se desliza entre las dos fotos */}
      <div className="media-swipe aspect-square">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        <img src={product.imageInUse} alt={`${product.name} en uso`} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            className="text-left outline-none"
          >
            {product.name}
          </button>
        </h3>
        <p className="mt-1 text-sm text-ink/70">{product.tagline}</p>
        <p className="mt-3 text-sm">
          <span className="text-xl font-semibold">{formatCRC(product.price)}</span>{" "}
          <span className="text-ink/60">+ IVA c/u</span>
        </p>
      </div>
    </article>
  );
}
