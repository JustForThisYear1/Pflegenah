import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, MessageCircle, MapPin, Euro, Star, HeartOff } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/family/favorites")({
  head: () => ({ meta: [{ title: "Favoriten · Pflegenah" }] }),
  component: Favorites,
});

function Favorites() {
  const { helpers, favorites, toggleFavorite, ensureMatch } = useStore();
  const navigate = useNavigate();
  const list = helpers.filter((h) => favorites.includes(h.id));

  const openChat = (helperId: string) => {
    const m = ensureMatch(helperId);
    navigate({ to: "/family/messages/$id", params: { id: m.helperId } });
  };

  return (
    <AppLayout variant="family">
      <ScreenHeader title="Meine Favoriten" subtitle={`${list.length} gespeicherte Helfer:innen`} back="/family/dashboard" />

      {list.length === 0 ? (
        <div className="rounded-3xl bg-card p-10 text-center shadow-card">
          <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Noch keine Favoriten. Tippe bei einer Helfer:in auf „Favorisieren“, um sie hier zu sammeln.
          </p>
          <Link
            to="/family/discover"
            className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Helfer:innen entdecken
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((h) => (
            <article key={h.id} className="rounded-3xl bg-card p-4 shadow-card">
              <div className="flex items-start gap-3">
                <img src={h.photo} alt="" className="h-14 w-14 rounded-full object-cover" />
                <div className="flex-1">
                  <h3 className="text-base font-extrabold">{h.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                    <span className="inline-flex items-center gap-1 font-semibold"><Star className="h-3.5 w-3.5 fill-[color:var(--warning)] text-[color:var(--warning)]" /> {h.rating}</span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {h.distanceKm} km</span>
                    <span className="inline-flex items-center gap-1 font-bold"><Euro className="h-3.5 w-3.5" /> {h.pricePerHour}€/Std</span>
                  </div>
                </div>
                <button
                  onClick={() => { toggleFavorite(h.id); toast.success(`${h.name} entfernt`); }}
                  aria-label="Aus Favoriten entfernen"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <HeartOff className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-10 rounded-full" onClick={() => navigate({ to: "/helper/$id/cv", params: { id: h.id } })}>
                  Profil
                </Button>
                <Button className="h-10 rounded-full font-bold" onClick={() => openChat(h.id)}>
                  <MessageCircle className="mr-1.5 h-4 w-4" /> Chat
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
