import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useAdminStore, type AdminProduct } from "@/stores/adminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/lib/site";
import { scrapeProduct } from "@/lib/scrape-server";
import { compressImage } from "@/lib/compress-image";

export const Route = createFileRoute("/admin/produtos")({
  component: AdminProdutos,
});

const EMPTY: Omit<AdminProduct, "id" | "createdAt"> = {
  title: "",
  description: "",
  price: "",
  image: "",
  category: "",
  available: true,
  featured: false,
  buyLink: "",
};

function AdminProdutos() {
  const { products, addProduct, updateProduct, deleteProduct, loadProducts, loading } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      price: p.price,
      image: p.image,
      category: p.category,
      available: p.available,
      featured: p.featured,
      buyLink: p.buyLink || "",
    });
    setShowForm(true);
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Imagem muito grande. Maximo 5MB.");
      return;
    }
    try {
      const compressed = await compressImage(file);
      setForm((f) => ({ ...f, image: compressed }));
    } catch {
      alert("Erro ao processar imagem.");
    }
  };

  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError("");
    try {
      const data = await scrapeProduct({ data: importUrl });
      setForm((f) => ({
        ...f,
        title: data.title || f.title,
        description: data.description || f.description,
        price: data.price || f.price,
        image: data.image || f.image,
        buyLink: importUrl,
      }));
      setImportUrl("");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Erro ao importar produto.");
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price) return;
    if (editing) {
      updateProduct(editing.id, form);
    } else {
      addProduct(form);
    }
    setShowForm(false);
    setForm(EMPTY);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setConfirmDelete(null);
  };

  const formatPrice = (val: string) => {
    const num = parseFloat(val.replace(/[^\d,]/g, "").replace(",", "."));
    if (isNaN(num)) return val;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Produtos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo produto
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border bg-background p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">
                {editing ? "Editar produto" : "Novo produto"}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Import from Nuvemshop URL */}
              <div className="space-y-2">
                <Label>Importar da Nuvemshop</Label>
                <div className="flex gap-2">
                  <Input
                    value={importUrl}
                    onChange={(e) => { setImportUrl(e.target.value); setImportError(""); }}
                    placeholder="Cole o link do produto Nuvemshop..."
                    disabled={importing}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImport}
                    disabled={importing || !importUrl.trim()}
                    className="shrink-0 gap-2"
                  >
                    {importing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Importar
                  </Button>
                </div>
                {importError && (
                  <p className="text-xs text-destructive">{importError}</p>
                )}
              </div>

              {/* Image upload */}
              <div className="space-y-2">
                <Label>Foto do produto</Label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex h-40 cursor-pointer items-center justify-center border-2 border-dashed border-border bg-secondary transition-colors hover:border-accent"
                >
                  {form.image ? (
                    <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm text-muted-foreground">Clique para enviar uma foto</span>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                />
                {form.image && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image: "" }))}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remover imagem
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titulo *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Nome do produto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Descricao</Label>
                <textarea
                  id="desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Descricao do produto"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preco (R$) *</Label>
                  <Input
                    id="price"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat">Categoria</Label>
                  <select
                    id="cat"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecione</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.query} value={c.query}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyLink">Link de compra (redireciona ao clicar em Comprar)</Label>
                <Input
                  id="buyLink"
                  value={form.buyLink}
                  onChange={(e) => setForm((f) => ({ ...f, buyLink: e.target.value }))}
                  placeholder="https://..."
                  type="url"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={form.available}
                  onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="available" className="text-sm font-normal">
                  Disponivel para venda
                </Label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  {editing ? "Salvar alteracoes" : "Cadastrar produto"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditing(null); }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product list */}
      {products.length === 0 ? (
        <div className="mt-12 border border-dashed border-border py-20 text-center">
          <p className="font-display text-2xl">Nenhum produto cadastrado</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Clique em "Novo produto" para comecar a cadastrar seus produtos.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col border border-border bg-card transition-all hover:shadow-card-hover"
            >
              <div className="relative aspect-square overflow-hidden bg-secondary">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    sem imagem
                  </div>
                )}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-colors hover:bg-background"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-destructive backdrop-blur transition-colors hover:bg-background"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {!p.available && (
                  <span className="eyebrow absolute left-0 top-0 bg-ink px-2 py-1 text-ink-foreground">
                    Indisponivel
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-lg leading-snug">{p.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.description || "Sem descricao"}
                </p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-base font-medium text-primary">
                    {formatPrice(p.price)}
                  </span>
                  {p.category && (
                    <span className="text-xs text-muted-foreground capitalize">
                      {CATEGORIES.find((c) => c.query === p.category)?.label || p.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete confirmation */}
              {confirmDelete === p.id && (
                <div className="border-t border-border p-3">
                  <p className="text-xs text-muted-foreground mb-2">Remover este produto?</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(p.id)}
                      className="flex-1"
                    >
                      Sim, remover
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
