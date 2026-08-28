import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Loader2, Plus, Trash2, Camera, Pencil, X, Check } from "lucide-react";
import { type Offer } from "@/stores/adminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchOffersGitHub, saveOffersGitHub } from "@/lib/github-offers";
import { compressImage } from "@/lib/compress-image";
import offerBanner from "@/assets/offer-banner.jpg";

export const Route = createFileRoute("/admin/ofertas")({
  component: AdminOfertas,
});

const DEFAULT: Offer = {
  id: "default-offer",
  image: offerBanner,
  eyebrow: "Ofertas da semana",
  title: "Kits selecionados com condicoes especiais",
  buttonText: "Ver ofertas",
  buttonLink: "https://wa.me/5500000000000?text=Oi!%20Quero%20saber%20as%20ofertas%20da%20semana%20da%20Glow%20Up%20Store",
  createdAt: 0,
};

function AdminOfertas() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editField, setEditField] = useState<Partial<Offer>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ eyebrow: "", title: "", buttonText: "", buttonLink: "", image: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchOffersGitHub();
        if (data.length === 0) {
          setOffers([{ ...DEFAULT }]);
        } else {
          setOffers(data);
        }
      } catch {
        setOffers([{ ...DEFAULT }]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (updated: Offer[]) => {
    setSaving(true);
    const json = JSON.stringify(updated);
    if (json.length > 900000) {
      alert("Arquivo muito grande. Use links de imagem externos.");
      setSaving(false);
      return;
    }
    try {
      await saveOffersGitHub({ data: updated });
      setOffers(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    if (!form.image || !form.title) return;
    const newOffer: Offer = {
      id: crypto.randomUUID(),
      image: form.image,
      eyebrow: form.eyebrow,
      title: form.title,
      buttonText: form.buttonText,
      buttonLink: form.buttonLink,
      createdAt: Date.now(),
    };
    persist([...offers, newOffer]);
    setForm({ eyebrow: "", title: "", buttonText: "", buttonLink: "", image: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    persist(offers.filter((o) => o.id !== id));
    setConfirmDelete(null);
  };

  const handleEditSave = (id: string) => {
    persist(offers.map((o) => (o.id === id ? { ...o, ...editField } : o)));
    setEditing(null);
    setEditField({});
  };

  const handleNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleEditImage = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Imagem muito grande. Maximo 5MB.");
      return;
    }
    try {
      const compressed = await compressImage(file);
      persist(offers.map((o) => (o.id === id ? { ...o, image: compressed } : o)));
    } catch {
      alert("Erro ao processar imagem.");
    }
    setEditingImageId(null);
    e.target.value = "";
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Ofertas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {offers.length} oferta{offers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2" disabled={saving}>
          <Plus className="h-4 w-4" />
          Nova oferta
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="w-full max-w-lg border border-border bg-background p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">Nova oferta</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Imagem de fundo</Label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex h-40 cursor-pointer items-center justify-center border-2 border-dashed border-border bg-secondary transition-colors hover:border-accent"
                >
                  {form.image ? (
                    <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm text-muted-foreground">Clique para enviar uma imagem</span>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleNewImage} className="hidden" />
                {form.image && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, image: "" }))} className="text-xs text-destructive hover:underline">
                    Remover imagem
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eyebrow">Texto pequeno (eyebrow)</Label>
                <Input
                  id="eyebrow"
                  value={form.eyebrow}
                  onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))}
                  placeholder="Ex: Ofertas da semana"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titulo principal *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Kits selecionados com condicoes especiais"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="btnText">Texto do botao</Label>
                <Input
                  id="btnText"
                  value={form.buttonText}
                  onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))}
                  placeholder="Ex: Ver ofertas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="btnLink">Link do botao</Label>
                <Input
                  id="btnLink"
                  value={form.buttonLink}
                  onChange={(e) => setForm((f) => ({ ...f, buttonLink: e.target.value }))}
                  placeholder="https://wa.me/..."
                  type="url"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleAdd} className="flex-1" disabled={!form.image || !form.title || saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar oferta"}
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
        <div className="mt-8 space-y-4">
          {offers.map((o) => (
            <div key={o.id} className="group border border-border bg-card">
              {/* Image preview */}
              <div className="relative aspect-video overflow-hidden bg-secondary">
                <img src={o.image} alt={o.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center gap-2 px-6 md:px-14">
                  {editing === o.id ? (
                    <>
                      <Input
                        value={editField.eyebrow ?? o.eyebrow}
                        onChange={(e) => setEditField((f) => ({ ...f, eyebrow: e.target.value }))}
                        className="h-8 w-full max-w-xs text-xs bg-ink/50 border-ink/30 text-ink-foreground"
                        placeholder="Texto pequeno"
                      />
                      <Input
                        value={editField.title ?? o.title}
                        onChange={(e) => setEditField((f) => ({ ...f, title: e.target.value }))}
                        className="h-10 w-full max-w-sm font-display text-xl bg-ink/50 border-ink/30 text-ink-foreground"
                        placeholder="Titulo principal"
                      />
                    </>
                  ) : (
                    <>
                      <span className="eyebrow text-rose-soft">{o.eyebrow}</span>
                      <h3 className="max-w-sm font-display text-2xl leading-tight text-ink-foreground md:text-3xl">{o.title}</h3>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => { setEditingImageId(o.id); setTimeout(() => editFileRef.current?.click(), 0); }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-colors hover:bg-background"
                    title="Trocar imagem"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(o.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-destructive backdrop-blur transition-colors hover:bg-background"
                    title="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Fields */}
              <div className="p-4 space-y-3">
                {editing === o.id ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Texto do botao</Label>
                        <Input
                          value={editField.buttonText ?? o.buttonText}
                          onChange={(e) => setEditField((f) => ({ ...f, buttonText: e.target.value }))}
                          className="h-8 text-xs"
                          placeholder="Ver ofertas"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Link do botao</Label>
                        <Input
                          value={editField.buttonLink ?? o.buttonLink}
                          onChange={(e) => setEditField((f) => ({ ...f, buttonLink: e.target.value }))}
                          className="h-8 text-xs"
                          placeholder="https://wa.me/..."
                          type="url"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEditSave(o.id)} disabled={saving} className="gap-1">
                        <Check className="h-3.5 w-3.5" /> Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditing(null); setEditField({}); }}>
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{o.buttonText || "Sem botao"}</span>
                      {" → "}{o.buttonLink || "Sem link"}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setEditing(o.id); setEditField({}); }}
                      className="gap-1 text-xs"
                    >
                      <Pencil className="h-3 w-3" /> Editar
                    </Button>
                  </div>
                )}

                {confirmDelete === o.id && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground mb-2">Remover esta oferta?</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(o.id)} className="flex-1" disabled={saving}>
                        Sim, remover
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDelete(null)} className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <input
        ref={editFileRef}
        type="file"
        accept="image/*"
        onChange={(e) => { if (editingImageId) handleEditImage(editingImageId, e); }}
        className="hidden"
      />
    </div>
  );
}
