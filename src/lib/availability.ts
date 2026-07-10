// Computes mock free time-slots for a helper based on workingDays + workingHours.

import type { Appointment, Helper } from "./mock-data";

export type AvailabilitySlot = {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
};

const DAY_LABEL_TO_INDEX: Record<string, number> = {
  So: 0, Mo: 1, Di: 2, Mi: 3, Do: 4, Fr: 5, Sa: 6,
};

function parseHours(range: string): [string, string] {
  // e.g. "08:00-18:00" or "8-18" or "vormittags"
  const m = range.match(/(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?/);
  if (!m) return ["09:00", "17:00"];
  const pad = (h: string) => h.padStart(2, "0");
  return [`${pad(m[1])}:${m[2] ?? "00"}`, `${pad(m[3])}:${m[4] ?? "00"}`];
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function computeAvailability(
  helper: Pick<Helper, "id" | "workingDays" | "workingHours">,
  appointments: Appointment[],
  daysAhead = 30,
): AvailabilitySlot[] {
  const [start, end] = parseHours(helper.workingHours ?? "09:00-17:00");
  const workingIdx = new Set(
    (helper.workingDays ?? ["Mo", "Di", "Mi", "Do", "Fr"])
      .map((d) => DAY_LABEL_TO_INDEX[d])
      .filter((v) => v !== undefined),
  );

  const booked = new Set(
    appointments
      .filter((a) => a.helperId === helper.id && a.status !== "cancelled")
      .map((a) => a.date),
  );

  const slots: AvailabilitySlot[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 1; i <= daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (!workingIdx.has(d.getDay())) continue;
    const date = toISODate(d);
    if (booked.has(date)) continue;
    slots.push({ date, startTime: start, endTime: end });
  }
  return slots;
}

// Generate a list of half-hour start-times inside [start, end - durationHours].
export function startTimeOptions(
  slot: AvailabilitySlot,
  durationHours: number,
): string[] {
  const [sh, sm] = slot.startTime.split(":").map(Number);
  const [eh, em] = slot.endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const durMin = Math.round(durationHours * 60);
  const out: string[] = [];
  for (let t = startMin; t + durMin <= endMin; t += 30) {
    const h = Math.floor(t / 60).toString().padStart(2, "0");
    const m = (t % 60).toString().padStart(2, "0");
    out.push(`${h}:${m}`);
  }
  return out;
}
