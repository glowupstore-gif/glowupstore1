import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchProductsGitHub, saveProductsGitHub } from "@/lib/github-products";

export interface AdminProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  category: string;
  available: boolean;
  featured: boolean;
  buyLink: string;
  createdAt: number;
}

export interface Banner {
  id: string;
  image: string;
  link: string;
  productId?: string;
  createdAt: number;
}

export interface Offer {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  createdAt: number;
}

interface AdminState {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  products: AdminProduct[];
  loading: boolean;
  loadProducts: () => Promise<void>;
  addProduct: (product: Omit<AdminProduct, "id" | "createdAt">) => Promise<void>;
  updateProduct: (id: string, product: Partial<AdminProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const ADMIN_USER = "admin";
const ADMIN_PASS = "glowup2026";

function saveFeaturedToLocal(products: AdminProduct[]) {
  const featuredIds = products.filter((p) => p.featured).map((p) => p.id);
  try {
    localStorage.setItem("glowup-featured-ids", JSON.stringify(featuredIds));
  } catch { /* ignore */ }
}

export function getFeaturedIdsFromLocal(): string[] {
  try {
    const raw = localStorage.getItem("glowup-featured-ids");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function syncToGitHub(products: AdminProduct[]) {
  if (!Array.isArray(products)) {
    throw new Error("Dados invalidos para salvar no GitHub.");
  }
  if (products.length === 0) {
    throw new Error("Bloqueado: tentativa de salvar array vazio no GitHub.");
  }
  const clean = products.map((p) => ({
    ...p,
    image: p.image.startsWith("data:") ? "" : p.image,
  }));
  const json = JSON.stringify(clean);
  if (json.length > 800000) {
    throw new Error("Arquivo muito grande para salvar no GitHub. Use links de imagem externos.");
  }
  await saveProductsGitHub({ data: clean });
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      loading: false,

      login: (user: string, pass: string) => {
        if (user === ADMIN_USER && pass === ADMIN_PASS) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false }),

      products: [],

      loadProducts: async () => {
        set({ loading: true });
        try {
          const products = await fetchProductsGitHub();
          const localProducts = get().products;
          if (Array.isArray(products) && products.length > 0) {
            const merged = products.map((p) => {
              const local = localProducts.find((lp) => lp.id === p.id);
              if (local) {
                return {
                  ...p,
                  featured: local.featured ?? p.featured,
                  available: local.available ?? p.available,
                };
              }
              return p;
            });
            set({ products: merged, loading: false });
            saveFeaturedToLocal(merged);
          } else if (localProducts.length > 0) {
            set({ loading: false });
          } else {
            set({ products: [], loading: false });
          }
        } catch {
          set({ loading: false });
        }
      },

      addProduct: async (product) => {
        const newProduct: AdminProduct = {
          ...product,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        const updated = [...get().products, newProduct];
        set({ products: updated });
        saveFeaturedToLocal(updated);
        await syncToGitHub(updated);
      },

      updateProduct: async (id, updates) => {
        const updated = get().products.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        );
        set({ products: updated });
        saveFeaturedToLocal(updated);
        await syncToGitHub(updated);
      },

      deleteProduct: async (id) => {
        const updated = get().products.filter((p) => p.id !== id);
        set({ products: updated });
        saveFeaturedToLocal(updated);
        await syncToGitHub(updated);
      },
    }),
    {
      name: "glowup-admin",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        products: state.products,
      }),
    }
  )
);
