export const IVA_RATE = 0.13;

export type Product = {
  id: string;
  name: string;
  tagline: string;
  /** Precio unitario en colones, sin IVA */
  price: number;
  /** Foto del producto */
  image: string;
  /** Foto del producto en uso (aparece en hover / segundo slide en celular) */
  imageInUse: string;
  notesHint: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "stand",
    name: "Stand NFC",
    tagline: "Para mostrador o escritorio. Acrílico, QR y enlace personalizables.",
    price: 14000,
    image: "/productos/stand.svg",
    imageInUse: "/productos/stand-uso.svg",
    notesHint: "Ej: con mi logo, acrílico negro, enlace a mi Instagram",
  },
  {
    id: "camisa",
    name: "Camisa NFC",
    tagline: "Camisa con chip NFC integrado.",
    price: 20000,
    image: "/productos/camisa.svg",
    imageInUse: "/productos/camisa-uso.svg",
    notesHint: "Ej: tallas, colores, logo en el pecho",
  },
  {
    id: "tarjeta",
    name: "Tarjeta NFC de PVC",
    tagline: "Tarjeta de PVC con chip NFC y diseño propio.",
    price: 11000,
    image: "/productos/tarjeta.svg",
    imageInUse: "/productos/tarjeta-uso.svg",
    notesHint: "Ej: mi logo al frente, QR atrás, enlace a mi WhatsApp",
  },
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id);
