import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarPlus, ArrowRight, CalendarDays, Heart, Users, Bell, MessageCircle, Inbox, FileText } from "lucide-react";
import { AppLayout, GradientBanner } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/family/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Pflegenah" }] }),
  component: FamilyDashboard,
});

function FamilyDashboard() {
  const navigate = useNavigate();
  const { familyProfile, matches, helpers, appointments } = useStore();
  const upcoming = appointments.find((a) => a.status === "upcoming");
  const myHelpers = matches
    .map((m) => helpers.find((h) => h.id === m.helperId))
    .filter(Boolean)
    .slice(0, 3);

  const supportedName = familyProfile
    ? `${familyProfile.firstName} ${familyProfile.lastName}`.trim() || "Ihre Angehörigen"
    : "Ihre Angehörigen";

  return (
    <AppLayout variant="family">
      <GradientBanner
        title="Willkommen zurück!"
        subtitle={`Sie unterstützen ${supportedName}`}
      />

      <button
        onClick={() => navigate({ to: "/family/booking" })}
        className="mb-6 flex w-full items-center gap-4 rounded-2xl gradient-warm p-5 text-left shadow-soft transition hover:-translate-y-0.5"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60">
          <CalendarPlus className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="text-base font-extrabold">Neue Buchung starten</div>
          <div className="text-sm text-foreground/80">Finden Sie passende Helfer:innen in Ihrer Nähe</div>
        </div>
        <ArrowRight className="h-5 w-5" />
      </button>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard icon={CalendarDays} tone="peach" value={appointments.length} label="Termine" />
        <StatCard icon={Heart} tone="mint" value={matches.length} label="Matches" />
        <StatCard icon={Users} tone="sky" value={helpers.length} label="Helfer:innen" />
      </div>

      <section className="mb-6">
        <h3 className="mb-3 text-sm font-bold text-foreground/80">Nächster Termin</h3>
        {upcoming ? (
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <div className="text-base font-bold">{upcoming.helperName}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {new Date(upcoming.date).toLocaleDateString("de-DE")} · {upcoming.startTime} · {upcoming.durationHours} Std.
            </div>
            <Link to="/family/bookings" className="mt-3 inline-block text-sm font-semibold text-primary underline-offset-2 hover:underline">
              Details ansehen
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-card p-8 text-center shadow-card">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-peach-soft">
              <CalendarDays className="h-6 w-6 text-[color:var(--peach)]" />
            </div>
            <div className="text-base font-bold">Keine bevorstehenden Termine</div>
            <p className="mt-1 text-sm text-muted-foreground">Finden Sie passende Helfer:innen und vereinbaren Sie Termine</p>
            <Button onClick={() => navigate({ to: "/family/booking" })} className="mt-4 rounded-full font-bold">Jetzt buchen</Button>
          </div>
        )}
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground/80">Meine Helfer:innen</h3>
          <Link to="/family/discover" className="text-sm font-semibold text-primary hover:underline">Alle anzeigen →</Link>
        </div>
        {myHelpers.length ? (
          <div className="space-y-2">
            {myHelpers.map((h) => (
              <Link
                key={h!.id} to="/family/messages/$id" params={{ id: h!.id }}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card transition hover:-translate-y-0.5"
              >
                <img src={h!.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="text-sm font-bold">{h!.name}</div>
                  <div className="text-xs text-muted-foreground">{h!.distanceKm} km entfernt</div>
                </div>
                <Button size="sm" variant="outline" className="rounded-full">Nachricht</Button>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
            Noch keine Helfer:innen gespeichert.
            <div className="mt-3">
              <Button onClick={() => navigate({ to: "/family/discover" })} size="sm" className="rounded-full">Helfer:innen entdecken</Button>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <QuickLink to="/family/requests" icon={Inbox} tone="peach" label="Anfragen" />
        <QuickLink to="/family/messages" icon={MessageCircle} tone="sky" label="Nachrichten" />
        <QuickLink to="/family/bookings" icon={CalendarDays} tone="mint" label="Buchungen" />
        <QuickLink to="/family/invoices" icon={FileText} tone="peach" label="Rechnungen" />
        <QuickLink to="/family/discover" icon={Users} tone="sky" label="Helfer:innen" />
        <QuickLink to="/family/profile" icon={Bell} tone="mint" label="Einstellungen" />
      </div>

    </AppLayout>
  );
}

import type { LucideIcon } from "lucide-react";

function StatCard({ icon: Icon, tone, value, label }: {
  icon: LucideIcon; tone: "peach" | "mint" | "sky"; value: number; label: string;
}) {
  const bg = tone === "peach" ? "text-[color:var(--peach)]" : tone === "mint" ? "text-[color:var(--mint)]" : "text-[color:var(--sky)]";
  return (
    <div className="flex flex-col items-center rounded-2xl bg-card p-4 shadow-card">
      <Icon className={`mb-1 h-6 w-6 ${bg}`} />
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, tone, label }: {
  to: string; icon: LucideIcon; tone: "peach" | "mint" | "sky"; label: string;
}) {
  const bg = tone === "peach" ? "bg-peach-soft text-[color:var(--peach)]"
    : tone === "mint" ? "bg-mint-soft text-[color:var(--mint)]"
    : "bg-sky-soft text-[color:var(--sky)]";
  return (
    <Link to={to} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition hover:-translate-y-0.5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}
