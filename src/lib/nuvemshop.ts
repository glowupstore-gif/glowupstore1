export interface NuvemshopProduct {
  title: string;
  description: string;
  price: string;
  image: string;
}

function parseJsonLd(html: string): NuvemshopProduct | null {
  const match = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return null;

  try {
    const data = JSON.parse(match[1]);
    const product = data["@type"] === "Product" ? data : data["@graph"]?.find((i: Record<string, string>) => i["@type"] === "Product");
    if (!product) return null;

    const offers = product.offers;
    const price = offers?.price ?? offers?.lowPrice ?? "";

    let image = "";
    if (typeof product.image === "string") {
      image = product.image;
    } else if (Array.isArray(product.image) && product.image.length > 0) {
      image = product.image[0];
    }

    return {
      title: product.name || "",
      description: stripHtml(product.description || ""),
      price: String(price),
      image,
    };
  } catch {
    return null;
  }
}

function parseOpenGraph(html: string): NuvemshopProduct | null {
  const get = (prop: string) => {
    const m = html.match(new RegExp(`<meta[^>]*(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`, "i"));
    return m?.[1] || "";
  };

  const title = get("og:title");
  if (!title) return null;

  return {
    title,
    description: get("og:description"),
    price: get("product:price:amount") || "",
    image: get("og:image"),
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function parseProduct(html: string): NuvemshopProduct {
  const jsonLd = parseJsonLd(html);
  if (jsonLd && jsonLd.title) return jsonLd;

  const og = parseOpenGraph(html);
  if (og && og.title) return og;

  throw new Error("Nao foi possivel extrair as informacoes do produto. Verifique se o link e de um produto Nuvemshop.");
}

export async function scrapeNuvemshopProduct(url: string): Promise<NuvemshopProduct> {
  const scrapeUrl = new URL("/api/scrape", window.location.origin);
  scrapeUrl.searchParams.set("url", url);

  const res = await fetch(scrapeUrl.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "Nao foi possivel acessar a pagina do produto.");
  }

  const html = await res.text();
  return parseProduct(html);
}

export async function scrapeNuvemshopProductServer(url: string): Promise<NuvemshopProduct> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error("Nao foi possivel acessar a pagina do produto.");

  const html = await res.text();
  return parseProduct(html);
}
