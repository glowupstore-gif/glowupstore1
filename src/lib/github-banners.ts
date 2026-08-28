import { createServerFn } from "@tanstack/react-start";
import type { Banner } from "@/stores/adminStore";

const REPO = "cggoncalves2000-commits/glow-up-boutique";
const FILE_PATH = "public/banners.json";
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
      return decodeURIComponent(escape(atob(data.content.replace(/\n/g, ""))));
    }
    return null;
  } catch {
    return null;
  }
}

export const fetchBannersGitHub = createServerFn({ method: "GET" })
  .handler(async (): Promise<Banner[]> => {
    try {
      const content = await getContent();
      if (!content) return [];
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

export const saveBannersGitHub = createServerFn({ method: "POST" })
  .validator((banners: Banner[]) => banners)
  .handler(async ({ data: banners }) => {
    if (!Array.isArray(banners)) {
      throw new Error("Dados invalidos: banners invalidos.");
    }

    const sha = await getFileSha();
    const content = JSON.stringify(banners, null, 2);

    if (content.length > 900000) {
      throw new Error("Arquivo muito grande. Remova imagens para salvar.");
    }

    const encoded = btoa(unescape(encodeURIComponent(content)));

    const body: Record<string, unknown> = {
      message: "feat: atualizar banners via admin",
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
      throw new Error(err?.message || "Erro ao salvar banners no GitHub.");
    }

    return { ok: true };
  });
