import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Clock, XCircle, Users, CreditCard } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin · Pflegenah" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { helpers } = useStore();
  const pending = helpers.filter((h) => h.verificationStatus === "pending").length;
  const verified = helpers.filter((h) => h.verificationStatus === "verified").length;
  const rejected = helpers.filter((h) => h.verificationStatus === "rejected").length;

  return (
    <AppLayout variant="admin">
      <ScreenHeader title="Admin-Dashboard" subtitle="Verifizierungen & Übersicht" />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile icon={Clock} label="Ausstehend" value={pending} tone="peach" />
        <Tile icon={ShieldCheck} label="Verifiziert" value={verified} tone="mint" />
        <Tile icon={XCircle} label="Abgelehnt" value={rejected} tone="peach" />
        <Tile icon={Users} label="Gesamt" value={helpers.length} tone="sky" />
      </div>

      <div className="space-y-3">
        <Link to="/admin/verification" className="flex items-center justify-between rounded-2xl bg-card p-5 shadow-card hover:-translate-y-0.5 transition">
          <div>
            <div className="font-bold">Helfer-Verifizierung</div>
            <div className="text-sm text-muted-foreground">{pending} ausstehende Prüfungen</div>
          </div>
          <ShieldCheck className="h-6 w-6 text-[color:var(--mint)]" />
        </Link>
        <Link to="/admin/helpers" className="flex items-center justify-between rounded-2xl bg-card p-5 shadow-card hover:-translate-y-0.5 transition">
          <div>
            <div className="font-bold">Alle Helfer:innen</div>
            <div className="text-sm text-muted-foreground">Übersicht & Verwaltung</div>
          </div>
          <Users className="h-6 w-6 text-[color:var(--sky)]" />
        </Link>
        <Link to="/admin/payments" className="flex items-center justify-between rounded-2xl bg-card p-5 shadow-card hover:-translate-y-0.5 transition">
          <div>
            <div className="font-bold">Zahlungen & Rechnungen</div>
            <div className="text-sm text-muted-foreground">Escrow, Auszahlungen, Pflegekassen</div>
          </div>
          <CreditCard className="h-6 w-6 text-[color:var(--peach)]" />
        </Link>
      </div>
    </AppLayout>
  );
}

import type { LucideIcon } from "lucide-react";

function Tile({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: number; tone: "peach"|"mint"|"sky" }) {
  const c = tone === "peach" ? "text-[color:var(--peach)]" : tone === "mint" ? "text-[color:var(--mint)]" : "text-[color:var(--sky)]";
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <Icon className={`mb-2 h-6 w-6 ${c}`} />
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
