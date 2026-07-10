import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import type { Invoice } from "@/lib/invoice-utils";
import { CARE_INSURERS, monthLabel } from "@/lib/invoice-utils";
import type { Appointment } from "@/lib/mock-data";

export function InvoicePreview({
  open, onOpenChange, invoice, appointments,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  invoice: Invoice | null;
  appointments: Appointment[];
}) {
  if (!invoice) return null;
  const items = appointments.filter((a) => invoice.appointmentIds.includes(a.id));
  const insurer = CARE_INSURERS.find((i) => i.name === invoice.insurerName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-3 print:hidden">
          <div className="text-sm font-semibold">Rechnungs-Vorschau · {invoice.number}</div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => window.print()}>
              <Printer className="mr-1 h-3.5 w-3.5" /> Drucken / Als PDF speichern
            </Button>
            <button onClick={() => onOpenChange(false)} className="rounded-full p-1.5 hover:bg-background" aria-label="Schließen">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div id="invoice-print" className="max-h-[75vh] overflow-y-auto bg-white p-10 text-sm text-black print:max-h-none print:overflow-visible print:p-10">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="text-xl font-black text-[color:var(--peach)]">Pflegenah</div>
              <div className="text-xs text-neutral-600">Vermittlungsplattform für Alltagshilfe</div>
              <div className="mt-2 text-[11px] leading-tight text-neutral-600">
                Pflegenah UG (haftungsbeschränkt)<br />
                Musterstraße 1 · 45127 Essen<br />
                USt-ID: DE123456789
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black">Rechnung</div>
              <div className="mt-1 text-[11px]">
                <div><b>Rechnungsnr.:</b> {invoice.number}</div>
                <div><b>Datum:</b> {new Date(invoice.createdAt).toLocaleDateString("de-DE")}</div>
                <div><b>Leistungszeitraum:</b> {monthLabel(invoice.month)}</div>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-6 text-[11px]">
            <div>
              <div className="mb-1 font-bold text-neutral-500">Rechnungsempfänger (Pflegekasse)</div>
              <div className="font-semibold">{invoice.insurerName}</div>
              {insurer && <div className="text-neutral-700">{insurer.address}</div>}
            </div>
            <div>
              <div className="mb-1 font-bold text-neutral-500">Leistungsempfänger:in</div>
              <div className="font-semibold">{invoice.recipientName}</div>
              <div className="text-neutral-700">Versicherungsnr.: {invoice.insuranceNumber || "—"}</div>
              <div className="text-neutral-700">{invoice.careLevel}</div>
            </div>
          </div>

          <p className="mb-4 text-[12px] leading-relaxed">
            Sehr geehrte Damen und Herren,<br />
            wir stellen Ihnen die im o. g. Zeitraum über die Pflegenah-Plattform erbrachten Entlastungsleistungen gemäß
            § 45b SGB XI in Rechnung. Wir bitten um Erstattung auf das hinterlegte Konto der versicherten Person.
          </p>

          <table className="mb-6 w-full text-[11px]">
            <thead>
              <tr className="border-b-2 border-black text-left">
                <th className="py-2">Datum</th>
                <th>Leistung</th>
                <th>Dienstleister:in</th>
                <th className="text-right">Std.</th>
                <th className="text-right">€/Std.</th>
                <th className="text-right">Betrag</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-neutral-200">
                  <td className="py-2">{new Date(a.date).toLocaleDateString("de-DE")}</td>
                  <td>Alltagsbegleitung / Entlastung</td>
                  <td>{a.helperName}</td>
                  <td className="text-right">{a.durationHours.toFixed(1)}</td>
                  <td className="text-right">{a.pricePerHour.toFixed(2)}</td>
                  <td className="text-right">{a.totalAmount.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-black font-bold">
                <td colSpan={5} className="py-2 text-right">Rechnungsbetrag gesamt</td>
                <td className="py-2 text-right">{invoice.total.toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>

          <p className="mb-6 text-[11px] text-neutral-700">
            Umsatzsteuerbefreit gemäß § 4 Nr. 16 UStG. Zahlung bitte innerhalb von 30 Tagen unter Angabe der Rechnungsnummer.
          </p>

          <div className="border-t border-neutral-300 pt-3 text-[10px] text-neutral-500">
            Bankverbindung: DE00 0000 0000 0000 0000 00 · BIC: XXXXDEXXX · Pflegenah UG (haftungsbeschränkt)
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
