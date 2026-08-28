import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Loader2, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { fetchProductByHandle, formatPrice } from "@/lib/shopify";
import { whatsappLink } from "@/lib/site";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

export const Route = createFileRoute("/produto/$handle")({
  head: () => ({
    meta: [
      { title: "Produto | Glow Up Store" },
      {
        name: "description",
        content:
          "Detalhes do produto na Glow Up Store: preço, descrição e opções. Compre online ou fale no WhatsApp.",
      },
      { property: "og:title", content: "Produto | Glow Up Store" },
      {
        property: "og:description",
        content: "Detalhes do produto na Glow Up Store. Compre online ou fale no WhatsApp.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const [variantIndex, setVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const { data: product, isPending } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => fetchProductByHandle(handle),
  });

  const node = product?.node;
  const variants = node?.variants.edges ?? [];
  const variant = variants[variantIndex]?.node;
  const images = node?.images.edges ?? [];

  const handleAddToCart = async () => {
    if (!node || !variant) return;
    await addItem({
      product: { node },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Adicionado à sacola", { description: node.title, position: "top-center" });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader activeSection="destaques" onNavigate={() => {}} />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar à loja
        </Link>

        {isPending ? (
          <div className="flex justify-center py-32">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : !node ? (
          <div className="py-32 text-center">
            <p className="font-display text-3xl">Produto não encontrado</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Esse item pode ter saído do catálogo.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-10 md:grid-cols-2">
              <div>
                <div className="aspect-4/5 overflow-hidden bg-secondary">
                  {images[imageIndex]?.node ? (
                    <img
                      src={images[imageIndex].node.url}
                      alt={images[imageIndex].node.altText ?? node.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      sem imagem
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="mt-3 flex gap-2">
                    {images.map((img, i) => (
                      <button
                        key={img.node.url}
                        onClick={() => setImageIndex(i)}
                        className={`h-20 w-16 overflow-hidden border ${
                          i === imageIndex ? "border-accent" : "border-border"
                        }`}
                      >
                        <img
                          src={img.node.url}
                          alt={img.node.altText ?? node.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                {node.productType && (
                  <span className="eyebrow text-accent">{node.productType}</span>
                )}
                <h1 className="mt-2 font-display text-4xl md:text-5xl">{node.title}</h1>
                <p className="mt-4 text-2xl font-medium text-primary">
                  {variant
                    ? formatPrice(variant.price.amount, variant.price.currencyCode)
                    : formatPrice(
                        node.priceRange.minVariantPrice.amount,
                        node.priceRange.minVariantPrice.currencyCode,
                      )}
                </p>

                <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {node.description}
                </p>

                {variants.length > 1 && (
                  <div className="mt-8">
                    <p className="eyebrow text-muted-foreground">Opções</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {variants.map((v, i) => (
                        <button
                          key={v.node.id}
                          onClick={() => setVariantIndex(i)}
                          disabled={!v.node.availableForSale}
                          className={`border px-4 py-2 text-sm transition-colors disabled:opacity-40 ${
                            i === variantIndex
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-accent"
                          }`}
                        >
                          {v.node.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={isLoading || !variant?.availableForSale}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        {variant?.availableForSale ? "Adicionar à sacola" : "Esgotado"}
                      </>
                    )}
                  </Button>
                  <Button asChild size="lg" variant="outline" className="flex-1">
                    <a
                      href={whatsappLink(`Oi! Quero saber mais sobre "${node.title}" ✨`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Falar no WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <section className="mt-20">
              <h2 className="font-display text-3xl">Avaliações</h2>
              <div className="mt-4 border border-dashed border-border bg-card p-8 text-center">
                <div className="flex justify-center gap-1 text-muted-foreground">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} className="h-4 w-4" />
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Ainda não há avaliações para este produto.
                </p>
              </div>
            </section>
          </>
        )}
      </main>

      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
