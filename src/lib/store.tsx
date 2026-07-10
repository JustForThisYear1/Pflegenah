// Global in-memory + localStorage store for the Pflegenah prototype.
// Swap this later for Supabase-backed hooks without changing consumers.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  MOCK_HELPERS,
  MOCK_JOBS,
  type Appointment,
  type FamilyProfile,
  type Helper,
  type Job,
  type JobApplication,
  type Match,
  type Message,
  type Role,
  scoreHelper,
} from "./mock-data";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_MONTHLY_BUDGET,
  makeInvoiceNumber,
  monthKey,
  type CareInsurance,
  type Invoice,
  type Payout,
  type PayoutAccount,
  type PayoutMethod,
} from "./invoice-utils";

const remotePosterPhoto = (seed: string) => `https://i.pravatar.cc/240?u=${encodeURIComponent(seed)}`;

const REMOTE_JOB_POSTERS: Record<string, { name: string; photo: string }> = {
  "Einkaufsbegleitung Rewe": { name: "Sabine Krüger", photo: remotePosterPhoto("sabine-krueger") },
  "Spaziergang im Grugapark": { name: "Thomas Neumann", photo: remotePosterPhoto("thomas-neumann") },
  "Arztbegleitung Kardiologie": { name: "Gerda Bauer", photo: remotePosterPhoto("gerda-bauer") },
  "Haushaltshilfe leichte Reinigung": { name: "Miriam Schneider", photo: remotePosterPhoto("miriam-schneider") },
  "Technikhilfe Tablet & WLAN": { name: "David Wagner", photo: remotePosterPhoto("david-wagner") },
  "Gesellschaft am Nachmittag": { name: "Elisabeth Hoffmann", photo: remotePosterPhoto("elisabeth-hoffmann") },
  "Hundebetreuung Dackel": { name: "Werner Fischer", photo: remotePosterPhoto("werner-fischer") },
  "Gartenarbeit Herbstlaub": { name: "Petra Klein", photo: remotePosterPhoto("petra-klein") },
  "Nachtwache-Vertretung eine Nacht": { name: "Claudia Winter", photo: remotePosterPhoto("claudia-winter") },
  "Café-Ausflug samstags": { name: "Jana Richter", photo: remotePosterPhoto("jana-richter") },
  "Rollstuhl-Spaziergang im Grugapark": { name: "Markus Berger", photo: remotePosterPhoto("markus-berger") },
  "Sturzprävention-Übungen zuhause": { name: "Elke Hartmann", photo: remotePosterPhoto("elke-hartmann") },
  "Wochenend-Entlastung für pflegende Tochter": { name: "Nadine Vogel", photo: remotePosterPhoto("nadine-vogel") },
  "Frühstückshilfe morgens": { name: "Gerhard Meier", photo: remotePosterPhoto("gerhard-meier") },
  "Wäsche waschen & bügeln 1× pro Woche": { name: "Tanja Klein", photo: remotePosterPhoto("tanja-klein") },
  "Wocheneinkauf türkischer Supermarkt": { name: "Emine Aslan", photo: remotePosterPhoto("emine-aslan") },
  "Begleitung Gottesdienst sonntags": { name: "Christel Berger", photo: remotePosterPhoto("christel-berger") },
};

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type Store = {
  role: Role | null;
  setRole: (r: Role | null) => void;

  demoMode: boolean;
  enableDemoMode: (as?: Role) => void;
  disableDemoMode: () => void;

  familyProfile: FamilyProfile | null;
  setFamilyProfile: (p: FamilyProfile | null) => void;
  updateFamilyProfile: (patch: Partial<FamilyProfile>) => void;

  helperSelf: Partial<Helper> | null;
  setHelperSelf: (h: Partial<Helper> | null) => void;

  helpers: Helper[];
  updateHelper: (id: string, patch: Partial<Helper>) => void;

  favorites: string[];
  toggleFavorite: (helperId: string) => void;
  isFavorite: (helperId: string) => boolean;

  matches: Match[];
  ensureMatch: (helperId: string) => Match;

  messages: Message[];
  sendMessage: (matchId: string, content: string, senderId?: string, type?: Message["type"]) => void;

  appointments: Appointment[];
  addAppointment: (a: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;

  jobs: Job[];
  applications: JobApplication[];
  applyToJob: (jobId: string, message: string) => JobApplication;
  updateApplication: (id: string, patch: Partial<JobApplication>) => void;


  notifications: Notification[];
  markAllRead: () => void;

  // Care insurance / invoices (prototype)
  careInsurance: CareInsurance;
  updateCareInsurance: (patch: Partial<CareInsurance>) => void;

  invoices: Invoice[];
  generateInvoiceForMonth: (month: string) => Invoice | null;
  sendInvoice: (id: string) => void;
  markReimbursed: (id: string) => void;

  // Helper payouts (prototype)
  payoutAccount: PayoutAccount;
  connectPayoutAccount: (patch: Partial<PayoutAccount>) => void;
  payouts: Payout[];
  requestPayout: (amount: number) => Payout | null;
  completePayout: (id: string) => void;

  reset: () => void;
};

const DEFAULT_CARE_INSURANCE: CareInsurance = {
  insurerName: "AOK Pflegekasse",
  insuranceNumber: "",
  careLevel: "Pflegegrad 2",
  monthlyBudget: DEFAULT_MONTHLY_BUDGET,
  autoSend: true,
};

const DEFAULT_PAYOUT_ACCOUNT: PayoutAccount = {
  method: "bank",
  connected: false,
};

const DEMO_FAMILY: FamilyProfile = {
  id: "demo-family",
  firstName: "Demo",
  lastName: "Nutzer:in",
  gender: "keine Angabe",
  birthdate: "1950-05-12",
  email: "demo@pflegenah.de",
  phone: "+49 170 0000000",
  interests: ["Spaziergänge", "Lesen", "Kochen"],
  supportNeeds: ["Einkaufen", "Haushalt", "Begleitung"],
  careLevel: "Pflegegrad 2",
  mobility: "eingeschränkt",
  genderPreference: "egal",
  livingSituation: "Wohnung",
  householdSize: 1,
  pets: false,
  maxPricePerHour: 25,
  city: "Essen",
  postalCode: "45127",
};

const DEMO_HELPER_SELF: Partial<Helper> = {
  id: "demo-helper",
  name: "Demo Helfer:in",
  age: 32,
  photo: "",
  bio: "Demo-Profil – zum Durchklicken der Plattform.",
  qualifications: ["Erste Hilfe", "Betreuungsassistent:in"],
  interests: ["Kochen", "Spazieren"],
  languages: ["Deutsch", "Englisch"],
  pricePerHour: 22,
  city: "Essen",
  postalCode: "45127",
  gender: "Divers",
  verified: true,
  verificationStatus: "verified",
};

const StoreCtx = createContext<Store | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [familyProfile, setFamilyProfileState] = useState<FamilyProfile | null>(null);
  const [helperSelf, setHelperSelfState] = useState<Partial<Helper> | null>(null);
  const [helpers, setHelpers] = useState<Helper[]>(MOCK_HELPERS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [careInsurance, setCareInsuranceState] = useState<CareInsurance>(DEFAULT_CARE_INSURANCE);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payoutAccount, setPayoutAccountState] = useState<PayoutAccount>(DEFAULT_PAYOUT_ACCOUNT);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: uid(),
      title: "Willkommen bei Pflegenah",
      message: "Ihr Konto ist bereit. Finden Sie jetzt passende Helfer:innen in Ihrer Nähe.",
      read: false,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [hydrated, setHydrated] = useState(false);

  // hydrate
  useEffect(() => {
    setRoleState(loadLS("pn:role", null));
    setDemoMode(loadLS<boolean>("pn:demo", false));
    setFamilyProfileState(loadLS("pn:family", null));
    setHelperSelfState(loadLS("pn:helperSelf", null));
    setHelpers(loadLS("pn:helpers", MOCK_HELPERS));
    setFavorites(loadLS<string[]>("pn:favorites", []));
    setMatches(loadLS("pn:matches", []));
    // Hydrate messages from localStorage immediately; Supabase merges in later.
    setMessages(loadLS<Message[]>("pn:messages", []));
    setAppointments(loadLS("pn:appointments", []));
    setApplications(loadLS<JobApplication[]>("pn:applications", []));
    setCareInsuranceState(loadLS<CareInsurance>("pn:careInsurance", DEFAULT_CARE_INSURANCE));
    setInvoices(loadLS<Invoice[]>("pn:invoices", []));
    setPayoutAccountState(loadLS<PayoutAccount>("pn:payoutAccount", DEFAULT_PAYOUT_ACCOUNT));
    setPayouts(loadLS<Payout[]>("pn:payouts", []));
    setHydrated(true);
  }, []);



  // Hydrate messages from Supabase + subscribe to realtime inserts.
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(500)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const remote: Message[] = data.map((r: any) => ({
          id: r.id,
          matchId: r.match_id,
          senderId: r.sender_id,
          content: r.content,
          type: (r.type ?? "text") as Message["type"],
          createdAt: r.created_at,
        }));
        setMessages((prev) => {
          const byId = new Map<string, Message>();
          for (const m of prev) byId.set(m.id, m);
          for (const m of remote) byId.set(m.id, m);
          return Array.from(byId.values()).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
        });
      });


    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const r = payload.new as any;
          const msg: Message = {
            id: r.id,
            matchId: r.match_id,
            senderId: r.sender_id,
            content: r.content,
            type: (r.type ?? "text") as Message["type"],
            createdAt: r.created_at,
          };
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // Hydrate jobs from Supabase (fallback to MOCK_JOBS on error).
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled || error || !data || data.length === 0) return;
        const mapped: Job[] = data.map((r: any) => {
          const poster = REMOTE_JOB_POSTERS[r.title] ?? {
            name: `Auftraggeber:in ${String(r.id).slice(0, 4)}`,
            photo: remotePosterPhoto(`auftrag-${r.id}`),
          };
          return {
            id: r.id,
            title: r.title,
            postedBy: (r.created_by_role === "user" ? "user" : "family") as Job["postedBy"],
            postedByName: poster.name,
            postedByPhoto: poster.photo,
            description: r.description,
            requirements: [],
            supportNeeds: [r.service_type],
            date: new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10),
            time: "10:00",
            durationHours: Number(r.duration_hours),
            pricePerHour: Number(r.budget_per_hour),
            address: r.address,
            city: r.city,
            postalCode: r.postal_code,
            distanceKm: 0,
            mapX: 50,
            mapY: 50,
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
            createdAt: r.created_at,
          };
        });
        setJobs([
          ...mapped,
          ...MOCK_JOBS.filter((mockJob) => !mapped.some((job) => job.id === mockJob.id)),
        ]);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { if (hydrated) saveLS("pn:role", role); }, [role, hydrated]);
  useEffect(() => { if (hydrated) saveLS("pn:family", familyProfile); }, [familyProfile, hydrated]);
  useEffect(() => { if (hydrated) saveLS("pn:helperSelf", helperSelf); }, [helperSelf, hydrated]);
  useEffect(() => { if (hydrated) saveLS("pn:helpers", helpers); }, [helpers, hydrated]);
  useEffect(() => { if (hydrated) saveLS("pn:matches", matches); }, [matches, hydrated]);
  useEffect(() => { if (hydrated) saveLS("pn:messages", messages.slice(-500)); }, [messages, hydrated]);
  useEffect(() => { if (hydrated) saveLS("pn:appointments", appointments); }, [appointments, hydrated]);
  useEffect(() => { if (hydrated) saveLS("pn:favorites", favorites); }, [favorites, hydrated]);
  useEffect(() => { if (hydrated) saveLS("pn:applications", applications); }, [applications, hydrated]);
  useEffect(() => { if (hydrated) saveLS("pn:demo", demoMode); }, [demoMode, hydrated]);
  useEffect(() => { if (hydrated) saveLS("pn:careInsurance", careInsurance); }, [careInsurance, hydrated]);
  useEffect(() => { if (hydrated) saveLS("pn:invoices", invoices); }, [invoices, hydrated]);
  useEffect(() => { if (hydrated) saveLS("pn:payoutAccount", payoutAccount); }, [payoutAccount, hydrated]);
  useEffect(() => { if (hydrated) saveLS("pn:payouts", payouts); }, [payouts, hydrated]);


  const setRole = useCallback((r: Role | null) => setRoleState(r), []);
  const setFamilyProfile = useCallback((p: FamilyProfile | null) => setFamilyProfileState(p), []);
  const updateFamilyProfile = useCallback((patch: Partial<FamilyProfile>) => {
    setFamilyProfileState((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);
  const setHelperSelf = useCallback((h: Partial<Helper> | null) => setHelperSelfState(h), []);

  const enableDemoMode = useCallback((as?: Role) => {
    setDemoMode(true);
    if (as) setRoleState(as);
    setFamilyProfileState((prev) => prev ?? DEMO_FAMILY);
    setHelperSelfState((prev) => prev ?? DEMO_HELPER_SELF);
  }, []);
  const disableDemoMode = useCallback(() => setDemoMode(false), []);

  const updateHelper = useCallback((id: string, patch: Partial<Helper>) => {
    setHelpers((hs) => hs.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }, []);

  const toggleFavorite = useCallback((helperId: string) => {
    setFavorites((prev) => prev.includes(helperId) ? prev.filter((x) => x !== helperId) : [...prev, helperId]);
  }, []);
  const isFavorite = useCallback((helperId: string) => favorites.includes(helperId), [favorites]);

  const ensureMatch = useCallback((helperId: string): Match => {
    const existing = matches.find((m) => m.helperId === helperId);
    if (existing) return existing;
    const helper = helpers.find((h) => h.id === helperId)!;
    const { score, reasons } = scoreHelper(helper, familyProfile);
    const m: Match = {
      id: helperId,
      helperId,
      compatibilityScore: score,
      reasons,
      createdAt: new Date().toISOString(),
    };
    setMatches((prev) => [...prev, m]);
    return m;
  }, [matches, helpers, familyProfile]);

  const sendMessage = useCallback((
    matchId: string,
    content: string,
    senderId = "me",
    type: Message["type"] = "text",
  ) => {
    const senderRole = senderId === "me" ? "family" : "helper";
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${uid()}-${uid()}-${uid()}-${uid()}`;
    const optimistic: Message = {
      id,
      matchId,
      senderId,
      content,
      type,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => (prev.some((m) => m.id === id) ? prev : [...prev, optimistic]));
    void supabase.from("messages").insert({
      id,
      match_id: matchId,
      sender_id: senderId,
      sender_role: senderRole,
      content,
      type,
    });
  }, []);


  const addAppointment = useCallback((a: Omit<Appointment, "id">) => {
    const appt: Appointment = { ...a, id: uid() };
    setAppointments((prev) => [...prev, appt]);
    return appt;
  }, []);

  const updateAppointment = useCallback((id: string, patch: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const applyToJob = useCallback((jobId: string, message: string): JobApplication => {
    const helperName = helperSelf?.name ?? "Helfer:in";
    const helperId = helperSelf?.id ?? "me-helper";
    const existing = applications.find((a) => a.jobId === jobId && a.helperId === helperId);
    if (existing) return existing;
    const app: JobApplication = {
      id: uid(),
      jobId,
      helperId,
      helperName,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setApplications((prev) => {
      const next = [...prev, app];
      saveLS("pn:applications", next);
      return next;
    });
    return app;
  }, [applications, helperSelf]);

  const updateApplication = useCallback((id: string, patch: Partial<JobApplication>) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);


  const updateCareInsurance = useCallback((patch: Partial<CareInsurance>) => {
    setCareInsuranceState((prev) => ({ ...prev, ...patch }));
  }, []);

  const generateInvoiceForMonth = useCallback((month: string): Invoice | null => {
    const relevant = appointments.filter(
      (a) => monthKey(a.date) === month
        && (a.status === "confirmed" || a.status === "completed"
            || a.paymentStatus === "confirmed_by_family"
            || a.paymentStatus === "released_to_helper"),
    );
    if (relevant.length === 0) return null;
    const subtotal = relevant.reduce((s, a) => s + a.totalAmount, 0);
    const existing = invoices.find((i) => i.month === month);
    if (existing) return existing;
    const seq = invoices.filter((i) => i.month === month).length + 1;
    const inv: Invoice = {
      id: uid(),
      number: makeInvoiceNumber(month, seq),
      month,
      appointmentIds: relevant.map((a) => a.id),
      subtotal,
      total: subtotal,
      insurerName: careInsurance.insurerName,
      insuranceNumber: careInsurance.insuranceNumber,
      careLevel: careInsurance.careLevel,
      recipientName: familyProfile ? `${familyProfile.firstName} ${familyProfile.lastName}`.trim() : "Leistungsempfänger:in",
      status: "ready",
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [inv, ...prev]);
    return inv;
  }, [appointments, invoices, careInsurance, familyProfile]);

  const sendInvoice = useCallback((id: string) => {
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status: "sent", sentAt: new Date().toISOString() } : i));
  }, []);

  const markReimbursed = useCallback((id: string) => {
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status: "reimbursed", reimbursedAt: new Date().toISOString() } : i));
  }, []);

  const connectPayoutAccount = useCallback((patch: Partial<PayoutAccount>) => {
    setPayoutAccountState((prev) => ({ ...prev, ...patch, connected: true }));
  }, []);

  const requestPayout = useCallback((amount: number): Payout | null => {
    if (amount <= 0 || !payoutAccount.connected) return null;
    const method: PayoutMethod = payoutAccount.method;
    const p: Payout = {
      id: uid(),
      amount,
      method,
      status: "processing",
      requestedAt: new Date().toISOString(),
      reference: `PAY-${Date.now().toString().slice(-8)}`,
    };
    setPayouts((prev) => [p, ...prev]);
    return p;
  }, [payoutAccount]);

  const completePayout = useCallback((id: string) => {
    setPayouts((prev) => prev.map((p) => p.id === id ? { ...p, status: "paid", paidAt: new Date().toISOString() } : p));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  }, []);

  const reset = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.clear();
    setRoleState(null);
    setFamilyProfileState(null);
    setHelperSelfState(null);
    setHelpers(MOCK_HELPERS);
    setFavorites([]);
    setMatches([]);
    setMessages([]);
    setAppointments([]);
    setApplications([]);
  }, []);

  const value = useMemo<Store>(() => ({
    role, setRole,
    demoMode, enableDemoMode, disableDemoMode,
    familyProfile, setFamilyProfile, updateFamilyProfile,
    helperSelf, setHelperSelf,
    helpers, updateHelper,
    favorites, toggleFavorite, isFavorite,
    matches, ensureMatch,
    messages, sendMessage,
    appointments, addAppointment, updateAppointment,
    jobs, applications, applyToJob, updateApplication,
    notifications, markAllRead,
    careInsurance, updateCareInsurance,
    invoices, generateInvoiceForMonth, sendInvoice, markReimbursed,
    payoutAccount, connectPayoutAccount, payouts, requestPayout, completePayout,
    reset,
  }), [role, demoMode, familyProfile, helperSelf, helpers, favorites, matches, messages, appointments,
      jobs, applications, notifications, careInsurance, invoices, payoutAccount, payouts,
      setRole, enableDemoMode, disableDemoMode, setFamilyProfile, updateFamilyProfile, setHelperSelf, updateHelper, toggleFavorite, isFavorite,
      ensureMatch, sendMessage, addAppointment, updateAppointment, applyToJob, updateApplication, markAllRead,
      updateCareInsurance, generateInvoiceForMonth, sendInvoice, markReimbursed,
      connectPayoutAccount, requestPayout, completePayout, reset]);


  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
