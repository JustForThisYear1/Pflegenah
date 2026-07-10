# Plan: Rechnung an Pflegekasse + Payment-Escrow (Prototyp-UI)

Beides wird als **funktionale UI ohne echten Versand/echte Zahlungen** gebaut. Der komplette Flow ist klickbar und wirkt echt, aber es fließt kein Geld und keine E-Mail geht raus.

## Feature 1 – Rechnung an Pflegekasse

### Familie: neue Seite `/family/invoices`
- Zeigt pro Monat alle bestätigten Termine gruppiert.
- Fortschrittsbalken zum Entlastungsbetrag (Standard 131 €/Monat, editierbar in Profil).
- Sobald Monat erreicht: Karte „Rechnung bereit – automatisch an Pflegekasse gesendet am 1. des Folgemonats" mit Aktionen:
  - **PDF ansehen** (öffnet Dialog mit gerenderter Rechnung – siehe unten)
  - **Jetzt senden** (statt zu warten)
  - **Status:** Entwurf / Gesendet / Erstattet
- Historie aller bisherigen Rechnungen mit Status-Badge.

### PDF-Rechnung (im Browser, ohne echten Versand)
- Rechnung wird als HTML/CSS-Layout in einem Dialog gerendert (Print-optimiert, per Browser druckbar / „Als PDF speichern").
- Enthält Pflichtangaben nach §45b SGB XI: Rechnungsnummer, Datum, Leistungsempfänger:in, Versicherungsnummer, Pflegegrad, Dienstleister mit Steuer-/Betriebsnummer, Leistungstermine (Datum, Dauer, Stundensatz), Summe.
- Optional-Feld „Wird gesendet an: [Pflegekasse Name + Adresse]" – Auswahl aus statischer Liste der 20 größten deutschen Pflegekassen.

### Familie-Profil: Pflege-Daten
- Neue Section „Pflegekasse & Erstattung":
  - Pflegekasse (Dropdown)
  - Versicherungsnummer
  - Pflegegrad
  - Monatliches Budget (Default 131 €)
  - Toggle „Automatisch am Monatsende senden"

### Automatik (Mock)
- Store simuliert: sobald Summe erreicht → Rechnung erhält Status „Bereit". Am simulierten Monatswechsel (Button „Monat abschließen" in Dev/Prototyp-Kontext) wechselt Status auf „Gesendet". Nach 3 Tagen (Timer/Mock-Button) auf „Erstattet".

### Dashboard-Integration
- QuickLink „Rechnungen & Erstattung" auf `/family/dashboard`.

## Feature 2 – Payment / Escrow (Prototyp-UI)

### Familie: Zahlung beim Buchen
- `/family/booking`: Zahlungsschritt-Karte vor „Buchen bestätigen":
  - Auswahl Zahlungsmethode (Karte, SEPA, PayPal) – nur UI.
  - Hinweis: „Betrag wird treuhänderisch von Pflegenah gehalten und erst nach deiner Bestätigung an die Betreuungskraft freigegeben."
  - Button „Zahlungspflichtig buchen" → Termin bekommt `paymentStatus: "held_in_escrow"`.

### Familie: Termin bestätigen & freigeben
- `/family/bookings` bzw. Termindetails: nach „Als erledigt" durch Helfer erscheint Karte „Leistung bestätigen und Zahlung freigeben" mit Buttons Bestätigen / Melden.
- Bestätigung → `paymentStatus: "released_to_helper"`.

### Helfer: Auszahlung (bestehendes Dashboard erweitern)
- Bestehendes Helfer-Dashboard hat schon Escrow/Verfügbar-Karten – wir bauen die Auszahlungsseite dazu.
- Neue Seite `/helper/payouts`:
  - Onboarding-Karte „Auszahlungskonto verbinden" (nur UI, Auswahl Stripe / PayPal / Banküberweisung IBAN).
  - Nach „verbunden" (localStorage): Auszahlungshistorie + Button „Jetzt auszahlen" (verfügbarer Betrag → `paid_out`).
  - Transaktionsliste (Datum, Termin, Familie, Brutto, Servicegebühr 8 %, Netto).

### Admin
- `/admin/index` oder neue `/admin/payments`: Übersicht aller Escrow-Beträge, Freigaben, Auszahlungen, Rechnungen an Pflegekassen (nur Read-Only Prototyp).

## Store-Erweiterungen (`src/lib/store.tsx`)
- `careInsurance` in Family-Profil-Typ (Kasse, Versicherungsnr., Pflegegrad, Budget, autoSend).
- `invoices: Invoice[]` mit `{ id, month, appointmentIds, total, status, insurerName, sentAt?, reimbursedAt? }`.
- Actions: `generateInvoiceForMonth`, `sendInvoice`, `markReimbursed`.
- `payoutAccount` in Helper-Self: `{ method, iban?, connected }`.
- `payouts: Payout[]` mit Actions `requestPayout`, `completePayout`.
- Bestehende `paymentStatus`-Flüsse werden nur in UI verdrahtet.

## Neue/geänderte Dateien
- neu: `src/routes/family.invoices.tsx`, `src/routes/helper.payouts.tsx`, `src/routes/admin.payments.tsx`
- neu: `src/components/InvoicePreview.tsx` (druckbare Rechnung)
- neu: `src/lib/invoice-utils.ts` (Rechnungsnummer, Pflegekassen-Liste, Berechnungen)
- edit: `src/lib/store.tsx`, `src/routes/family.dashboard.tsx`, `src/routes/family.profile.tsx`, `src/routes/family.booking.tsx`, `src/routes/family.bookings.tsx`, `src/routes/helper.dashboard.tsx`, `src/routes/admin.index.tsx`, `src/routeTree.gen.ts`

## Prototyp-Hinweise (transparent in der UI)
Jede kritische Aktion (Rechnung senden, Zahlung, Auszahlung) zeigt einen dezenten Hinweis-Badge „Prototyp – kein echter Versand / keine echte Zahlung", damit klar bleibt, dass keine echte Krankenkasse und kein echter Zahlungsdienstleister angebunden ist.

## Nicht enthalten (bewusst)
- Kein echter PDF-Generator (Browserdruck reicht für Prototyp)
- Kein echter E-Mail-Versand an Pflegekassen
- Keine Stripe/PayPal-Integration
- Keine Auth/Rollenprüfung neu

Falls du eines der Features später „echt" willst (Stripe Connect aktivieren oder PDF+E-Mail via Lovable Emails), machen wir das als separaten Schritt.
