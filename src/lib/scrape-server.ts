import { createServerFn } from "@tanstack/react-start";
import { scrapeNuvemshopProductServer, type NuvemshopProduct } from "@/lib/nuvemshop";

export const scrapeProduct = createServerFn({ method: "GET" })
  .validator((url: string) => url)
  .handler(async ({ data: url }): Promise<NuvemshopProduct> => {
    return scrapeNuvemshopProductServer(url);
  });
