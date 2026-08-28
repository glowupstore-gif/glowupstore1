import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAdminStore } from "@/stores/adminStore";
import { Image, LayoutGrid, Star, Tag } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const SIDEBAR = [
  { label: "Produtos", href: "/admin/produtos", icon: LayoutGrid },
  { label: "Destaques", href: "/admin/destaques", icon: Star },
  { label: "Banners", href: "/admin/banners", icon: Image },
  { label: "Ofertas", href: "/admin/ofertas", icon: Tag },
];

function AdminLayout() {
  const { isAuthenticated, logout } = useAdminStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !isAuthenticated && location.pathname !== "/admin/login") {
      navigate({ to: "/admin/login" });
    }
  }, [ready, isAuthenticated, location.pathname, navigate]);

  const isLoginPage = location.pathname === "/admin/login";

  if (!ready || (!isAuthenticated && !isLoginPage)) {
    return null;
  }

  if (!isAuthenticated && isLoginPage) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8">
          <a href="/admin/produtos" className="font-display text-xl">
            Glow Up <span className="text-accent">Admin</span>
          </a>
          <nav className="flex items-center gap-4">
            <a href="/" className="text-sm text-foreground/70 hover:text-accent transition-colors">
              Ver loja
            </a>
            <button
              onClick={logout}
              className="text-sm text-destructive hover:text-destructive/80 transition-colors"
            >
              Sair
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-8">
        {/* Sidebar */}
        <aside className="w-48 flex-shrink-0">
          <nav className="sticky top-20 space-y-1">
            {SIDEBAR.map((item) => {
              const active = location.pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-foreground/70 hover:bg-background hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
