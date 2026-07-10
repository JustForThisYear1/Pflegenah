import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { List, Map as MapIcon, MapPin, Clock, CalendarDays, User, ChevronRight, MessageCircle } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { MapBoundary } from "@/components/MapBoundary";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/mock-data";
import { jobPosterPhoto, jobPosterRoleLabel, jobThreadId } from "@/lib/job-utils";

const JobsMap = lazy(() => import("@/components/JobsMap").then((m) => ({ default: m.JobsMap })));

export const Route = createFileRoute("/helper/jobs/")({
  head: () => ({ meta: [{ title: "Offene Aufträge · Pflegenah" }] }),
  component: HelperJobsIndex,
});

function HelperJobsIndex() {
  const { jobs, helperSelf } = useStore();
  const [view, setView] = useState<"list" | "map">("list");
  const helperId = helperSelf?.id ?? "me-helper";

  return (
    <AppLayout variant="helper">
      <ScreenHeader
        title="Offene Aufträge"
        subtitle={`${jobs.length} Anzeigen in deiner Nähe`}
        back="/helper/dashboard"
      />

      <div className="mb-4 inline-flex rounded-full border border-border bg-card p-1 shadow-card">
        <ToggleBtn active={view === "list"} onClick={() => setView("list")} icon={List} label="Liste" />
        <ToggleBtn active={view === "map"} onClick={() => setView("map")} icon={MapIcon} label="Karte" />
      </div>

      {view === "list" ? (
        <ListView jobs={jobs} helperId={helperId} />
      ) : (
        <ClientOnly fallback={<MapFallback />}>
          <MapBoundary>
            <Suspense fallback={<MapFallback />}>
              <JobsMap jobs={jobs} helperId={helperId} />
            </Suspense>
          </MapBoundary>
        </ClientOnly>
      )}
    </AppLayout>
  );
}

function MapFallback() {
  return (
    <div className="flex h-[420px] items-center justify-center rounded-3xl border border-border bg-muted text-sm text-muted-foreground shadow-card">
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

function ListView({ jobs, helperId }: { jobs: Job[]; helperId: string }) {
  return (
    <div className="space-y-3">
      {jobs.map((j) => (
        <article
          key={j.id}
          className="rounded-3xl bg-card p-5 text-foreground shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
        >
          <Link to="/helper/jobs/$id" params={{ id: j.id }} className="block no-underline text-foreground">
            <div className="mb-3 flex items-start gap-3">
              <img src={jobPosterPhoto(j)} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-extrabold leading-tight">{j.title}</h3>
                  <span className="whitespace-nowrap rounded-full bg-mint-soft px-2.5 py-1 text-xs font-bold text-[color:var(--mint)]">
                    {j.pricePerHour} €/Std
                  </span>
                </div>
                <div className="mt-0.5 text-xs font-semibold text-muted-foreground">
                  {j.postedByName} · {jobPosterRoleLabel(j.postedBy)}
                </div>
              </div>
            </div>
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{j.description}</p>

            <div className="grid grid-cols-2 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> {new Date(j.date).toLocaleDateString("de-DE")} · {j.time}
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {j.durationHours} Std.
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {j.distanceKm} km
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <User className="h-3.5 w-3.5" /> {jobPosterRoleLabel(j.postedBy)}
              </span>
            </div>
            {j.requirements.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {j.requirements.slice(0, 3).map((r) => (
                  <span key={r} className="rounded-full bg-sky-soft px-2 py-0.5 text-[11px] font-semibold text-foreground/80">{r}</span>
                ))}
              </div>
            )}
          </Link>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="h-10 rounded-full font-bold">
              <Link to="/helper/messages/$id" params={{ id: jobThreadId(j.id, helperId) }}>
                <MessageCircle className="mr-1.5 h-4 w-4" /> Chat
              </Link>
            </Button>
            <Button asChild className="h-10 rounded-full font-bold">
              <Link to="/helper/jobs/$id" params={{ id: j.id }}>
                Details ansehen <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}