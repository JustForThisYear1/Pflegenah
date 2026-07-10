import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Home, Search, MessageCircle, CalendarDays, User,
  LayoutDashboard, ClipboardList, Shield, Users, ArrowLeft, Briefcase, Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

type Item = { to: string; label: string; icon: LucideIcon };

const FAMILY_NAV: Item[] = [
  { to: "/family/dashboard", label: "Start", icon: Home },
  { to: "/family/discover", label: "Suchen", icon: Search },
  { to: "/family/favorites", label: "Favoriten", icon: Heart },
  { to: "/family/messages", label: "Chat", icon: MessageCircle },
  { to: "/family/bookings", label: "Termine", icon: CalendarDays },
  { to: "/family/profile", label: "Profil", icon: User },
];

const HELPER_NAV: Item[] = [
  { to: "/helper/dashboard", label: "Start", icon: LayoutDashboard },
  { to: "/helper/jobs", label: "Aufträge", icon: Briefcase },
  { to: "/helper/appointments", label: "Termine", icon: ClipboardList },
  { to: "/helper/messages", label: "Chat", icon: MessageCircle },
  { to: "/helper/profile", label: "Profil", icon: User },
];

const ADMIN_NAV: Item[] = [
  { to: "/admin", label: "Übersicht", icon: LayoutDashboard },
  { to: "/admin/verification", label: "Prüfung", icon: Shield },
  { to: "/admin/helpers", label: "Helfer", icon: Users },
];

export function AppLayout({
  children,
  variant,
  contentClassName,
}: {
  children: ReactNode;
  variant: "family" | "helper" | "admin";
  contentClassName?: string;
}) {
  const nav =
    variant === "family" ? FAMILY_NAV : variant === "helper" ? HELPER_NAV : ADMIN_NAV;

  return (
    <div className="min-h-screen bg-background">
      <main className={cn("mx-auto w-full max-w-[720px] px-4 pb-28 pt-6", contentClassName)}>
        {children}
      </main>
      <BottomNav items={nav} />
    </div>
  );
}

function BottomNav({ items }: { items: Item[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-[720px] items-stretch justify-between px-2 py-1.5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition",
                active ? "bg-primary/25" : "bg-transparent",
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopSidebarNav() {
  return null;
}

export function ScreenHeader({
  title, subtitle, right, back,
}: { title: string; subtitle?: string; right?: ReactNode; back?: boolean | string }) {
  const router = useRouter();
  const goBack = () => {
    if (typeof back === "string") {
      router.navigate({ to: back });
    } else {
      router.history.back();
    }
  };
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-start gap-2">
        {back && (
          <button
            onClick={goBack}
            aria-label="Zurück"
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-card hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {right}
    </header>
  );
}

/** Small helper so components can quickly display gradient brand header. */
export function GradientBanner({
  title, subtitle, variant = "warm",
}: { title: string; subtitle?: string; variant?: "warm" | "cool" }) {
  const _ = useStore(); void _;
  return (
    <div
      className={cn(
        "mb-6 overflow-hidden rounded-3xl p-6 text-foreground shadow-soft",
        variant === "warm" ? "gradient-warm" : "gradient-cool",
      )}
    >
      <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm/relaxed text-foreground/80">{subtitle}</p>}
    </div>
  );
}
