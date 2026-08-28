import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Star, Truck, Quote, CreditCard, RotateCcw, Heart, Package, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, type SectionId } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { ProductCard } from "@/components/ProductCard";
import { AdminProductCard } from "@/components/AdminProductCard";
import { fetchProductsGitHub } from "@/lib/github-products";
import { fetchBannersGitHub } from "@/lib/github-banners";
import { fetchOffersGitHub } from "@/lib/github-offers";
import { fetchProducts } from "@/lib/shopify";
import { getFeaturedIdsFromLocal } from "@/stores/adminStore";
import { CATEGORIES } from "@/lib/site";
import { useCartSync } from "@/hooks/useCartSync";
import carrosel1 from "@/assets/carrosel 1.jpeg";
import carrosel2 from "@/assets/carrosel 2.jpeg";
import carrosel3 from "@/assets/carrosel 3.jpeg";
import logo from "@/assets/favicon.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Glow Up Store | Beleza, skincare e autocuidado" },
      {
        name: "description",
        content:
          "Curadoria de skincare, cabelos, corpo e maquiagem na Glow Up Store. Compre online com checkout seguro ou fale direto no WhatsApp.",
      },
      { property: "og:title", content: "Glow Up Store | Beleza, skincare e autocuidado" },
      {
        property: "og:description",
        content:
          "Produtos de beleza selecionados com curadoria. Compre pelo site ou peca pelo WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const HERO_SLIDES = [
  { id: "default-1", src: carrosel1, alt: "Carrossel de produtos de beleza 1" },
  { id: "default-2", src: carrosel2, alt: "Carrossel de produtos de beleza 2" },
  { id: "default-3", src: carrosel3, alt: "Carrossel de produtos de beleza 3" },
];

const BENEFITS = [
  { icon: ShieldCheck, title: "100% originais", text: "Marcas autorizadas" },
  { icon: Sparkles, title: "Curadoria propria", text: "Testado antes de vender" },
  { icon: Truck, title: "Envio rapido", text: "Para todo o Brasil" },
  { icon: Star, title: "Atendimento humano", text: "Direto no WhatsApp" },
  { icon: CreditCard, title: "Parcelamento", text: "Ate 6x sem juros" },
  { icon: RotateCcw, title: "Troca garantida", text: "30 dias para devolver" },
  { icon: Heart, title: "Produtos selecionados", text: "So o melhor pra voce" },
  { icon: Package, title: "Embalagem segura", text: "Chega intacto ate voce" },
  { icon: Headphones, title: "Suporte dedicado", text: "Tiramos todas suas duvidas" },
];

const TESTIMONIALS = [
  {
    name: "Ana Clara",
    initials: "AC",
    rating: 5,
    text: "Amei o protetor solar! Textura leve, nao deixa pele branca. Chegou super rapido.",
    product: "Protetor Solar Facial",
  },
  {
    name: "Juliana M.",
    initials: "JM",
    rating: 5,
    text: "O creme para cabelo que eu precisava. Cabelo macio e sem frizz no primeiro uso!",
    product: "Creme Pentear Sem Enxague",
  },
  {
    name: "Camila R.",
    initials: "CR",
    rating: 5,
    text: "Atendimento incrivel no WhatsApp. Me ajudou a montar minha rotina inteira. Super recomendo!",
    product: "Rotina Personalizada",
  },
  {
    name: "Fernanda L.",
    initials: "FL",
    rating: 5,
    text: "A maquiagem e incrivel! Cobertura perfeita e dura o dia todo. Ja indiquei para todas minhas amigas.",
    product: "Base de Longa Duracao",
  },
  {
    name: "Mariana S.",
    initials: "MS",
    rating: 5,
    text: "Produto de altissima qualidade e entrega foi super rapida. Com certeza vou comprar de novo!",
    product: "Kit Cuidados com a Pele",
  },
  {
    name: "Patricia O.",
    initials: "PO",
    rating: 5,
    text: "Melhor loja de beleza que ja comprei! Preco justo e produto chegou embalado com muito carinho.",
    product: "Shampoo Nutritivo",
  },
];

