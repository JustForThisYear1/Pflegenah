import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Users, HandHeart, Shield, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DemoSwitcher() {
  const { demoMode, disableDemoMode } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(true);

  if (!demoMode) return null;
  // Hide on landing page
  if (pathname === "/") return null;

  const items = [
    { to: "/family/dashboard", label: "Familie", icon: Users },
    { to: "/helper/dashboard", label: "Helfer", icon: HandHeart },
    { to: "/admin", label: "Admin", icon: Shield },
  ];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background shadow-soft"
        aria-label="Demo-Switcher öffnen"
      >
        <Shield className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-3 z-50 flex items-center gap-1 rounded-full border border-border bg-card/95 p-1 shadow-soft backdrop-blur">
      <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Demo
      </span>
      {items.map(({ to, label, icon: Icon }) => {
        const active = pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold transition",
              active ? "bg-foreground text-background" : "text-foreground hover:bg-muted",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
      <Link
        to="/"
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        aria-label="Zur Startseite"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      <button
        onClick={() => { disableDemoMode(); setOpen(false); }}
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        aria-label="Demo beenden"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
