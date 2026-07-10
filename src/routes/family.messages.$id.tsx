import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Send, Image as ImageIcon, Mic, Video, CalendarPlus, ShieldCheck,
  PhoneOff, Mic as MicOn, Video as VideoOn, Calendar, Clock, Check, X, CheckCircle2, Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { computeAvailability, startTimeOptions, type AvailabilitySlot } from "@/lib/availability";
import type { Message } from "@/lib/mock-data";
import { helperIdFromJobThreadId, jobIdFromThreadId } from "@/lib/job-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/family/messages/$id")({
  head: () => ({ meta: [{ title: "Chat · Pflegenah" }] }),
  component: ChatDetail,
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

function ChatDetail() {
  const { id } = Route.useParams();
  if (id.startsWith("job-")) return <JobThreadChat matchId={id} />;
  return <HelperChat id={id} />;
}

function HelperChat({ id }: { id: string }) {
  const {
    helpers, matches, messages, appointments, familyProfile,
    ensureMatch, sendMessage, addAppointment,
  } = useStore();
  const navigate = useNavigate();
  const router = useRouter();

  const helper = helpers.find((h) => h.id === id);

  // Ensure match exists in the store (best-effort persistence).
  useEffect(() => {
    if (helper) ensureMatch(helper.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [helper?.id]);

  // Derive a stable matchId even before the store finishes updating,
  // so the chat renders immediately on first navigation.
  const matchId = useMemo(() => {
    const existing = matches.find((m) => m.helperId === id);
    return existing?.id ?? id;
  }, [matches, id]);


  const thread = useMemo(
    () => messages.filter((m) => m.matchId === matchId),
    [messages, matchId],
  );

  const [text, setText] = useState("");
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoConfirm, setVideoConfirm] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [thread.length]);

  const goBack = () => {
    if (window.history.length > 1) router.history.back();
    else navigate({ to: "/family/messages" });
  };

  if (!helper) {
    return (
      <div className="mx-auto max-w-[720px] p-6">
        <p className="mb-4 text-sm text-muted-foreground">Chat nicht gefunden.</p>
        <Button onClick={() => navigate({ to: "/family/messages" })}>Zurück zu Nachrichten</Button>
      </div>
    );
  }


  const submit = () => {
    if (!text.trim()) return;
    sendMessage(matchId, text.trim(), "me", "text");
    setText("");
  };

  const availability = computeAvailability(helper, appointments, 45);

  const confirmBooking = (p: Omit<BookingPayload, "requestId" | "pricePerHour">) => {
    const payload: BookingPayload = {
      ...p,
      requestId: Math.random().toString(36).slice(2, 10),
      pricePerHour: helper.pricePerHour,
    };
    sendMessage(matchId, JSON.stringify(payload), "me", "booking_request");
    toast.success("Terminanfrage gesendet");
    setBookingOpen(false);
  };

  const acceptCounter = (req: BookingPayload) => {
    const total = req.duration * helper.pricePerHour * (req.type === "package" ? 4 * (req.packageMonths ?? 1) : 1);
    const fee = Math.round(total * 0.1 * 100) / 100;
    const clientName = familyProfile ? `${familyProfile.firstName} ${familyProfile.lastName}`.trim() : "Auftraggeber:in";
    addAppointment({
      helperId: helper.id, helperName: helper.name,
      date: req.date, startTime: req.time, durationHours: req.duration,
      bookingType: req.type, weeklyDays: req.weeklyDays, packageMonths: req.packageMonths,
      pricePerHour: helper.pricePerHour, totalAmount: total, serviceFee: fee,
      status: "upcoming", paymentStatus: "held_in_escrow", notes: req.notes,
      clientName,
      clientRole: "user",
      clientPhoto: familyProfile?.photo,
      clientPhone: familyProfile?.phone,
      careRecipientName: clientName,
      careLevel: familyProfile?.careLevel,
      supportNeeds: familyProfile?.supportNeeds,
      matchId,
    });
    sendMessage(matchId, JSON.stringify(req), "me", "booking_accepted");
    toast.success("Termin bestätigt");
  };

  const declineCounter = (req: BookingPayload) => {
    sendMessage(matchId, JSON.stringify(req), "me", "booking_declined");
  };

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
            <img src={helper.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-extrabold leading-tight">{helper.name}</div>
            <div className="text-xs text-muted-foreground">{helper.verified ? "Verifiziert · online" : "online"}</div>
          </div>
          <button
            onClick={() => setVideoConfirm(true)}
            className="rounded-full bg-mint-soft p-2 text-[color:var(--mint)] hover:bg-mint"
            aria-label="Videoanruf starten"
          >
            <Video className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="mx-auto w-full max-w-[720px] flex-1 space-y-3 overflow-y-auto px-4 py-6 pb-40">
        {thread.length === 0 && (
          <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
            Sagen Sie Hallo zu {helper.name.split(" ")[0]}!
          </div>
        )}
        {thread.map((m) => {
          const mine = m.senderId === "me";
          if (m.type?.startsWith("booking_")) {
            const req = parseBooking(m);
            if (!req) return null;
            return (
              <BookingCard
                key={m.id}
                type={m.type}
                mine={mine}
                req={req}
                onAccept={m.type === "booking_countered" && !mine ? () => acceptCounter(req) : undefined}
                onDecline={m.type === "booking_countered" && !mine ? () => declineCounter(req) : undefined}
              />
            );
          }
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-card",
                mine ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
              )}>
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-[720px] px-3 py-2">
          <div className="mb-2 flex gap-2">
            <Button
              size="sm" variant="outline"
              className="rounded-full text-xs font-bold"
              onClick={() => setBookingOpen(true)}
            >
              <CalendarPlus className="mr-1 h-4 w-4" /> Termin anfragen
            </Button>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); submit(); }}
            className="flex items-end gap-2"
          >
            <button type="button" className="rounded-full p-2 text-muted-foreground hover:bg-muted"><ImageIcon className="h-5 w-5" /></button>
            <button type="button" className="rounded-full p-2 text-muted-foreground hover:bg-muted"><Mic className="h-5 w-5" /></button>
            <Input
              value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Nachricht schreiben…" className="h-11 flex-1 rounded-full bg-muted"
            />
            <Button type="submit" size="icon" className="h-11 w-11 rounded-full">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Video call confirm */}
      <Dialog open={videoConfirm} onOpenChange={setVideoConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Videoanruf starten?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Möchten Sie {helper.name} jetzt per Video anrufen? Der Anruf ist Ende-zu-Ende verschlüsselt.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoConfirm(false)}>Abbrechen</Button>
            <Button onClick={() => { setVideoConfirm(false); setVideoOpen(true); }}>Anrufen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video call UI */}
      {videoOpen && (
        <div className="fixed inset-0 z-50 bg-foreground text-white">
          <div className="relative h-full w-full">
            <img src={helper.photo} alt="" className="h-full w-full object-cover opacity-70" />
            <div className="absolute inset-x-0 top-6 flex flex-col items-center gap-1">
              <div className="text-lg font-bold">{helper.name}</div>
              <div className="inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-xs">
                <ShieldCheck className="h-3.5 w-3.5" /> Ende-zu-Ende verschlüsselt
              </div>
            </div>
            <div className="absolute right-4 top-4 h-32 w-24 overflow-hidden rounded-xl border-2 border-white/40 bg-black/40">
              <div className="flex h-full w-full items-center justify-center text-xs text-white/70">Sie</div>
            </div>
            <div className="absolute inset-x-0 bottom-10 flex items-center justify-center gap-4">
              <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20"><MicOn className="h-6 w-6" /></button>
              <button
                onClick={() => setVideoOpen(false)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive"
              ><PhoneOff className="h-7 w-7" /></button>
              <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20"><VideoOn className="h-6 w-6" /></button>
            </div>
          </div>
        </div>
      )}

      {/* In-chat booking dialog */}
      <ChatBookingDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        pricePerHour={helper.pricePerHour}
        availability={availability}
        onConfirm={confirmBooking}
      />
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{helper.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={helper.photo} alt="" className="h-16 w-16 rounded-full object-cover" />
              <div>
                <div className="text-base font-extrabold">{helper.name}</div>
                <div className="text-sm text-muted-foreground">{helper.city} · {helper.pricePerHour} €/Std</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">{helper.bio}</p>
            <div className="flex flex-wrap gap-1.5">
              {helper.qualifications.slice(0, 4).map((q) => (
                <span key={q} className="rounded-full bg-mint-soft px-2.5 py-1 text-xs font-semibold">{q}</span>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ------- Job-thread chat (family <-> helper on a specific Auftrag) --------
function JobThreadChat({ matchId }: { matchId: string }) {
  const { jobs, messages, sendMessage, helpers, helperSelf, applications } = useStore();
  const navigate = useNavigate();
  const router = useRouter();
  const jobId = jobIdFromThreadId(matchId);
  const helperIdFromThread = helperIdFromJobThreadId(matchId);
  const job = jobs.find((j) => j.id === jobId);

  const thread = useMemo(
    () => messages.filter((m) => m.matchId === matchId),
    [messages, matchId],
  );

  // The other party's most recent inbound message tells us who the helper is.
  const helperMsg = [...thread].reverse().find((m) => m.senderId !== "me");
  const application = applications.find((a) => a.jobId === jobId && (!helperIdFromThread || a.helperId === helperIdFromThread));
  const resolvedHelperId = helperIdFromThread ?? helperMsg?.senderId ?? application?.helperId ?? null;
  const helper = resolvedHelperId
    ? helpers.find((h) => h.id === resolvedHelperId) ?? (helperSelf?.id === resolvedHelperId ? helperSelf : undefined)
    : undefined;

  const [text, setText] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [thread.length]);

  const goBack = () => {
    if (window.history.length > 1) router.history.back();
    else navigate({ to: "/family/messages" });
  };

  const submit = () => {
    if (!text.trim()) return;
    sendMessage(matchId, text.trim(), "me", "text");
    setText("");
  };

  const headerTitle = job ? job.title : "Auftrag";
  const helperName = helper?.name ?? application?.helperName ?? "Helfer:in";
  const helperPhoto = helper?.photo ?? `https://i.pravatar.cc/240?u=${encodeURIComponent(resolvedHelperId ?? application?.helperId ?? "helper-request")}`;
  const headerSub = `mit ${helperName}`;

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
            <img src={helperPhoto} alt="" className="h-10 w-10 rounded-full object-cover" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-extrabold leading-tight">{helperName}</div>
            <div className="truncate text-xs text-muted-foreground">
              <Briefcase className="mr-1 inline h-3.5 w-3.5" />
              {headerTitle}
            </div>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="mx-auto w-full max-w-[720px] flex-1 space-y-3 overflow-y-auto px-4 py-6 pb-40">
        {thread.length === 0 && (
          <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
            Noch keine Nachrichten in diesem Auftrags-Chat.
          </div>
        )}
        {thread.map((m) => {
          const mine = m.senderId === "me";
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-card",
                mine ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
              )}>
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-[720px] px-3 py-2">
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex items-end gap-2">
            <Input
              value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Nachricht schreiben…" className="h-11 flex-1 rounded-full bg-muted"
            />
            <Button type="submit" size="icon" className="h-11 w-11 rounded-full">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
      {(helper || application) && (
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{helperName}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={helperPhoto} alt="" className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <div className="text-base font-extrabold">{helperName}</div>
                  <div className="text-sm text-muted-foreground">{helper?.city ?? "Ort offen"} · {helper?.pricePerHour ?? "—"} €/Std</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground/85">
                {helper?.bio ?? "Dieses Helferprofil wurde für die Anfrage angelegt."}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(helper?.qualifications ?? []).slice(0, 4).map((q) => (
                  <span key={q} className="rounded-full bg-mint-soft px-2.5 py-1 text-xs font-semibold">{q}</span>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


// ------- Booking card (in-chat) --------
export function BookingCard({
  type, mine, req, onAccept, onDecline,
}: {
  type: Message["type"];
  mine: boolean;
  req: BookingPayload;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const total = req.duration * req.pricePerHour * (req.type === "package" ? 4 * (req.packageMonths ?? 1) : 1);
  const label =
    type === "booking_request" ? "Terminanfrage"
    : type === "booking_accepted" ? "Termin bestätigt"
    : type === "booking_declined" ? "Termin abgelehnt"
    : "Neuer Terminvorschlag";
  const icon =
    type === "booking_accepted" ? <CheckCircle2 className="h-4 w-4 text-[color:var(--mint)]" />
    : type === "booking_declined" ? <X className="h-4 w-4 text-destructive" />
    : <Calendar className="h-4 w-4" />;

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[85%] rounded-2xl border border-border bg-card p-4 text-sm shadow-card",
        type === "booking_accepted" && "border-[color:var(--mint)]",
        type === "booking_declined" && "border-destructive/40",
      )}>
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {icon} {label}
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {new Date(req.date).toLocaleDateString("de-DE")}</div>
          <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {req.time} · {req.duration} Std.</div>
          {req.type !== "once" && <div className="text-xs text-muted-foreground">
            {req.type === "weekly" ? `Wöchentlich (${(req.weeklyDays ?? []).join(", ")})` : `Paket · ${req.packageMonths ?? 1} Monat(e)`}
          </div>}
          {req.notes && <div className="text-xs text-muted-foreground">Notiz: {req.notes}</div>}
          <div className="pt-1 text-xs font-bold">Gesamt: {total.toFixed(2)} €</div>
        </div>
        {(onAccept || onDecline) && (
          <div className="mt-3 flex gap-2">
            {onAccept && <Button size="sm" onClick={onAccept} className="flex-1"><Check className="mr-1 h-4 w-4" />Annehmen</Button>}
            {onDecline && <Button size="sm" variant="outline" onClick={onDecline} className="flex-1"><X className="mr-1 h-4 w-4" />Ablehnen</Button>}
          </div>
        )}
      </div>
    </div>
  );
}

// ------- Booking dialog with helper-availability calendar --------
function ChatBookingDialog({
  open, onClose, pricePerHour, availability, onConfirm,
}: {
  open: boolean; onClose: () => void; pricePerHour: number;
  availability: AvailabilitySlot[];
  onConfirm: (p: {
    date: string; time: string; duration: number;
    type: "once" | "weekly" | "package"; weeklyDays?: string[];
    packageMonths?: number; notes?: string;
  }) => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(2);
  const [type, setType] = useState<"once" | "weekly" | "package">("once");
  const [days, setDays] = useState<string[]>([]);
  const [months, setMonths] = useState(1);
  const [notes, setNotes] = useState("");

  const slotByDate = useMemo(() => {
    const m = new Map<string, AvailabilitySlot>();
    availability.forEach((s) => m.set(s.date, s));
    return m;
  }, [availability]);

  const selectedSlot = date ? slotByDate.get(date) ?? null : null;
  const timeChoices = selectedSlot ? startTimeOptions(selectedSlot, duration) : [];

  useEffect(() => {
    if (!selectedSlot) { setTime(""); return; }
    if (!timeChoices.includes(time)) setTime(timeChoices[0] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, duration]);

  const total = duration * pricePerHour * (type === "package" ? 4 * months : 1);
  const fee = total * 0.1;
  const toggleDay = (d: string) => setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Termin anfragen</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="mb-1 text-xs font-bold text-muted-foreground">Verfügbare Tage</div>
            <MonthGrid slots={availability} selected={date} onSelect={setDate} />
          </div>

          {selectedSlot ? (
            <>
              <div>
                <div className="mb-1 text-xs font-bold text-muted-foreground">
                  Verfügbares Zeitfenster: {selectedSlot.startTime}–{selectedSlot.endTime}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {timeChoices.length === 0 && (
                    <span className="text-xs text-muted-foreground">Dauer passt nicht ins Fenster.</span>
                  )}
                  {timeChoices.map((t) => (
                    <button key={t} onClick={() => setTime(t)}
                      className={cn("h-9 rounded-lg border-2 px-2.5 text-xs font-bold",
                        time === t ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
              Wähle einen Tag im Kalender.
            </div>
          )}

          <div>
            <div className="mb-1 text-xs font-bold text-muted-foreground">Buchungstyp</div>
            <div className="grid grid-cols-3 gap-2">
              {(["once", "weekly", "package"] as const).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={cn("h-10 rounded-xl border-2 text-xs font-semibold",
                    type === t ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground")}>
                  {t === "once" ? "Einmalig" : t === "weekly" ? "Wöchentlich" : "Paket"}
                </button>
              ))}
            </div>
          </div>

          {type === "weekly" && (
            <div>
              <div className="mb-1 text-xs font-bold text-muted-foreground">Wochentage</div>
              <div className="flex flex-wrap gap-1.5">
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
                  <button key={d} onClick={() => toggleDay(d)}
                    className={cn("h-9 w-11 rounded-lg border-2 text-xs font-bold",
                      days.includes(d) ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground")}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === "package" && (
            <div>
              <div className="mb-1 text-xs font-bold text-muted-foreground">Paketdauer</div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 6].map((m) => (
                  <button key={m} onClick={() => setMonths(m)}
                    className={cn("h-10 rounded-xl border-2 text-xs font-semibold",
                      months === m ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground")}>
                    {m} Mon.
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-1 text-xs font-bold text-muted-foreground">Dauer (Std.)</div>
            <div className="flex flex-wrap gap-1.5">
              {[1, 1.5, 2, 3, 4, 5, 6, 8].map((h) => (
                <button key={h} onClick={() => setDuration(h)}
                  className={cn("h-9 min-w-11 rounded-lg border-2 px-2 text-xs font-bold",
                    duration === h ? "border-primary bg-primary/15" : "border-border bg-card text-muted-foreground")}>
                  {h}
                </button>
              ))}
            </div>
          </div>

          <Textarea rows={2} placeholder="Notizen (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <div className="rounded-2xl bg-mint-soft p-3 text-sm">
            <div className="flex justify-between"><span>Stundensatz</span><span className="font-bold">{pricePerHour} €</span></div>
            <div className="flex justify-between"><span>Zwischensumme</span><span className="font-bold">{total.toFixed(2)} €</span></div>
            <div className="flex justify-between"><span>Servicegebühr (10 %)</span><span className="font-bold">{fee.toFixed(2)} €</span></div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Zahlung erst nach Zusage
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button
            disabled={!date || !time}
            onClick={() => onConfirm({ date, time, duration, type, weeklyDays: days, packageMonths: months, notes })}
          >
            Anfrage senden ({(total + fee).toFixed(2)} €)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Compact calendar showing the next ~45 days, highlighting availability.
export function MonthGrid({
  slots, selected, onSelect,
}: { slots: AvailabilitySlot[]; selected: string; onSelect: (d: string) => void }) {
  const available = useMemo(() => new Set(slots.map((s) => s.date)), [slots]);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    days.push(d);
  }
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="grid grid-cols-7 gap-1 rounded-2xl border border-border bg-card p-3">
      {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((h) => (
        <div key={h} className="text-center text-[10px] font-bold uppercase text-muted-foreground">{h}</div>
      ))}
      {days.map((d) => {
        const dateStr = iso(d);
        const isAvail = available.has(dateStr);
        const isSel = selected === dateStr;
        return (
          <button
            key={dateStr}
            disabled={!isAvail}
            onClick={() => onSelect(dateStr)}
            className={cn(
              "flex h-10 flex-col items-center justify-center rounded-lg text-xs font-bold",
              isSel && "bg-primary text-primary-foreground",
              !isSel && isAvail && "bg-mint-soft text-foreground hover:bg-mint",
              !isAvail && "bg-muted/40 text-muted-foreground/40 cursor-not-allowed",
            )}
          >
            <span>{d.getDate()}</span>
            <span className="text-[9px] font-medium opacity-70">{d.toLocaleDateString("de-DE", { month: "short" })}</span>
          </button>
        );
      })}
    </div>
  );
}