function Home() {
  useCartSync();
  const [activeCategory, setActiveCategory] = useState<string | null>(CATEGORIES[0].query);
  const [activeSection, setActiveSection] = useState<SectionId>("destaques");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [featuredPage, setFeaturedPage] = useState(0);
  const [categoryPage, setCategoryPage] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const ITEMS_PER_ROW = 2;

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(24),
  });

  const { data: rawAdminProducts = [] } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => fetchProductsGitHub(),
  });

  const adminProducts = useMemo(() => {
    const localFeaturedIds = getFeaturedIdsFromLocal();
    if (localFeaturedIds.length === 0) return rawAdminProducts;
    return rawAdminProducts.map((p) => {
      if (localFeaturedIds.includes(p.id) && !p.featured) {
        return { ...p, featured: true };
      }
      return p;
    });
  }, [rawAdminProducts]);

  const { data: rawBanners = [] } = useQuery({
    queryKey: ["banners"],
    queryFn: () => fetchBannersGitHub(),
  });

  const { data: offers = [] } = useQuery({
    queryKey: ["offers"],
    queryFn: () => fetchOffersGitHub(),
  });

  const banners = useMemo(() => {
    const custom = rawBanners.filter((b) => !HERO_SLIDES.some((s) => s.id === b.id));
    const defaults = HERO_SLIDES.map((s) => {
      const saved = rawBanners.find((b) => b.id === s.id);
      if (!saved) return null;
      if (!saved.image) return null;
      return saved;
    }).filter(Boolean) as typeof rawBanners;
    return [...defaults, ...custom];
  }, [rawBanners]);

  const slideCount = banners.length > 0 ? banners.length : HERO_SLIDES.length;

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 7000);
  }, [slideCount]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slideCount);
  }, [currentSlide, goToSlide, slideCount]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slideCount) % slideCount);
  }, [currentSlide, goToSlide, slideCount]);

  useEffect(() => {
    setCurrentSlide(0);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slideCount]);

  const filtered = useMemo(() => {
    if (!activeCategory) return products;
    const term = activeCategory.toLowerCase();
    return products.filter((p) => {
      const haystack = [
        p.node.title,
        p.node.productType ?? "",
        p.node.description,
        ...(p.node.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [products, activeCategory]);

  const handleNavigate = useCallback((id: SectionId) => {
    setActiveSection(id);
    if (id === "categorias") {
      setActiveCategory("saude");
    }
  }, []);

  useEffect(() => {
    if (!highlightedProductId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`highlight-${highlightedProductId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return () => clearTimeout(timer);
  }, [highlightedProductId]);

  const clearHighlight = useCallback(() => setHighlightedProductId(null), []);

  useEffect(() => {
    setCategoryPage(0);
  }, [activeCategory]);

  useEffect(() => {
    const el = document.getElementById(activeSection);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeSection]);

  return (
    <div className="min-h-screen">
      <SiteHeader activeSection={activeSection} onNavigate={handleNavigate} />

      {/* HERO */}
      <section className="bg-sand">
        <div className="relative mx-auto max-w-7xl">
          <div className="relative h-[500px] overflow-hidden rounded-lg md:h-[700px]">
            {banners.map((banner, i) => {
              const linkedProduct = banner.productId
                ? adminProducts.find((p) => p.id === banner.productId)
                : null;
              const bannerLink = linkedProduct?.buyLink || banner.link;
              const handleClick = () => {
                if (linkedProduct?.category) {
                  setHighlightedProductId(linkedProduct.id);
                  setActiveCategory(linkedProduct.category);
                  setActiveSection("categorias");
                } else if (bannerLink) {
                  window.open(bannerLink, "_blank", "noopener,noreferrer");
                }
              };
              return (
                <button
                  key={banner.id}
                  onClick={handleClick}
                  className={`absolute inset-0 cursor-pointer transition-opacity duration-700 ease-in-out ${
                    i === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <img
                    src={banner.image}
                    alt={`Banner ${i + 1}`}
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              );
            })}

            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/10 text-ink backdrop-blur-sm transition-all duration-300 hover:bg-ink/20 hover:scale-110 md:left-5"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/10 text-ink backdrop-blur-sm transition-all duration-300 hover:bg-ink/20 hover:scale-110 md:right-5"
              aria-label="Proximo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex justify-center pb-6 pt-4">
            {banners.map((_: unknown, i: number) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`mx-1 h-2 rounded-full transition-all duration-300 ${
                  i === currentSlide ? "w-8 bg-accent" : "w-2 bg-ink/20 hover:bg-ink/40"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="border-b border-border bg-sand overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-8 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap py-10">
            {[...BENEFITS, ...BENEFITS, ...BENEFITS].map(({ icon: Icon, title, text }, i) => (
              <div
                key={`${title}-${i}`}
                className="group flex items-start gap-3 mx-8 flex-shrink-0"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-accent-foreground group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFERTAS - sempre visivel abaixo do hero */}
      {offers.map((offer) => (
        <section key={offer.id} className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
            <div className="relative overflow-hidden rounded-2xl">
            <img
              src={offer.image}
              alt={offer.title}
              width={1600}
              height={704}
              loading="lazy"
              className="h-[280px] w-full object-cover transition-transform duration-700 hover:scale-105 md:h-[340px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/20" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center md:px-14">
              {offer.eyebrow && <span className="eyebrow text-rose-soft">{offer.eyebrow}</span>}
              <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight text-ink-foreground md:text-5xl">
                {offer.title}
              </h2>
              {offer.buttonText && offer.buttonLink && (
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    asChild
                    className="bg-rose text-accent-foreground shadow-lg shadow-rose/25 transition-all duration-300 hover:bg-rose/90 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <a href={offer.buttonLink} target="_blank" rel="noopener noreferrer">
                      {offer.buttonText}
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* DESTAQUES */}
      {(() => {
        const featured = adminProducts.filter((p) => p.available && p.featured);
        const totalPages = Math.ceil(featured.length / ITEMS_PER_ROW);
        const start = featuredPage * ITEMS_PER_ROW;
        const visible = featured.slice(start, start + ITEMS_PER_ROW);

        return (
          <section id="destaques" className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="eyebrow text-accent">Destaques</span>
                <h2 className="mt-2 font-display text-4xl md:text-5xl">Produtos em destaque</h2>
              </div>
              {totalPages > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setFeaturedPage((p) => Math.max(0, p - 1))}
                    disabled={featuredPage === 0}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-accent hover:bg-accent/5 disabled:opacity-30 disabled:hover:border-border disabled:hover:bg-background"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setFeaturedPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={featuredPage === totalPages - 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-accent hover:bg-accent/5 disabled:opacity-30 disabled:hover:border-border disabled:hover:bg-background"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
              {visible.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(i * 80, 400)}ms` }}
                >
                  <AdminProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* CATEGORIAS */}
      <section id="categorias" className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow text-accent">Categorias</span>
              <h2 className="mt-2 font-display text-4xl md:text-5xl">Escolha por necessidade</h2>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 md:grid-cols-5">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.query;
              return (
                <button
                  key={cat.query}
                  onClick={() => setActiveCategory(active ? null : cat.query)}
                  className={`group flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all duration-200 ${
                    active
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border bg-background hover:border-accent hover:shadow-sm"
                  }`}
                >
                  <div className="aspect-square w-full overflow-hidden rounded-xl">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span className={`text-xs font-medium md:text-sm ${active ? "text-primary" : "text-foreground"}`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            {activeCategory && (() => {
              const shopifyProducts = filtered.map((product) => ({
                id: product.node.id,
                type: "shopify" as const,
                product,
              }));
              const adminCategoryProducts = adminProducts
                .filter((p) => p.available)
                .filter((p) => p.category === activeCategory)
                .map((product) => ({
                  id: product.id,
                  type: "admin" as const,
                  product,
                }));
              const allProducts = [...shopifyProducts, ...adminCategoryProducts];
              const totalPages = Math.ceil(allProducts.length / ITEMS_PER_ROW);
              const start = categoryPage * ITEMS_PER_ROW;
              const visible = allProducts.slice(start, start + ITEMS_PER_ROW);

              return (
                <>
                  {totalPages > 1 && (
                    <div className="mb-4 flex justify-end gap-2">
                      <button
                        onClick={() => setCategoryPage((p) => Math.max(0, p - 1))}
                        disabled={categoryPage === 0}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-accent hover:bg-accent/5 disabled:opacity-30"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCategoryPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={categoryPage === totalPages - 1}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-accent hover:bg-accent/5 disabled:opacity-30"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {visible.map((item, i) => (
                      <div
                        key={item.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${Math.min(i * 80, 400)}ms` }}
                      >
                        {item.type === "shopify" ? (
                          <ProductCard product={item.product} />
                        ) : (
                          <AdminProductCard product={item.product} />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </section>

      {/* SOBRE A GLOW UP */}
      <section id="sobrenos" className="bg-sand border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8 md:py-24">
          <img
            src={logo}
            alt="Glow Up Store - Beleza e autocuidado"
            width={500}
            height={500}
            loading="lazy"
            className="mx-auto h-[200px] w-[200px] rounded-full object-cover shadow-lg transition-transform duration-700 hover:scale-105 md:h-[250px] md:w-[250px]"
          />
          <div className="mt-10">
            <span className="eyebrow text-accent">Sobre nos</span>
            <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
              ✨ Muito mais que beleza.<br />
              <span className="text-accent">Seu brilho, sua evolucao.</span>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              A Glow Up Store nasceu com um proposito: transformar o autocuidado em uma
              experiencia de confianca, beleza e bem-estar.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Acreditamos que beleza nao e sobre seguir padroes. E sobre se cuidar, se
              valorizar e se sentir bem com quem voce e. 💗
            </p>

            <div className="mt-8 space-y-5">
              <div className="rounded-lg bg-background border border-border p-4">
                <h3 className="font-display text-lg">💗 O que significa Glow Up?</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Para nos, Glow Up significa evolucao. E descobrir novas versoes de si
                  mesma, cuidar da autoestima e deixar sua propria luz aparecer.
                </p>
              </div>
              <div className="rounded-lg bg-background border border-border p-4">
                <h3 className="font-display text-lg">🛍️ Mais que produtos</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Cada produto e escolhido pensando em voce e na sua rotina. Buscamos unir
                  qualidade, praticidade e beleza para tornar seus momentos de autocuidado
                  ainda mais especiais.
                </p>
              </div>
              <div className="rounded-lg bg-background border border-border p-4">
                <h3 className="font-display text-lg">🚀 Estamos apenas comecando</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  A Glow Up esta crescendo, evoluindo e preparando muitas novidades para
                  voce. Queremos ser mais do que uma loja: queremos fazer parte da sua
                  jornada de cuidado, confianca e evolucao.
                </p>
              </div>
            </div>

            <p className="mt-8 font-display text-xl text-accent">
              ✨ Glow Up Store — Sua beleza. Sua evolucao. Seu brilho.
            </p>
          </div>
        </div>
      </section>

      {/* AVALIACOES */}
      <section id="avaliacoes" className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <span className="eyebrow text-accent">Avaliacoes</span>
        <h2 className="mt-2 font-display text-4xl md:text-5xl">O que dizem as clientes</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className={`group relative border border-border bg-card p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 animate-fade-in-up`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <Quote className="absolute right-4 top-4 h-8 w-8 text-accent/10 transition-colors duration-300 group-hover:text-accent/25" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-sm font-medium text-accent-foreground">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.product}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
