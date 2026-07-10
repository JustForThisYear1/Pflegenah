import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/helper/availability")({
  head: () => ({ meta: [{ title: "Verfügbarkeit · Pflegenah" }] }),
  component: Availability,
});

type Status = "available" | "blocked" | "booked";

type Slot = { start: string; end: string };
type DayData = { status: Status; slots: Slot[]; notes: string };

const DEFAULT_SLOT: Slot = { start: "09:00", end: "12:00" };

function Availability() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [days, setDays] = useState<Record<string, DayData>>({});
  const [selected, setSelected] = useState<string | null>(null);

  const months = useMemo(() => {
    const base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + monthOffset);
    const m1 = new Date(base);
    const m2 = new Date(base);
    m2.setMonth(m2.getMonth() + 1);
    return [m1, m2];
  }, [monthOffset]);

  const cycle = (dateStr: string) => {
    setDays((prev) => {
      const cur = prev[dateStr];
      const curStatus = cur?.status;
      const next: Status | undefined =
        curStatus === undefined ? "available"
        : curStatus === "available" ? "blocked"
        : curStatus === "blocked" ? "booked"
        : undefined;
      const copy = { ...prev };
      if (next) {
        copy[dateStr] = {
          status: next,
          slots: cur?.slots?.length ? cur.slots : [DEFAULT_SLOT],
          notes: cur?.notes ?? "",
        };
      } else {
        delete copy[dateStr];
      }
      return copy;
    });
    setSelected(dateStr);
  };

  const selectedData = selected ? days[selected] : undefined;

  const updateSlot = (idx: number, patch: Partial<Slot>) => {
    if (!selected) return;
    setDays((prev) => {
      const cur = prev[selected] ?? { status: "available" as Status, slots: [DEFAULT_SLOT], notes: "" };
      const slots = cur.slots.map((s, i) => (i === idx ? { ...s, ...patch } : s));
      return { ...prev, [selected]: { ...cur, slots } };
    });
  };

  const addSlot = () => {
    if (!selected) return;
    setDays((prev) => {
      const cur = prev[selected] ?? { status: "available" as Status, slots: [], notes: "" };
      return { ...prev, [selected]: { ...cur, slots: [...cur.slots, { start: "14:00", end: "17:00" }] } };
    });
  };

  const removeSlot = (idx: number) => {
    if (!selected) return;
    setDays((prev) => {
      const cur = prev[selected];
      if (!cur) return prev;
      return { ...prev, [selected]: { ...cur, slots: cur.slots.filter((_, i) => i !== idx) } };
    });
  };

  const setNotes = (v: string) => {
    if (!selected) return;
    setDays((prev) => {
      const cur = prev[selected] ?? { status: "available" as Status, slots: [DEFAULT_SLOT], notes: "" };
      return { ...prev, [selected]: { ...cur, notes: v } };
    });
  };

  return (
    <AppLayout variant="helper">
      <ScreenHeader title="Verfügbarkeit" subtitle="Verwalte deine Arbeitstage & Zeiten" back="/helper/dashboard" />

      <div className="mb-4 flex items-center justify-between">
        <button className="rounded-full p-2 hover:bg-muted" onClick={() => setMonthOffset(monthOffset - 1)}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold">2-Monats-Ansicht</span>
        <button className="rounded-full p-2 hover:bg-muted" onClick={() => setMonthOffset(monthOffset + 1)}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6">
        {months.map((m) => (
          <MonthGrid key={m.toISOString()} month={m} days={days} onClick={cycle} selected={selected} />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs">
        <Legend color="var(--success)" label="Verfügbar" />
        <Legend color="var(--destructive)" label="Blockiert" />
        <Legend color="var(--sky)" label="Gebucht" />
      </div>

      {selected && selectedData && (
        <div className="mt-6 rounded-2xl bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">
              {new Date(selected).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}
            </h3>
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold",
              selectedData.status === "available" && "bg-[color:var(--success)]/25",
              selectedData.status === "blocked" && "bg-destructive/20",
              selectedData.status === "booked" && "bg-[color:var(--sky)]/40",
            )}>
              {selectedData.status === "available" ? "Verfügbar" : selectedData.status === "blocked" ? "Blockiert" : "Gebucht"}
            </span>
          </div>

          {selectedData.status === "available" && (
            <>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Zeitfenster
              </div>
              <div className="space-y-2">
                {selectedData.slots.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={s.start}
                      onChange={(e) => updateSlot(idx, { start: e.target.value })}
                      className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
                    />
                    <span className="text-muted-foreground">–</span>
                    <input
                      type="time"
                      value={s.end}
                      onChange={(e) => updateSlot(idx, { end: e.target.value })}
                      className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
                    />
                    {selectedData.slots.length > 1 && (
                      <button
                        onClick={() => removeSlot(idx)}
                        className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                        aria-label="Zeitfenster entfernen"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-2 rounded-full" onClick={addSlot}>
                + Weiteres Zeitfenster
              </Button>
            </>
          )}

          <div className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Notiz</div>
          <Textarea
            rows={2}
            className="mt-1"
            value={selectedData.notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Zusatzinfos für Familien …"
          />
          <Button className="mt-3 rounded-full" size="sm" onClick={() => toast.success("Verfügbarkeit gespeichert")}>
            Speichern
          </Button>
        </div>
      )}
    </AppLayout>
  );
}

function MonthGrid({ month, days, onClick, selected }: {
  month: Date; days: Record<string, DayData>; onClick: (d: string) => void; selected: string | null;
}) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(year, m, 1);
  const startDow = (first.getDay() + 6) % 7; // Mo=0
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, m, d));

  return (
    <div>
      <h4 className="mb-2 text-sm font-bold">{month.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}</h4>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground">
        {["Mo","Di","Mi","Do","Fr","Sa","So"].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c) return <div key={i} className="h-10" />;
          const iso = c.toISOString().slice(0, 10);
          const st = days[iso]?.status;
          const cls =
            st === "available" ? "bg-[color:var(--success)]/25 text-foreground"
            : st === "blocked" ? "bg-destructive/20 text-foreground"
            : st === "booked" ? "bg-[color:var(--sky)]/40 text-foreground"
            : "bg-card text-muted-foreground";
          const isSelected = selected === iso;
          return (
            <button key={iso} onClick={() => onClick(iso)}
              className={cn(
                "h-10 rounded-lg border text-xs font-semibold transition hover:-translate-y-0.5",
                isSelected ? "border-primary ring-2 ring-primary/40" : "border-border",
                cls,
              )}>
              {c.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-3 w-3 rounded" style={{ backgroundColor: `color-mix(in oklab, ${color} 40%, transparent)` }} />
      {label}
    </span>
  );
}
