import { Link } from "@tanstack/react-router";
import { Loader2, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { whatsappLink } from "@/lib/site";
import { toast } from "sonner";
import { type ProductBadge } from "@/stores/adminStore";

function getBadgeColor(badge: ProductBadge): string {
  switch (badge) {
    case "mais-vendido": return "bg-gradient-to-r from-yellow-500 to-amber-500";
    case "oferta": return "bg-gradient-to-r from-orange-500 to-red-500";
    case "novidade": return "bg-gradient-to-r from-cyan-500 to-blue-500";
    case "destaque": return "bg-gradient-to-r from-pink-500 to-rose-500";
    default: return "bg-gradient-to-r from-orange-500 to-red-500";
  }
}

function getBadgeLabel(badge: ProductBadge): string {
  switch (badge) {
    case "mais-vendido": return "🏆 Mais vendido";
    case "oferta": return "🔥 Oferta especial";
    case "novidade": return "✨ Novidade";
    case "destaque": return "💞 Destaque glow up";
    default: return "🔥 Oferta";
  }
}

export function ProductCard({ product, badgeType }: { product: ShopifyProduct; badgeType?: ProductBadge }) {
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  const node = product.node;
  const selectedVariant = node.variants.edges[0]?.node;
  const image = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const compareAt = node.compareAtPriceRange?.minVariantPrice;
  const hasShopifyDiscount = compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount);
  const originalPrice = hasShopifyDiscount
    ? compareAt.amount
    : (parseFloat(price.amount) * 1.6).toFixed(2);
  const discountPct = hasShopifyDiscount
    ? Math.round(((parseFloat(compareAt.amount) - parseFloat(price.amount)) / parseFloat(compareAt.amount)) * 100)
    : 60;

  const reviews = Math.floor(Math.random() * 500) + 50;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Adicionado a sacola", {
      description: node.title,
      position: "top-center",
    });
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <Link
        to="/produto/$handle"
        params={{ handle: node.handle }}
        className="relative block aspect-[4/5] overflow-hidden bg-secondary"
      >
        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? node.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            sem imagem
          </div>
        )}

        <span className={`absolute left-2 top-2 rounded-full ${getBadgeColor(badgeType)} px-2 py-0.5 text-[10px] font-bold text-white shadow-md`}>
          {getBadgeLabel(badgeType)}
        </span>
        {hasShopifyDiscount && (
          <span className="absolute right-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
            -{discountPct}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link to="/produto/$handle" params={{ handle: node.handle }} className="flex-1">
          <h3 className="line-clamp-2 text-sm leading-snug text-foreground transition-colors duration-300 group-hover:text-accent">
            {node.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">({reviews})</span>
        </div>

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-base font-bold text-primary">
            {formatPrice(price.amount, price.currencyCode)}
          </span>
          <span className="text-sm font-medium text-red-400 line-through decoration-2">
            {formatPrice(originalPrice, price.currencyCode)}
          </span>
        </div>

        <div className="mt-auto pt-3">
          <Button
            onClick={handleAddToCart}
            disabled={isLoading || !selectedVariant?.availableForSale}
            className="w-full rounded-xl bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-glow-rose"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                Quero o meu
              </span>
            )}
          </Button>
          <p className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
            Compra segura
          </p>
        </div>
      </div>
    </article>
  );
}
