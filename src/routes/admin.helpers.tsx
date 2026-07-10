import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/helpers")({
  head: () => ({ meta: [{ title: "Alle Helfer:innen · Pflegenah" }] }),
  component: AllHelpers,
});

function AllHelpers() {
  const { helpers } = useStore();
  return (
    <AppLayout variant="admin">
      <ScreenHeader title="Alle Helfer:innen" subtitle={`${helpers.length} in der Plattform`} />
      <div className="space-y-2">
        {helpers.map((h) => (
          <div key={h.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
            <img src={h.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{h.name}</span>
                {h.verificationStatus === "verified" && <ShieldCheck className="h-4 w-4 text-[color:var(--mint)]" />}
              </div>
              <div className="text-xs text-muted-foreground">{h.city} · {h.pricePerHour} €/Std · ⭐ {h.rating}</div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              h.verificationStatus === "verified" ? "bg-mint-soft text-[color:var(--mint)]" :
              h.verificationStatus === "rejected" ? "bg-destructive/15 text-destructive" :
              "bg-peach-soft text-[color:var(--peach)]"
            }`}>{h.verificationStatus}</span>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
