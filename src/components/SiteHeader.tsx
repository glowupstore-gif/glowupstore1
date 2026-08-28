import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import logo from "@/assets/favicon.jpg";

export type SectionId = "destaques" | "categorias" | "sobrenos";

const NAV = [
  { label: "Destaques", id: "destaques" as const },
  { label: "Categorias", id: "categorias" as const },
  { label: "Sobre nos", id: "sobrenos" as const },
];

interface SiteHeaderProps {
  activeSection: SectionId;
  onNavigate: (id: SectionId) => void;
}

export function SiteHeader({ activeSection, onNavigate }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center px-4 md:px-8">
        <Link to="/" className="group flex items-center gap-2.5 leading-none">
          <img src={logo} alt="Glow Up Store" className="h-9 w-9 rounded-full object-cover shadow-md transition-shadow group-hover:shadow-lg" />
          <div className="flex flex-col">
            <span className="font-display text-xl tracking-tight transition-colors group-hover:text-accent">
              Glow Up
            </span>
            <span className="eyebrow text-[8px] text-accent">{SITE.tagline}</span>
          </div>
        </Link>

        <nav className="absolute left-1/2 -translate-x-1/2 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative px-3 py-2 text-sm transition-colors ${
                activeSection === item.id ? "text-accent" : "text-foreground/70 hover:text-accent"
              }`}
            >
              {item.label}
              <span
                className={`absolute bottom-0 left-3 right-3 h-0.5 transition-transform duration-300 ${
                  activeSection === item.id ? "scale-x-100 bg-accent" : "scale-x-0 bg-accent"
                }`}
              />
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
