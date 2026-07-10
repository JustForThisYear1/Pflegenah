// Prototype invoice + care-insurance utilities for Pflegenah.

export type CareInsurance = {
  insurerName: string;
  insuranceNumber: string;
  careLevel: string; // Pflegegrad 1..5
  monthlyBudget: number; // e.g. 131 € Entlastungsbetrag
  autoSend: boolean;
};

export type InvoiceStatus = "draft" | "ready" | "sent" | "reimbursed";

export type Invoice = {
  id: string;
  number: string; // Rechnungsnummer
  month: string; // YYYY-MM
  appointmentIds: string[];
  subtotal: number;
  total: number;
  insurerName: string;
  insuranceNumber: string;
  careLevel: string;
  recipientName: string;
  status: InvoiceStatus;
  createdAt: string;
  sentAt?: string;
  reimbursedAt?: string;
};

export type PayoutMethod = "stripe" | "paypal" | "bank";

export type PayoutAccount = {
  method: PayoutMethod;
  iban?: string;
  email?: string;
  connected: boolean;
};

export type PayoutStatus = "requested" | "processing" | "paid";

export type Payout = {
  id: string;
  amount: number;
  method: PayoutMethod;
  status: PayoutStatus;
  requestedAt: string;
  paidAt?: string;
  reference: string;
};

// Statische Liste der wichtigsten deutschen Pflegekassen (Prototyp-Auswahl).
export const CARE_INSURERS = [
  { name: "AOK Pflegekasse", address: "Rosenthaler Straße 31, 10178 Berlin" },
  { name: "Techniker Krankenkasse Pflegekasse", address: "Bramfelder Straße 140, 22305 Hamburg" },
  { name: "Barmer Pflegekasse", address: "Axel-Springer-Straße 44, 10969 Berlin" },
  { name: "DAK Pflegekasse", address: "Nagelsweg 27–31, 20097 Hamburg" },
  { name: "IKK classic Pflegekasse", address: "Tannenstraße 4b, 01099 Dresden" },
  { name: "Knappschaft Pflegekasse", address: "Pieperstraße 14–28, 44789 Bochum" },
  { name: "hkk Pflegekasse", address: "Martinistraße 26, 28195 Bremen" },
  { name: "BKK VBU Pflegekasse", address: "Lindenstraße 67, 10969 Berlin" },
  { name: "KKH Pflegekasse", address: "Karl-Wiechert-Allee 61, 30625 Hannover" },
  { name: "SBK Pflegekasse", address: "Heimeranstraße 31, 80339 München" },
  { name: "Mobil Pflegekasse", address: "Nagelsweg 33, 20097 Hamburg" },
  { name: "HEK Pflegekasse", address: "Wandsbeker Zollstraße 86–90, 22041 Hamburg" },
  { name: "R+V BKK Pflegekasse", address: "Kreuzberger Ring 21, 65205 Wiesbaden" },
  { name: "AOK Bayern Pflegekasse", address: "Carl-Wery-Straße 28, 81739 München" },
  { name: "AOK Nordost Pflegekasse", address: "Wilhelmstraße 1, 10963 Berlin" },
  { name: "AOK PLUS Pflegekasse", address: "Sternplatz 7, 01067 Dresden" },
  { name: "AOK Rheinland/Hamburg Pflegekasse", address: "Kasernenstraße 61, 40213 Düsseldorf" },
  { name: "AOK Baden-Württemberg Pflegekasse", address: "Presselstraße 19, 70191 Stuttgart" },
  { name: "BIG direkt gesund Pflegekasse", address: "Rheinische Straße 1, 44137 Dortmund" },
  { name: "Debeka BKK Pflegekasse", address: "Ferdinand-Sauerbruch-Straße 18, 56073 Koblenz" },
];

export const DEFAULT_MONTHLY_BUDGET = 131; // §45b SGB XI Entlastungsbetrag 2025

export function monthKey(dateISO: string): string {
  return dateISO.slice(0, 7); // YYYY-MM
}

export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

export function makeInvoiceNumber(month: string, seq: number): string {
  return `PN-${month.replace("-", "")}-${String(seq).padStart(3, "0")}`;
}

export function statusLabel(s: InvoiceStatus): string {
  switch (s) {
    case "draft": return "Entwurf";
    case "ready": return "Bereit";
    case "sent": return "Gesendet";
    case "reimbursed": return "Erstattet";
  }
}

export function payoutStatusLabel(s: PayoutStatus): string {
  switch (s) {
    case "requested": return "Angefragt";
    case "processing": return "In Bearbeitung";
    case "paid": return "Ausgezahlt";
  }
}
