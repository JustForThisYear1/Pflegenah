import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Heart, Users, User, HandHeart, ArrowRight, ShieldCheck, Instagram } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pflegenah – Nähe finden leicht gemacht" },
      { name: "description", content: "Alltagshilfe, Begleitung und Gesellschaft für Ihre Angehörigen – warmherzig, geprüft, in Ihrer Nähe." },
    ],
  }),
  component: RoleSelection,
});

type Option = {
  role: Role;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "peach" | "sky" | "mint";
  target: string;
};

const OPTIONS: Option[] = [
  {
    role: "family",
    title: "Nahestehende Person",
    description: "Ich suche Unterstützung für meine Angehörigen",
    icon: Users,
    tone: "peach",
    target: "/family/dashboard",
  },
  {
    role: "user",
    title: "Hilfesuchender",
    description: "Ich suche nach Unterstützung im Alltag",
    icon: User,
    tone: "sky",
    target: "/family/dashboard",
  },
  {
    role: "helper",
    title: "Helfer:in",
    description: "Ich möchte Menschen im Alltag unterstützen",
    icon: HandHeart,
    tone: "mint",
    target: "/helper/dashboard",
  },
];

const ONBOARDING_TARGET: Record<Role, string> = {
  family: "/onboarding/family",
  user: "/onboarding/family",
  helper: "/onboarding/helper",
  admin: "/admin",
};

function RoleSelection() {
  const { setRole, demoMode, enableDemoMode, disableDemoMode } = useStore();
  const navigate = useNavigate();

  const choose = (opt: Option) => {
    setRole(opt.role);
    if (demoMode) {
      enableDemoMode(opt.role);
      navigate({ to: opt.target });
    } else {
      navigate({ to: ONBOARDING_TARGET[opt.role] });
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-[520px] flex-col items-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full gradient-hero shadow-soft">
          <Heart className="h-11 w-11 text-white" strokeWidth={2.5} fill="white" />
        </div>
        <h1 className="text-center text-4xl font-black tracking-tight sm:text-5xl">Pflegenah</h1>
        <p className="mt-2 text-center text-base text-muted-foreground">Nähe finden leicht gemacht</p>

        <div className="mt-8 flex w-full items-center justify-between rounded-2xl bg-card p-4 shadow-card">
          <div className="pr-3">
            <div className="text-sm font-bold text-foreground">Demo-Modus</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {demoMode
                ? "An – Rollen springen direkt ins Dashboard, keine Eingaben nötig."
                : "Aus – Rollen führen durchs normale Onboarding."}
            </div>
          </div>
          <button
            role="switch"
            aria-checked={demoMode}
            onClick={() => (demoMode ? disableDemoMode() : enableDemoMode())}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition",
              demoMode ? "bg-foreground" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-6 w-6 rounded-full bg-background shadow transition",
                demoMode ? "left-[22px]" : "left-0.5",
              )}
            />
          </button>
        </div>

        <p className="mt-8 mb-4 text-sm font-semibold text-foreground/80">Ich bin hier als…</p>

        <div className="flex w-full flex-col gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.role}
              onClick={() => choose(opt)}
              className={cn(
                "group flex items-center gap-4 rounded-2xl bg-card p-4 text-left shadow-card transition",
                "hover:-translate-y-0.5 hover:shadow-soft active:scale-[0.99]",
              )}
            >
              <div className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                opt.tone === "peach" && "bg-peach-soft text-[color:var(--peach)]",
                opt.tone === "sky" && "bg-sky-soft text-[color:var(--sky)]",
                opt.tone === "mint" && "bg-mint-soft text-[color:var(--mint)]",
              )}>
                <opt.icon className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <div className="flex-1">
                <div className="text-base font-bold text-foreground">{opt.title}</div>
                <div className="mt-0.5 text-sm text-muted-foreground">{opt.description}</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          Alle Helfer:innen werden geprüft und verifiziert
        </div>

        <button
          onClick={() => navigate({ to: "/admin" })}
          className="mt-6 text-xs text-muted-foreground/70 underline-offset-2 hover:underline"
        >
          Admin-Bereich
        </button>

        <footer className="mt-10 flex w-full flex-col items-center gap-4 border-t border-border pt-6">
          <a
            href="https://www.instagram.com/pflegenah/"
            target="_blank"
            rel="noreferrer"
            aria-label="Pflegenah auf Instagram"
            className="flex h-11 w-11 items-center justify-center rounded-full gradient-warm text-foreground shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <Link to="/ueber-uns" className="hover:text-foreground hover:underline">Über uns</Link>
            <span aria-hidden>·</span>
            <Link to="/impressum" className="hover:text-foreground hover:underline">Impressum</Link>
            <span aria-hidden>·</span>
            <Link to="/datenschutz" className="hover:text-foreground hover:underline">Datenschutz</Link>
            <span aria-hidden>·</span>
            <Link to="/nutzungsbedingungen" className="hover:text-foreground hover:underline">Nutzungsbedingungen</Link>
          </nav>
          <p className="text-[11px] text-muted-foreground/70">© {new Date().getFullYear()} Pflegenah</p>
        </footer>
      </div>
    </div>
  );
}
