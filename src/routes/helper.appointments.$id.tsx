import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, Phone, MessageCircle, User, HeartHandshake, Euro, Check, Info } from "lucide-react";
import { AppLayout, ScreenHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/helper/appointments/$id")({
  head: () => ({ meta: [{ title: "Termindetails · Pflegenah" }] }),
  component: HelperAppointmentDetail,
});

function HelperAppointmentDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { appointments, updateAppointment } = useStore();
  const a = appointments.find((x) => x.id === id);

  if (!a) {
    return (
      <AppLayout variant="helper">
        <ScreenHeader title="Termin" back="/helper/appointments" />
        <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
          Dieser Termin wurde nicht gefunden.
        </div>
      </AppLayout>
    );
  }

  const clientName = a.clientName ?? "Auftraggeber:in";
  const roleLabel = a.clientRole === "family" ? "Nahestehende Person" : "Hilfesuchende Person";
  const dateLabel = new Date(a.date).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const bookingLabel = a.bookingType === "once" ? "Einmalig" : a.bookingType === "weekly" ? `Wöchentlich${a.weeklyDays?.length ? ` (${a.weeklyDays.join(", ")})` : ""}` : `Paket · ${a.packageMonths ?? 1} Monate`;

  return (
    <AppLayout variant="helper">
      <ScreenHeader title="Termindetails" back="/helper/appointments" />

      <section className="mb-4 rounded-2xl bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          {a.clientPhoto ? (
            <img src={a.clientPhoto} alt={clientName} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-bold">{clientName}</div>
            <Badge variant="secondary" className="mt-1">{roleLabel}</Badge>
          </div>
        </div>

        {a.careRecipientName && a.careRecipientName !== clientName && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-sm">
            <HeartHandshake className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Betreuung für</div>
              <div className="font-medium">{a.careRecipientName}</div>
            </div>
          </div>
        )}

        {(a.careLevel || (a.supportNeeds && a.supportNeeds.length > 0)) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {a.careLevel && <Badge variant="outline">Pflegegrad {a.careLevel}</Badge>}
            {a.supportNeeds?.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
          </div>
        )}
      </section>

      <section className="mb-4 space-y-2 rounded-2xl bg-card p-4 shadow-card">
        <h3 className="mb-2 text-sm font-bold">Termin</h3>
        <Row icon={<Calendar className="h-4 w-4" />} label="Datum" value={dateLabel} />
        <Row icon={<Clock className="h-4 w-4" />} label="Uhrzeit" value={`${a.startTime} · ${a.durationHours} Std.`} />
        <Row icon={<Info className="h-4 w-4" />} label="Buchungsart" value={bookingLabel} />
        {a.serviceType && <Row icon={<HeartHandshake className="h-4 w-4" />} label="Leistung" value={a.serviceType} />}
        {a.address && <Row icon={<MapPin className="h-4 w-4" />} label="Adresse" value={a.address} />}
        <Row icon={<Euro className="h-4 w-4" />} label="Vergütung" value={`${a.totalAmount.toFixed(2)} € (${a.pricePerHour.toFixed(2)} €/Std.)`} />
      </section>

      {a.notes && (
        <section className="mb-4 rounded-2xl bg-card p-4 shadow-card">
          <h3 className="mb-2 text-sm font-bold">Notizen der Auftraggeber:in</h3>
          <p className="text-sm text-muted-foreground">{a.notes}</p>
        </section>
      )}

      <section className="mb-6 space-y-2">
        {a.matchId && (
          <Button asChild variant="outline" className="w-full rounded-full">
            <Link to="/helper/messages/$id" params={{ id: a.matchId }}>
              <MessageCircle className="mr-2 h-4 w-4" /> Chat öffnen
            </Link>
          </Button>
        )}
        {a.clientPhone && (
          <Button asChild variant="outline" className="w-full rounded-full">
            <a href={`tel:${a.clientPhone}`}><Phone className="mr-2 h-4 w-4" /> {a.clientPhone}</a>
          </Button>
        )}
        {a.status === "upcoming" && (
          <Button className="w-full rounded-full" onClick={() => {
            updateAppointment(a.id, { status: "completed", paymentStatus: "completed_by_helper" });
            toast.success("Termin als erledigt markiert");
            navigate({ to: "/helper/appointments" });
          }}>
            <Check className="mr-2 h-4 w-4" /> Als erledigt markieren
          </Button>
        )}
      </section>
    </AppLayout>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}
