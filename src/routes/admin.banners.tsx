import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Loader2, Plus, Trash2, Camera, X, Check } from "lucide-react";
import { toast } from "sonner";
import { type Banner, type AdminProduct } from "@/stores/adminStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fetchBannersGitHub, saveBannersGitHub } from "@/lib/github-banners";
import { fetchProductsGitHub } from "@/lib/github-products";
import { compressImage } from "@/lib/compress-image";
import carrosel1 from "@/assets/carrosel 1.jpeg";
import carrosel2 from "@/assets/carrosel 2.jpeg";
import carrosel3 from "@/assets/carrosel 3.jpeg";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
});

const DEFAULTS: Banner[] = [
  { id: "default-1", image: carrosel1, link: "", createdAt: 0 },
  { id: "default-2", image: carrosel2, link: "", createdAt: 0 },
  { id: "default-3", image: carrosel3, link: "", createdAt: 0 },
];

function mergeDefaults(saved: Banner[]): Banner[] {
  const defaults = DEFAULTS.map((d) => {
    const existing = saved.find((b) => b.id === d.id);
    return existing
      ? { ...d, link: existing.link, productId: existing.productId, image: existing.image }
      : null;
  }).filter(Boolean) as Banner[];
  return defaults.concat(saved.filter((b) => !DEFAULTS.some((d) => d.id === b.id)));
}

function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formImage, setFormImage] = useState("");
  const [formProductId, setFormProductId] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editProductId, setEditProductId] = useState("");
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [bannerData, productData] = await Promise.all([
          fetchBannersGitHub(),
          fetchProductsGitHub(),
        ]);
        setBanners(mergeDefaults(bannerData));
        setProducts(Array.isArray(productData) ? productData : []);
      } catch {
        setBanners([...DEFAULTS]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (updated: Banner[]) => {
    setSaving(true);
    const json = JSON.stringify(updated);
    if (json.length > 900000) {
      setSaving(false);
      throw new Error("Arquivo muito grande. Use links de imagem externos.");
    }
    await saveBannersGitHub({ data: updated });
    setBanners(updated);
    setSaving(false);
  };

  const getProductLink = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.buyLink || "";
  };

  const handleAdd = async () => {
    if (!formImage) return;
    const link = getProductLink(formProductId);
    const newBanner: Banner = {
      id: crypto.randomUUID(),
      image: formImage,
      link,
      productId: formProductId || undefined,
      createdAt: Date.now(),
    };
    const updated = [...banners, newBanner];
    setFormImage("");
    setFormProductId("");
    setShowForm(false);
    try {
      await persist(updated);
      toast.success("Banner adicionado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar banner.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await persist(banners.filter((b) => b.id !== id));
      setConfirmDelete(null);
      toast.success("Banner removido");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover banner.");
    }
  };

  const handleEditImage = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Imagem muito grande. Maximo 15MB.");
      return;
    }
    try {
      const compressed = await compressImage(file);
      await persist(banners.map((b) => (b.id === id ? { ...b, image: compressed } : b)));
      toast.success("Imagem atualizada");
    } catch {
      toast.error("Erro ao processar imagem.");
    }
    setEditingImage(null);
    e.target.value = "";
  };

  const handleEditProduct = async (id: string) => {
    const link = getProductLink(editProductId);
    try {
      await persist(
        banners.map((b) =>
          b.id === id ? { ...b, link, productId: editProductId || undefined } : b
        )
      );
      toast.success("Produto vinculado atualizado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    }
    setEditing(null);
  };

  const handleNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("Imagem muito grande. Maximo 15MB.");
      return;
    }
    try {
      const compressed = await compressImage(file);
      setFormImage(compressed);
    } catch {
      alert("Erro ao processar imagem.");
    }
  };

  const selectedProduct = products.find((p) => p.id === formProductId);
  const editingProduct = products.find((p) => p.id === editProductId);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Banners</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {banners.length} banner{banners.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2" disabled={saving}>
          <Plus className="h-4 w-4" />
          Novo banner
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="w-full max-w-lg border border-border bg-background p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">Novo banner</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Imagem do banner</Label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex h-40 cursor-pointer items-center justify-center border-2 border-dashed border-border bg-secondary transition-colors hover:border-accent"
                >
                  {formImage ? (
                    <img src={formImage} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm text-muted-foreground">Clique para enviar uma imagem</span>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleNewImage} className="hidden" />
                {formImage && (
                  <button type="button" onClick={() => setFormImage("")} className="text-xs text-destructive hover:underline">
                    Remover imagem
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Produto ao clicar</Label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Nenhum (sem link)</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} — R$ {p.price}
                    </option>
                  ))}
                </select>
                {selectedProduct && (
                  <p className="text-xs text-muted-foreground">
                    Link: {selectedProduct.buyLink || "produto sem link de compra"}
                  </p>
                )}
                {products.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Cadastre produtos primeiro na aba "Produtos"
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleAdd} className="flex-1" disabled={!formImage || saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar banner"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b, idx) => {
            const linkedProduct = b.productId ? products.find((p) => p.id === b.productId) : null;
            return (
              <div key={b.id} className="group flex flex-col border border-border bg-card">
                <div className="relative aspect-video overflow-hidden bg-secondary">
                  <img src={b.image} alt={`Banner ${idx + 1}`} className="h-full w-full object-cover" />
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => { setEditingImage(b.id); setTimeout(() => editFileRef.current?.click(), 0); }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-colors hover:bg-background"
                      title="Trocar imagem"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(b.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-destructive backdrop-blur transition-colors hover:bg-background"
                      title="Remover"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {editing === b.id ? (
                    <div className="space-y-2">
                      <select
                        value={editProductId}
                        onChange={(e) => setEditProductId(e.target.value)}
                        className="flex h-8 w-full rounded-md border border-border bg-background px-2 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Nenhum (sem link)</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                      {editingProduct && (
                        <p className="text-[10px] text-muted-foreground">
                          Link: {editingProduct.buyLink || "sem link"}
                        </p>
                      )}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditProduct(b.id)}
                          className="flex h-7 flex-1 items-center justify-center rounded bg-accent text-accent-foreground text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" /> Salvar
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditing(b.id); setEditProductId(b.productId || ""); }}
                      className="w-full text-left text-xs text-muted-foreground hover:text-foreground truncate"
                    >
                      {linkedProduct
                        ? `🔗 ${linkedProduct.title}`
                        : b.link
                          ? `🔗 ${b.link}`
                          : "Clique para vincular um produto"}
                    </button>
                  )}
                </div>

                {confirmDelete === b.id && (
                  <div className="border-t border-border p-3">
                    <p className="text-xs text-muted-foreground mb-2">Remover este banner?</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(b.id)} className="flex-1" disabled={saving}>
                        Sim, remover
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDelete(null)} className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <input
        ref={editFileRef}
        type="file"
        accept="image/*"
        onChange={(e) => { if (editingImage) handleEditImage(editingImage, e); }}
        className="hidden"
      />
    </div>
  );
}
