import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Send, Check, X, CalendarClock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { BookingCard, MonthGrid } from "@/routes/family.messages.$id";
import { computeAvailability, startTimeOptions } from "@/lib/availability";
import { MOCK_JOBS, type Job, type Message } from "@/lib/mock-data";
import { isJobThreadId, jobIdFromThreadId, jobPosterPhoto, jobPosterRoleLabel, jobPosterSummary } from "@/lib/job-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/helper/messages/$id")({
  head: () => ({ meta: [{ title: "Chat · Pflegenah" }] }),
  component: HelperChatDetail,
});

type BookingPayload = {
  requestId: string;
  date: string;
  time: string;
  duration: number;
  type: "once" | "weekly" | "package";
  weeklyDays?: string[];
  packageMonths?: number;
  notes?: string;
  pricePerHour: number;
};

function parseBooking(m: Message): BookingPayload | null {
  try { return JSON.parse(m.content) as BookingPayload; } catch { return null; }
}

function HelperChatDetail() {
  const { id } = Route.useParams();
  const {
    helpers, helperSelf, jobs, applications,
    messages, appointments, sendMessage, addAppointment, applyToJob,
  } = useStore();
  const navigate = useNavigate();
  const router = useRouter();

  const matchId = id;
  const isJobThread = isJobThreadId(id);
  const jobId = isJobThread ? jobIdFromThreadId(id) : null;
  const job = jobId ? jobs.find((j) => j.id === jobId) ?? MOCK_JOBS.find((j) => j.id === jobId) : undefined;
  const helper = helpers.find((h) => h.id === id) ?? helperSelf;
  const helperId = helperSelf?.id ?? helper?.id ?? "me-helper";
  const already = job ? applications.find((a) => a.jobId === job.id && a.helperId === helperId) : undefined;
  const thread = useMemo(
    () => messages.filter((m) => m.matchId === matchId),
    [messages, matchId],
  );

  const [text, setText] = useState("");
  const [requestMessage, setRequestMessage] = useState("Hallo, ich passe zu Ihrem Auftrag und würde mich sehr freuen zu helfen.");
  const [applyOpen, setApplyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [counterFor, setCounterFor] = useState<BookingPayload | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [thread.length]);

  const goBack = () => {
    if (window.history.length > 1) router.history.back();
    else navigate({ to: "/helper/messages" });
  };

  const submit = () => {
    if (!text.trim()) return;
    sendMessage(matchId, text.trim(), helperId);
    setText("");
  };

  const sendApplication = () => {
    if (!job || !requestMessage.trim()) return;
    applyToJob(job.id, requestMessage.trim());
    sendMessage(matchId, `Neue Anfrage zu „${job.title}": ${requestMessage.trim()}`, helperId, "text");
    setApplyOpen(false);
    toast.success("Anfrage an den Auftraggeber gesendet");
  };

  const acceptRequest = (req: BookingPayload) => {
    const total = req.duration * req.pricePerHour * (req.type === "package" ? 4 * (req.packageMonths ?? 1) : 1);
    const fee = Math.round(total * 0.1 * 100) / 100;
    addAppointment({
      helperId: helperId, helperName: helper?.name ?? "Helfer:in",
      date: req.date, startTime: req.time, durationHours: req.duration,
      bookingType: req.type, weeklyDays: req.weeklyDays, packageMonths: req.packageMonths,
      pricePerHour: req.pricePerHour, totalAmount: total, serviceFee: fee,
      status: "upcoming", paymentStatus: "held_in_escrow", notes: req.notes,
      clientName: job?.postedByName,
      clientRole: job?.postedBy,
      clientPhoto: job?.postedByPhoto,
      careRecipientName: job?.postedByName,
      supportNeeds: job?.supportNeeds,
      serviceType: job?.supportNeeds?.[0],
      address: job ? `${job.address ?? ""}${job.city ? `, ${job.city}` : ""}`.trim().replace(/^,\s*/, "") : undefined,
      matchId,
      jobId: job?.id,
    });
    sendMessage(matchId, JSON.stringify(req), helperId, "booking_accepted");
    toast.success("Termin angenommen");
  };

  const declineRequest = (req: BookingPayload) => {
    sendMessage(matchId, JSON.stringify(req), helperId, "booking_declined");
    toast("Anfrage abgelehnt");
  };

  const sendCounter = (updated: BookingPayload) => {
    sendMessage(matchId, JSON.stringify(updated), helperId, "booking_countered");
    setCounterFor(null);
    toast.success("Neuer Vorschlag gesendet");
  };

  // Track already-resolved request IDs so pending buttons vanish once responded.
  const resolvedIds = useMemo(() => {
    const set = new Set<string>();
    for (const m of thread) {
      if (m.type === "booking_accepted" || m.type === "booking_declined") {
        const p = parseBooking(m);
        if (p) set.add(p.requestId);
      }
    }
    return set;
  }, [thread]);

  const availability = helper && helper.id && helper.workingDays && helper.workingHours
    ? computeAvailability(
        { id: helper.id, workingDays: helper.workingDays, workingHours: helper.workingHours },
        appointments,
        45,
      )
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[720px] items-center gap-3 px-4 py-3">
          <button onClick={goBack} className="rounded-full p-2 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Profilinformationen anzeigen"
          >
            {job ? (
              <img src={jobPosterPhoto(job)} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mint-soft text-sm font-bold">
                F
              </div>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-extrabold leading-tight">
              {job ? job.postedByName : "Familie"}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {job ? `${job.title} · ${jobPosterRoleLabel(job.postedBy)}` : "Live-Chat · verschlüsselt"}
            </div>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="mx-auto w-full max-w-[720px] flex-1 space-y-3 overflow-y-auto px-4 py-6 pb-40">
        {thread.length === 0 && (
          <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
            Noch keine Nachrichten. Antworte, sobald eine Familie schreibt.
          </div>
        )}
        {thread.map((m) => {
          const mine = m.senderId === helperId;
          if (m.type?.startsWith("booking_")) {
            const req = parseBooking(m);
            if (!req) return null;
            const isPending = m.type === "booking_request" && !resolvedIds.has(req.requestId);
            return (
              <div key={m.id} className="space-y-2">
                <BookingCard type={m.type} mine={mine} req={req} />
                {isPending && !mine && (
                  <div className="mx-auto max-w-[85%] flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => acceptRequest(req)} className="flex-1 min-w-[100px]">
                      <Check className="mr-1 h-4 w-4" />Annehmen
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => declineRequest(req)} className="flex-1 min-w-[100px]">
                      <X className="mr-1 h-4 w-4" />Ablehnen
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setCounterFor(req)} className="flex-1 min-w-[130px]">
                      <CalendarClock className="mr-1 h-4 w-4" />Andere Zeit
                    </Button>
                  </div>
                )}
              </div>
            );
          }
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-card",
                  mine ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
                )}
              >
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-[720px] px-3 py-2">
          {job && (
            <div className="mb-2 flex gap-2">
              <Button
                size="sm"
                variant={already ? "outline" : "default"}
                disabled={!!already}
                onClick={() => setApplyOpen(true)}
                className="rounded-full text-xs font-bold"
              >
                <Send className="mr-1 h-4 w-4" />
                {already
                  ? already.status === "pending" ? "Anfrage gesendet" : already.status === "accepted" ? "Anfrage angenommen" : "Anfrage abgelehnt"
                  : "Anfrage senden"}
              </Button>
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex items-end gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nachricht schreiben…"
              className="h-11 flex-1 rounded-full bg-muted"
            />
            <Button type="submit" size="icon" className="h-11 w-11 rounded-full">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>

      <CounterDialog
        req={counterFor}
        availability={availability}
        onClose={() => setCounterFor(null)}
        onSend={sendCounter}
      />
      <JobPosterDialog job={job} open={profileOpen} onOpenChange={setProfileOpen} />
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anfrage an {job?.postedByName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Die Anfrage wird zum Auftrag „{job?.title}” gesendet und erscheint beim Auftraggeber zum Annehmen oder Ablehnen.
            </p>
            <Textarea rows={4} value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>Abbrechen</Button>
            <Button onClick={sendApplication} disabled={!requestMessage.trim()}>Anfrage senden</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JobPosterDialog({ job, open, onOpenChange }: { job?: Job; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!job) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader><DialogTitle>Kontaktprofil</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Dies ist ein Familien-Chat.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Profil des Auftraggebers</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={jobPosterPhoto(job)} alt="" className="h-16 w-16 rounded-full object-cover" />
            <div>
              <div className="text-base font-extrabold">{job.postedByName}</div>
              <div className="text-sm text-muted-foreground">{jobPosterRoleLabel(job.postedBy)}</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-foreground/85">{jobPosterSummary(job)}</p>
          <div className="rounded-2xl bg-muted/50 p-3 text-sm">
            <div className="mb-1 flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4" /> {job.postalCode} {job.city}</div>
            <div className="text-xs text-muted-foreground">Auftrag: {job.title}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CounterDialog({
  req, availability, onClose, onSend,
}: {
  req: BookingPayload | null;
  availability: ReturnType<typeof computeAvailability>;
  onClose: () => void;
  onSend: (updated: BookingPayload) => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(req?.duration ?? 2);

  useEffect(() => {
    setDate(""); setTime("");
    setDuration(req?.duration ?? 2);
  }, [req?.requestId, req?.duration]);

  const slot = availability.find((s) => s.date === date) ?? null;
  const timeChoices = slot ? startTimeOptions(slot, duration) : [];

  if (!req) return null;

  return (
    <Dialog open={!!req} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Andere Zeit vorschlagen</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <MonthGrid slots={availability} selected={date} onSelect={setDate} />
          {slot && (
            <>
              <div>
                <div className="mb-1 text-xs font-bold text-muted-foreground">
                  Zeit ({slot.startTime}–{slot.endTime})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {timeChoices.map((t) => (
                    <button key={t} onClick={() => setTime(t)}
                      className={cn("h-9 rounded-lg border-2 px-2.5 text-xs font-bold",
                        time === t ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-bold text-muted-foreground">Dauer (Std.)</div>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 1.5, 2, 3, 4].map((h) => (
                    <button key={h} onClick={() => setDuration(h)}
                      className={cn("h-9 min-w-11 rounded-lg border-2 px-2 text-xs font-bold",
                        duration === h ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground")}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button
            disabled={!date || !time}
            onClick={() => onSend({ ...req, date, time, duration })}
          >
            Vorschlag senden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
