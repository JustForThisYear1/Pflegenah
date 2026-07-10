import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Sparkles, Star, MapPin, Euro, ShieldCheck, MessageCircle, FileText, Heart, ChevronRight, List, Map as MapIcon } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { MapBoundary } from "@/components/MapBoundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { scoreHelper, type Helper } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const HelpersMap = lazy(() => import("@/components/HelpersMap").then((m) => ({ default: m.HelpersMap })));

export const Route = createFileRoute("/family/discover")({
  head: () => ({ meta: [{ title: "Helfer:innen finden · Pflegenah" }] }),
  component: Discover,
});

function Discover() {
  const { helpers, familyProfile, ensureMatch, favorites, toggleFavorite } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "verified">("all");
  const [view, setView] = useState<"list" | "map">("list");

  const filtered = useMemo(
    () => helpers.filter((h) => (filter === "verified" ? h.verified : true)),
    [helpers, filter],
  );

  const scored = useMemo(() => {
    return filtered
      .map((h) => ({ helper: h, ...scoreHelper(h, familyProfile) }))
      .sort((a, b) => b.score - a.score);
  }, [filtered, familyProfile]);

  const openChat = (helper: Helper) => {
    const m = ensureMatch(helper.id);
    navigate({ to: "/family/messages/$id", params: { id: m.helperId } });
  };

  const onToggleFav = (helper: Helper) => {
    const wasFav = favorites.includes(helper.id);
    toggleFavorite(helper.id);
    toast.success(wasFav ? `${helper.name} aus Favoriten entfernt` : `${helper.name} zu Favoriten hinzugefügt`);
  };

  return (
    <AppLayout variant="family">
      <ScreenHeader
        title="Betreuungskräfte"
        subtitle={`${scored.length} passende Helfer:innen gefunden`}
        right={
          <Badge className="gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" /> KI-Match
          </Badge>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-card">
          <ToggleBtn active={view === "list"} onClick={() => setView("list")} icon={List} label="Liste" />
          <ToggleBtn active={view === "map"} onClick={() => setView("map")} icon={MapIcon} label="Karte" />
        </div>
        <div className="flex gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>Alle</FilterPill>
          <FilterPill active={filter === "verified"} onClick={() => setFilter("verified")}>Verifiziert</FilterPill>
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-4">
          {scored.map(({ helper, score, reasons }, idx) => (
            <HelperCard
              key={helper.id}
              helper={helper}
              score={score}
              reasons={reasons}
              rank={idx + 1}
              isFav={favorites.includes(helper.id)}
              onFav={() => onToggleFav(helper)}
              onChat={() => openChat(helper)}
              onOpenCV={() => navigate({ to: "/helper/$id/cv", params: { id: helper.id } })}
            />
          ))}
        </div>
      ) : (
        <ClientOnly fallback={<MapFallback />}>
          <MapBoundary>
            <Suspense fallback={<MapFallback />}>
              <HelpersMap helpers={filtered} />
            </Suspense>
          </MapBoundary>
        </ClientOnly>
      )}
    </AppLayout>
  );
}

function MapFallback() {
  return (
    <div className="flex h-[520px] items-center justify-center rounded-3xl border border-border bg-muted text-sm text-muted-foreground shadow-card">
      Karte wird geladen…
    </div>
  );
}

function ClientOnly({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? children : fallback}</>;
}

function ToggleBtn({ active, onClick, icon: Icon, label }: {
  active: boolean; onClick: () => void; icon: typeof List; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}


function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition",
        active ? "border-primary bg-primary/15 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function HelperCard({
  helper, score, reasons, rank, isFav, onFav, onChat, onOpenCV,
}: {
  helper: Helper; score: number; reasons: string[]; rank: number;
  isFav: boolean; onFav: () => void;
  onChat: () => void; onOpenCV: () => void;
}) {
  const isTop = rank <= 3;
  return (
    <article className="overflow-hidden rounded-3xl bg-card shadow-card">
      {isTop && (
        <div className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-foreground gradient-cool">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> {score}% Kompatibilität
          </span>
          <span>#{rank} Top Match</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <img src={helper.photo} alt={helper.name} className="h-16 w-16 rounded-full object-cover" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-extrabold leading-tight">{helper.name}</h3>
                <p className="text-sm text-muted-foreground">{helper.age} Jahre</p>
              </div>
              {helper.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-mint-soft px-2.5 py-1 text-xs font-bold text-[color:var(--mint)]">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verifiziert
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold"><Star className="h-4 w-4 fill-[color:var(--warning)] text-[color:var(--warning)]" /> {helper.rating}</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" /> {helper.distanceKm} km</span>
              <span className="inline-flex items-center gap-1 font-bold"><Euro className="h-4 w-4" /> {helper.pricePerHour}€/Std</span>
            </div>
          </div>
        </div>

        {!!reasons.length && (
          <div className="mt-4 rounded-2xl bg-accent/40 p-3">
            <p className="mb-1 text-xs font-bold text-foreground/80">Passt besonders gut, weil:</p>
            <ul className="space-y-0.5 text-xs text-foreground/90">
              {reasons.slice(0, 3).map((r, i) => (
                <li key={i}>✓ {r}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{helper.bio}</p>

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-muted-foreground">Qualifikationen</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {helper.qualifications.slice(0, 2).map((q) => (
                <span key={q} className="rounded-full bg-sky-soft px-2 py-0.5 text-[11px] font-semibold text-foreground/80">{q}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Sprachen</div>
            <div className="mt-1 font-semibold">{helper.languages.join(", ")}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant={isFav ? "default" : "outline"}
            onClick={onFav}
            className={cn("h-11 rounded-full font-semibold", isFav && "bg-peach-soft text-foreground hover:bg-peach-soft/80")}
          >
            <Heart className={cn("mr-1.5 h-4 w-4", isFav && "fill-[color:var(--peach)] text-[color:var(--peach)]")} />
            {isFav ? "Favorisiert" : "Favorisieren"}
          </Button>
          <Button onClick={onChat} className="h-11 rounded-full font-bold">
            <MessageCircle className="mr-1.5 h-4 w-4" /> Chat starten
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <button onClick={onOpenCV} className="inline-flex items-center gap-1 text-sm font-semibold text-foreground/80 hover:text-foreground">
            Vollständiges Profil <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={onOpenCV} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            <FileText className="h-4 w-4" /> Pflegenah CV
          </button>
        </div>
      </div>
    </article>
  );
}
