import { ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/site";
import type { AdminProduct } from "@/stores/adminStore";

export function AdminProductCard({ product }: { product: AdminProduct }) {
  const formatPrice = (val: string) => {
    const num = parseFloat(val.replace(/[^\d,]/g, "").replace(",", "."));
    if (isNaN(num)) return val;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const buyHref = product.buyLink || whatsappLink(`Oi! Tenho interesse no produto "${product.title}"`);
  const reviews = Math.floor(Math.random() * 500) + 50;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="relative block aspect-[4/5] overflow-hidden bg-secondary">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            sem imagem
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex-1">
          <h3 className="line-clamp-2 text-sm leading-snug text-foreground transition-colors duration-300 group-hover:text-accent">
            {product.title}
          </h3>
        </div>

        <div className="mt-2 flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">({reviews})</span>
        </div>

        <div className="mt-1.5">
          <span className="text-base font-bold text-primary">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="mt-auto pt-3">
          <Button
            asChild
            className="w-full rounded-xl bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-glow-rose"
          >
            <a href={buyHref} target="_blank" rel="noopener noreferrer">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Comprar
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
