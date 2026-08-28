/**
 * Configurações da loja. Troque o número do WhatsApp pelo número real
 * (formato internacional, só dígitos: 55 + DDD + número).
 */
export const SITE = {
  name: "Glow Up Store",
  tagline: "Beleza & Autocuidado",
  whatsappNumber: "5511984217545",
  email: "mattheus.belmiro@gmail.com",
  instagram: "glow_wupstore",
};

export function whatsappLink(message?: string) {
  const text = encodeURIComponent(
    message ?? "Oi! Vim pelo site da Glow Up Store e quero saber mais sobre os produtos ✨",
  );
  return `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
}

import saude from "@/assets/cat-saude.jpeg";
import cabelo from "@/assets/cat-cabelo.jpeg";
import maquiagem from "@/assets/cat-maquiagem.jpeg";
import beleza from "@/assets/cat-beleza.jpeg";
import cuidados from "@/assets/cat-cuidados.jpeg";

export const CATEGORIES = [
  { label: "Saude", query: "saude", description: "Bem-estar e saude", image: saude },
  { label: "Produtos De Cabelo", query: "cabelo", description: "Forca & brilho", image: cabelo },
  { label: "Maquiagens", query: "maquiagem", description: "Alta cobertura", image: maquiagem },
  { label: "Beleza", query: "beleza", description: "Produtos de beleza", image: beleza },
  { label: "Cuidados", query: "cuidados", description: "Cuidados diarios", image: cuidados },
];
