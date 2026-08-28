import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useAdminStore } from "@/stores/adminStore";
import { CATEGORIES } from "@/lib/site";

export const Route = createFileRoute("/admin/destaques")({
  component: AdminDestaques,
});

function AdminDestaques() {
  const { products, updateProduct, loadProducts } = useAdminStore();
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const featuredCount = products.filter((p) => p.featured).length;

  const toggleFeatured = async (id: string, current: boolean) => {
    setSavingId(id);
    try {
      await updateProduct(id, { featured: !current });
      toast.success(current ? "Removido dos destaques" : "Adicionado aos destaques");
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl">Destaques</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha quais produtos aparecem na secao "Mais desejados" do site.
          {featuredCount > 0 && (
            <span className="ml-1 text-accent font-medium">
              {featuredCount} produto{featuredCount !== 1 ? "s" : ""} em destaque
            </span>
          )}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="border border-dashed border-border py-20 text-center">
          <p className="font-display text-2xl">Nenhum produto cadastrado</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Cadastre produtos primeiro na aba "Produtos" para poder destaca-los.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-4 border bg-card p-4 transition-all ${
                p.featured
                  ? "border-accent shadow-sm"
                  : "border-border hover:border-border/80"
              }`}
            >
              {/* Image */}
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden bg-secondary">
                {p.image ? (
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                    sem foto
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-lg">{p.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {p.category && (
                    <span className="capitalize">
                      {CATEGORIES.find((c) => c.query === p.category)?.label || p.category}
                    </span>
                  )}
                  {!p.available && (
                    <span className="text-destructive">Indisponivel</span>
                  )}
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleFeatured(p.id, p.featured)}
                disabled={savingId === p.id}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
                  p.featured
                    ? "border-accent bg-accent text-accent-foreground shadow-md"
                    : "border-border bg-background text-muted-foreground hover:border-accent hover:text-accent"
                } ${savingId === p.id ? "opacity-50 cursor-wait" : ""}`}
                aria-label={p.featured ? "Remover dos destaques" : "Adicionar aos destaques"}
              >
                <Star className={`h-5 w-5 ${p.featured ? "fill-current" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
