import { Heart, Instagram, Mail } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";
import logo from "@/assets/favicon.jpg";

export function SiteFooter() {
  return (
    <footer className="surface-ink relative mt-24 overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-rose/5 blur-[80px]" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3 md:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="Glow Up Store" className="h-12 w-12 rounded-full object-cover" />
            <p className="font-display text-3xl">Glow Up Store</p>
          </div>
          <p className="mt-3 max-w-xs text-sm text-ink-foreground/60">
            Beleza e autocuidado selecionados com curadoria. Compre pelo site ou fale com a gente no
            WhatsApp.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-foreground/15 text-ink-foreground/60 transition-all duration-300 hover:border-whatsapp hover:bg-whatsapp hover:text-whatsapp-foreground"
              aria-label="WhatsApp"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.03.24-3.47-.72-2.94-1.16-4.8-4.2-4.95-4.4-.14-.2-1.17-1.56-1.17-2.98 0-1.42.75-2.11 1.01-2.4.27-.29.58-.36.77-.36.19 0 .39 0 .55.01.19.01.44-.07.68.53.24.6.82 2.02.89 2.17.07.15.12.32.02.51-.1.19-.34.53-.55.72-.15.14-.31.29-.14.58.17.29.75 1.24 1.6 2 1.1.98 1.87 1.29 2.16 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.65-.14.26.1 1.67.79 1.96.93.29.14.48.22.55.34.07.12.07.68-.17 1.36Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/glow_wupstore/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-foreground/15 text-ink-foreground/60 transition-all duration-300 hover:border-accent hover:bg-accent hover:text-accent-foreground"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-foreground/15 text-ink-foreground/60 transition-all duration-300 hover:border-rose-soft hover:bg-rose-soft hover:text-ink"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <p className="eyebrow text-ink-foreground/50">Atendimento</p>
          <ul className="mt-4 space-y-3 text-sm text-ink-foreground/75">
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-rose-soft"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.03.24-3.47-.72-2.94-1.16-4.8-4.2-4.95-4.4-.14-.2-1.17-1.56-1.17-2.98 0-1.42.75-2.11 1.01-2.4.27-.29.58-.36.77-.36.19 0 .39 0 .55.01.19.01.44-.07.68.53.24.6.82 2.02.89 2.17.07.15.12.32.02.51-.1.19-.34.53-.55.72-.15.14-.31.29-.14.58.17.29.75 1.24 1.6 2 1.1.98 1.87 1.29 2.16 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.65-.14.26.1 1.67.79 1.96.93.29.14.48.22.55.34.07.12.07.68-.17 1.36Z" />
                </svg>
                WhatsApp
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> {SITE.email}
            </li>
            <li>
              <a
                href="https://www.instagram.com/glow_wupstore/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-accent"
              >
                <Instagram className="h-3.5 w-3.5" /> {SITE.instagram}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-ink-foreground/50">Compra segura</p>
          <p className="mt-4 text-sm text-ink-foreground/70">
            Checkout processado pela Nuvemshop, com pagamento protegido e envio para todo o Brasil.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-ink-foreground/50">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
            Pagamento 100% seguro
          </div>
        </div>
      </div>

      {/* Selos de confiança */}
      <div className="border-t border-ink-foreground/10 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 md:gap-6">
          {/* SSL Seguro */}
          <div className="flex items-center gap-2 rounded-lg border border-ink-foreground/10 bg-ink-foreground/5 px-3 py-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-green-400" aria-hidden="true">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
            <div>
              <p className="text-[11px] font-bold text-ink-foreground/80">SSL Seguro</p>
              <p className="text-[9px] text-ink-foreground/50">Conexão criptografada</p>
            </div>
          </div>

          {/* Site Confiável */}
          <div className="flex items-center gap-2 rounded-lg border border-ink-foreground/10 bg-ink-foreground/5 px-3 py-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-green-400" aria-hidden="true">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
            <div>
              <p className="text-[11px] font-bold text-ink-foreground/80">Site Confiável</p>
              <p className="text-[9px] text-ink-foreground/50">Verificado e auditado</p>
            </div>
          </div>

          {/* Nuvemshop */}
          <div className="flex items-center gap-2 rounded-lg border border-ink-foreground/10 bg-ink-foreground/5 px-3 py-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-blue-400" aria-hidden="true">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17l5.09-5.09 1.41 1.41L10 17z" />
            </svg>
            <div>
              <p className="text-[11px] font-bold text-ink-foreground/80">Nuvemshop</p>
              <p className="text-[9px] text-ink-foreground/50">Checkout seguro</p>
            </div>
          </div>

          {/* Compra Protegida */}
          <div className="flex items-center gap-2 rounded-lg border border-ink-foreground/10 bg-ink-foreground/5 px-3 py-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-green-400" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <div>
              <p className="text-[11px] font-bold text-ink-foreground/80">Compra Protegida</p>
              <p className="text-[9px] text-ink-foreground/50">Troca em 30 dias</p>
            </div>
          </div>

          {/* Google Business */}
          <div className="flex items-center gap-2 rounded-lg border border-ink-foreground/10 bg-ink-foreground/5 px-3 py-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <div>
              <p className="text-[11px] font-bold text-ink-foreground/80">Google Verificado</p>
              <p className="text-[9px] text-ink-foreground/50">Negócio confiável</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10 px-4 py-5 text-center text-xs text-ink-foreground/45 md:px-8">
        <span className="inline-flex items-center gap-1">
          Feito com <Heart className="h-3 w-3 fill-rose text-rose" /> por Glow Up Store
        </span>
        <span className="mx-2">·</span>
        &copy; {new Date().getFullYear()} Todos os direitos reservados.
      </div>
    </footer>
  );
}
