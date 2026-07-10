import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Inbox, Check, X, MessageCircle } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { jobThreadId } from "@/lib/job-utils";

export const Route = createFileRoute("/family/requests")({
  head: () => ({ meta: [{ title: "Anfragen · Pflegenah" }] }),
  component: FamilyRequests,
});

function FamilyRequests() {
  const {
    applications, jobs, helpers, helperSelf, familyProfile,
    updateApplication, sendMessage, ensureMatch, addAppointment,
  } = useStore();
  const navigate = useNavigate();

  const items = applications
    .map((a) => ({
      app: a,
      job: jobs.find((j) => j.id === a.jobId),
      helper: helpers.find((h) => h.id === a.helperId) ?? (helperSelf?.id === a.helperId ? helperSelf : undefined),
    }))
    .filter((x) => x.job)
    .sort((a, b) => (a.app.createdAt < b.app.createdAt ? 1 : -1));

  const accept = (appId: string, jobId: string, helperId: string, helperName: string) => {
    updateApplication(appId, { status: "accepted" });
    const job = jobs.find((j) => j.id === jobId);
    const helper = helpers.find((h) => h.id === helperId) ?? (helperSelf?.id === helperId ? helperSelf : undefined);
    const threadId = jobThreadId(jobId, helperId);

    if (helpers.find((h) => h.id === helperId)) ensureMatch(helperId);

    if (job) {
      const pph = (helper?.pricePerHour as number | undefined) ?? job.pricePerHour;
      const total = job.durationHours * pph;
      const fee = Math.round(total * 0.1 * 100) / 100;
      const clientName = familyProfile
        ? `${familyProfile.firstName} ${familyProfile.lastName}`.trim()
        : job.postedByName;
      addAppointment({
        helperId,
        helperName,
        date: job.date,
        startTime: job.time,
        durationHours: job.durationHours,
        bookingType: "once",
        pricePerHour: pph,
        totalAmount: total,
        serviceFee: fee,
        status: "upcoming",
        paymentStatus: "held_in_escrow",
        notes: job.description,
        address: `${job.address}, ${job.postalCode} ${job.city}`.trim(),
        clientName,
        clientRole: job.postedBy,
        clientPhoto: familyProfile?.photo ?? job.postedByPhoto,
        clientPhone: familyProfile?.phone,
        careRecipientName: clientName,
        careLevel: familyProfile?.careLevel,
        supportNeeds: familyProfile?.supportNeeds ?? job.supportNeeds,
        serviceType: job.supportNeeds?.[0],
        matchId: threadId,
        jobId,
      });
    }

    sendMessage(threadId, `Ihre Anfrage wurde angenommen. Wir freuen uns auf Sie, ${helperName}!`, "me", "text");
    toast.success("Anfrage angenommen – Termin erstellt");
  };

  const openHelperProfile = (helperId: string) => {
    if (helpers.find((h) => h.id === helperId)) {
      navigate({ to: "/helper/$id/cv", params: { id: helperId } });
    } else {
      toast("Profil dieser helfenden Person ist nicht verfügbar.");
    }
  };

  const decline = (appId: string, jobId: string, helperId: string) => {
    updateApplication(appId, { status: "rejected" });
    sendMessage(jobThreadId(jobId, helperId), `Vielen Dank für Ihre Anfrage – leider müssen wir absagen.`, "me", "text");
    toast("Anfrage abgelehnt");
  };


  return (
    <AppLayout variant="family">
      <ScreenHeader
        title="Anfragen"
        subtitle={`${items.length} eingegangene Anfrage${items.length === 1 ? "" : "n"}`}
        back="/family/dashboard"
      />

      {items.length === 0 ? (
        <div className="rounded-2xl bg-card p-10 text-center shadow-card">
          <Inbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Noch keine Anfragen von Helfer:innen. Sobald jemand auf Ihre Aufträge antwortet, erscheinen die Anfragen hier.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(({ app, job, helper }) => (
            <article key={app.id} className="rounded-3xl bg-card p-5 shadow-card">
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {job!.title}
              </div>
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => openHelperProfile(app.helperId)}
                  className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label={`Profil von ${app.helperName} öffnen`}
                >
                  {helper?.photo ? (
                    <img src={helper.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mint-soft text-sm font-bold">
                      {app.helperName.slice(0, 1)}
                    </div>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openHelperProfile(app.helperId)}
                      className="text-left text-sm font-extrabold hover:underline"
                    >
                      {app.helperName}
                    </button>
                    <StatusBadge status={app.status} />
                  </div>
                  {helper && (
                    <div className="text-xs text-muted-foreground">
                      {helper.city ?? "Ort offen"} · {helper.pricePerHour ?? "—"} €/Std · {helper.verified ? "Verifiziert" : "Nicht verifiziert"}
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-3 rounded-2xl bg-muted/50 p-3 text-sm leading-relaxed text-foreground/90">
                {app.message}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  onClick={() => accept(app.id, job!.id, app.helperId, app.helperName)}
                  disabled={app.status !== "pending"}
                  className="rounded-full font-bold"
                >
                  <Check className="mr-1 h-4 w-4" /> Annehmen
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => decline(app.id, job!.id, app.helperId)}
                  disabled={app.status !== "pending"}
                  className="rounded-full font-bold"
                >
                  <X className="mr-1 h-4 w-4" /> Ablehnen
                </Button>
                <Link
                  to="/family/messages/$id"
                  params={{ id: jobThreadId(job!.id, app.helperId) }}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-3 text-xs font-bold hover:bg-muted"
                >
                  <MessageCircle className="mr-1 h-4 w-4" /> Chat
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

function StatusBadge({ status }: { status: "pending" | "accepted" | "rejected" }) {
  const label = status === "pending" ? "Neu" : status === "accepted" ? "Angenommen" : "Abgelehnt";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        status === "pending" && "bg-peach-soft text-[color:var(--peach)]",
        status === "accepted" && "bg-mint-soft text-[color:var(--mint)]",
        status === "rejected" && "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
