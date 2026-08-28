import { createServerFn } from "@tanstack/react-start";
import type { AdminProduct } from "@/stores/adminStore";

const REPO = "cggoncalves2000-commits/glow-up-boutique";
const FILE_PATH = "public/products.json";
const BRANCH = "main";

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN nao configurado.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "glowup-app",
  };
}

async function getFileSha(): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      { headers: getHeaders() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha ?? null;
  } catch {
    return null;
  }
}

async function getContent(): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      { headers: getHeaders() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.encoding === "base64") {
      const decoded = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ""))));
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export const fetchProductsGitHub = createServerFn({ method: "GET" })
  .handler(async (): Promise<AdminProduct[]> => {
    try {
      const content = await getContent();
      if (!content) return [];
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

export const saveProductsGitHub = createServerFn({ method: "POST" })
  .validator((products: AdminProduct[]) => products)
  .handler(async ({ data: products }) => {
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("Dados invalidos: produtos vazio ou invalido.");
    }

    for (const p of products) {
      if (!p.id || !p.title) {
        throw new Error("Produto invalido: titulo ou id ausente.");
      }
    }

    const sha = await getFileSha();
    const content = JSON.stringify(products, null, 2);

    if (content.length > 900000) {
      throw new Error("Arquivo muito grande. Remova imagens de produtos para salvar.");
    }

    const encoded = btoa(unescape(encodeURIComponent(content)));

    const body: Record<string, unknown> = {
      message: "feat: atualizar produtos via admin",
      content: encoded,
      branch: BRANCH,
    };
    if (sha) body.sha = sha;

    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || "Erro ao salvar produtos no GitHub.");
    }

    return { ok: true };
  });
