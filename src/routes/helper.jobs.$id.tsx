import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Euro, Clock, CalendarDays, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { MOCK_JOBS } from "@/lib/mock-data";
import { jobPosterPhoto, jobPosterRoleLabel, jobPosterSummary, jobThreadId } from "@/lib/job-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/helper/jobs/$id")({
  head: () => ({ meta: [{ title: "Auftrag · Pflegenah" }] }),
  component: JobDetail,
});

function JobDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { jobs, applications, applyToJob, sendMessage, helperSelf } = useStore();
  const job = jobs.find((j) => j.id === id) ?? MOCK_JOBS.find((j) => j.id === id);
  const already = applications.find((a) => a.jobId === id);
  const [message, setMessage] = useState("Hallo, ich passe zu Ihrem Auftrag und würde mich sehr freuen zu helfen.");

  if (!job) {
    return (
      <AppLayout variant="helper">
        <ScreenHeader title="Auftrag nicht gefunden" back="/helper/jobs" />
      </AppLayout>
    );
  }

  const total = job.durationHours * job.pricePerHour;
  const helperId = helperSelf?.id ?? "me-helper";
  const matchId = jobThreadId(job.id, helperId);
  

  const submit = () => {
    applyToJob(job.id, message);
    // Also seed the shared chat thread so the family sees the request in messages.
    sendMessage(
      matchId,
      `Neue Anfrage zu „${job.title}": ${message}`,
      helperId,
      "text",
    );
    toast.success("Anfrage gesendet – die anfragende Person wird benachrichtigt.");
  };

  const openChat = () => {
    navigate({ to: "/helper/messages/$id", params: { id: matchId } });
  };


  return (
    <AppLayout variant="helper">
      <ScreenHeader title="Auftragsdetails" back="/helper/jobs" />

      <article className="mb-4 overflow-hidden rounded-3xl bg-card shadow-card">
        <div className="gradient-warm p-5">
          <div className="text-xs font-bold text-foreground/70">
            {job.postedByName} · {jobPosterRoleLabel(job.postedBy)}
          </div>
          <h2 className="mt-1 text-xl font-extrabold">{job.title}</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Chip icon={CalendarDays}>{new Date(job.date).toLocaleDateString("de-DE")} · {job.time}</Chip>
            <Chip icon={Clock}>{job.durationHours} Std.</Chip>
            <Chip icon={Euro}>{job.pricePerHour} €/Std</Chip>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <Section title="Beschreibung">
            <p className="text-sm leading-relaxed text-foreground/90">{job.description}</p>
          </Section>

          <Section title="Was benötigt wird">
            <div className="flex flex-wrap gap-1.5">
              {job.supportNeeds.map((n) => (
                <span key={n} className="rounded-full bg-mint-soft px-2.5 py-1 text-xs font-semibold">{n}</span>
              ))}
            </div>
          </Section>

          {job.requirements && job.requirements.length > 0 && (
            <Section title="Anforderungen an die Hilfe">
              <ul className="space-y-1 text-sm">
                {job.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--mint)]" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Ort">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-semibold">{job.address}</div>
                <div className="text-muted-foreground">{job.postalCode} {job.city} · {job.distanceKm} km entfernt</div>
              </div>
            </div>
          </Section>

          <div className="rounded-2xl bg-mint-soft p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Gesamtvergütung</span>
              <span className="text-lg font-black">{total.toFixed(2)} €</span>
            </div>
            <div className="text-xs text-muted-foreground">{job.durationHours} × {job.pricePerHour} € · Zahlung über Treuhand</div>
          </div>

          <Section title="Über die anfragende Person">
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-3">
                <img src={jobPosterPhoto(job)} alt="" className="h-14 w-14 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold">{job.postedByName}</div>
                  <div className="text-xs text-muted-foreground">
                    {jobPosterRoleLabel(job.postedBy)}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {job.postalCode} {job.city}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-foreground/80">
                {jobPosterSummary(job)}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={openChat}
                  className="h-10 rounded-full text-xs font-bold"
                >
                  <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Chat starten
                </Button>
                <Button
                  onClick={() => {
                    document.getElementById("job-apply")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="h-10 rounded-full text-xs font-bold"
                  disabled={!!already}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Anfrage senden
                </Button>
              </div>
            </div>
          </Section>
        </div>
      </article>

      {already ? (
        <div id="job-apply" className="mb-4 rounded-2xl bg-mint-soft p-4 text-sm">
          <div className="flex items-center gap-2 font-bold text-[color:var(--mint)]">
            <CheckCircle2 className="h-4 w-4" /> Anfrage gesendet
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Status: {already.status === "pending" ? "Wartet auf Antwort" : already.status === "accepted" ? "Angenommen" : "Abgelehnt"}
          </div>
        </div>
      ) : (
        <div id="job-apply" className="mb-4 rounded-3xl bg-card p-5 shadow-card">
          <h3 className="mb-2 text-sm font-bold">Anfrage senden</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Deine Nachricht wird an die anfragende Person geschickt. Sie muss annehmen oder ablehnen.
          </p>
          <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button onClick={submit} className="mt-3 h-12 w-full rounded-full font-bold">
            <Send className="mr-2 h-4 w-4" /> Anfrage senden
          </Button>
        </div>
      )}

      <Button variant="outline" onClick={openChat} className="h-12 w-full rounded-full font-bold">
        <MessageCircle className="mr-2 h-4 w-4" /> Erst Chat starten
      </Button>
    </AppLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function Chip({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 text-xs font-semibold">
      <Icon className="h-3.5 w-3.5" /> {children}
    </span>
  );
}
