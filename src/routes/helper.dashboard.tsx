import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Heart, Star, DollarSign, Clock, CheckCircle2, Upload, ArrowUpCircle, CalendarClock, Briefcase } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/helper/dashboard")({
  head: () => ({ meta: [{ title: "Helfer-Dashboard · Pflegenah" }] }),
  component: HelperDashboard,
});

function HelperDashboard() {
  const { helperSelf, appointments, updateAppointment } = useStore();
  // "My" appointments: for prototype, treat all as helper's own
  const escrow = appointments.filter((a) => a.paymentStatus === "held_in_escrow").reduce((s, a) => s + a.totalAmount, 0);
  const released = appointments.filter((a) => a.paymentStatus === "released_to_helper" || a.paymentStatus === "confirmed_by_family").reduce((s, a) => s + a.totalAmount, 0);
  const available = released;
  const upcoming = appointments.filter((a) => a.status === "upcoming");
  const completed = appointments.filter((a) => a.status === "confirmed" || a.status === "completed");
  const name = helperSelf?.name ?? "Daniel";
  const rating = helperSelf?.rating ?? 5;

  const canWithdraw = available > 0 && (helperSelf?.verificationStatus === "verified");

  return (
    <AppLayout variant="helper">
      <div className="mb-6 -mx-4 gradient-cool p-8 pb-14 pt-10">
        <h1 className="text-3xl font-black">Hallo {(name).split(" ")[0]}! 👋</h1>
        <p className="mt-1 text-sm text-foreground/80">Deine Verdienste und Termine</p>
      </div>

      <div className="mb-6 rounded-3xl bg-card p-5 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-bold">Verfügbar zur Auszahlung</div>
            <div className="mt-1 text-3xl font-black text-[color:var(--success)]">€{available.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Aus {completed.length} freigegebenen Zahlungen</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-soft text-[color:var(--success)]">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <MiniEscrow icon={Clock} tone="peach" title="Im Treuhand" value={escrow} sub={`${upcoming.length} ausstehende Bestätigungen`} />
          <MiniEscrow icon={CheckCircle2} tone="mint" title="Freigegeben" value={released} sub={`${completed.length} freigegebene Zahlungen`} />
        </div>

        <Button
          asChild
          className={cn("mt-4 h-12 w-full rounded-full font-bold", !canWithdraw && "bg-muted text-muted-foreground pointer-events-none")}
        >
          <Link to="/helper/payouts">
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            {canWithdraw ? "Auszahlung beantragen" : "Auszahlungen ansehen"}
          </Link>
        </Button>

        <div className="mt-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          Diese Beträge werden freigegeben, sobald die Familie die Leistung bestätigt – oder nach 7 Tagen automatisch.
        </div>

        {helperSelf?.verificationStatus !== "verified" && available > 0 && (
          <div className="mt-3 rounded-xl bg-peach-soft p-3 text-xs">
            Du hast bereits <b>{available.toFixed(2)} €</b> verdient. Lade jetzt deinen Gewerbeschein hoch, um deine erste Auszahlung zu erhalten.
            <Button variant="outline" size="sm" className="mt-2 rounded-full text-xs">
              <Upload className="mr-1 h-3.5 w-3.5" /> Gewerbeschein hochladen
            </Button>
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link to="/helper/jobs" className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition hover:-translate-y-0.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-peach-soft text-[color:var(--peach)]">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold">Aufträge finden</div>
            <div className="text-xs text-muted-foreground">Anzeigen in deiner Nähe</div>
          </div>
        </Link>
        <Link to="/helper/availability" className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition hover:-translate-y-0.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint-soft text-[color:var(--mint)]">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold">Verfügbarkeit</div>
            <div className="text-xs text-muted-foreground">Kalender pflegen</div>
          </div>
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat icon={CalendarDays} tone="mint" value={appointments.length} label="Termine" />
        <Stat icon={Heart} tone="peach" value={completed.length} label="Klienten" />
        <Stat icon={Star} tone="sky" value={rating.toFixed(1)} label="Bewertung" />
      </div>

      <section className="mb-6">
        <h3 className="mb-3 text-sm font-bold">Zu erledigende Termine</h3>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">Keine offenen Termine.</div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((a) => (
              <Link
                key={a.id}
                to="/helper/appointments/$id"
                params={{ id: a.id }}
                className="block rounded-2xl bg-card p-4 shadow-card transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-bold">{a.clientName ?? "Auftraggeber:in"}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(a.date).toLocaleDateString("de-DE")} · {a.startTime} · {a.durationHours} Std. · {a.totalAmount.toFixed(2)} €
                    </div>
                  </div>
                  <Button size="sm" className="rounded-full" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateAppointment(a.id, { status: "completed", paymentStatus: "completed_by_helper" });
                    toast.success("Als erledigt markiert – Familie wird benachrichtigt.");
                  }}>Als erledigt markieren</Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold">Abgeschlossene Termine</h3>
        {completed.length === 0 ? (
          <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
            <CalendarDays className="mx-auto mb-2 h-6 w-6" />
            Noch keine abgeschlossenen Termine
          </div>
        ) : (
          <div className="space-y-2">
            {completed.map((a) => (
              <Link
                key={a.id}
                to="/helper/appointments/$id"
                params={{ id: a.id }}
                className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <div className="truncate font-bold">{a.clientName ?? "Auftraggeber:in"}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString("de-DE")} · {a.durationHours} Std.</div>
                </div>
                <div className="text-sm font-bold text-[color:var(--success)]">+{a.totalAmount.toFixed(2)} €</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}

import type { LucideIcon } from "lucide-react";

function Stat({ icon: Icon, tone, value, label }: { icon: LucideIcon; tone: "peach"|"mint"|"sky"; value: number|string; label: string }) {
  const c = tone === "peach" ? "text-[color:var(--peach)]" : tone === "mint" ? "text-[color:var(--mint)]" : "text-[color:var(--sky)]";
  return (
    <div className="flex flex-col items-center rounded-2xl bg-card p-4 shadow-card">
      <Icon className={`mb-1 h-6 w-6 ${c}`} />
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function MiniEscrow({ icon: Icon, tone, title, value, sub }: { icon: LucideIcon; tone: "peach"|"mint"; title: string; value: number; sub: string }) {
  const c = tone === "peach" ? "text-[color:var(--peach)]" : "text-[color:var(--mint)]";
  return (
    <div className="rounded-2xl border border-border bg-muted p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold"><Icon className={`h-3.5 w-3.5 ${c}`} /> {title}</div>
      <div className={`text-xl font-black ${c}`}>€{value.toFixed(2)}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}
