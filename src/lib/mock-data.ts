// Central mock data + in-memory store for the Pflegenah MVP prototype.
// Later this layer can be swapped for Supabase without touching UI code.

export type Role = "family" | "user" | "helper" | "admin";

export type Helper = {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  qualifications: string[];
  interests: string[];
  languages: string[];
  pricePerHour: number;
  distanceKm: number;
  rating: number;
  verified: boolean;
  city: string;
  postalCode: string;
  experienceYears: number;
  hasDriverLicense: boolean;
  hasCar: boolean;
  smoking: "nein" | "ja" | "gelegentlich";
  petsAtHome: boolean;
  additionalInfo?: string;
  workingDays: string[];
  workingHours: string;
  offers: string[];
  badges: string[];
  homeCountry?: string;
  gender: "Frau" | "Herr" | "Divers";
  motivation: string;
  verificationStatus: "pending" | "verified" | "rejected";
  latitude?: number;
  longitude?: number;
};

export type FamilyProfile = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthdate: string;
  email: string;
  phone: string;
  photo?: string;
  interests: string[];
  supportNeeds: string[];
  careLevel: string;
  mobility: string;
  genderPreference: string;
  diagnoses?: string;
  livingSituation: string;
  householdSize: number;
  pets: boolean;
  equipment?: string;
  maxPricePerHour: number;
  city: string;
  postalCode: string;
};

export type Appointment = {
  id: string;
  helperId: string;
  helperName: string;
  date: string; // ISO
  startTime: string;
  durationHours: number;
  bookingType: "once" | "weekly" | "package";
  weeklyDays?: string[];
  packageMonths?: number;
  pricePerHour: number;
  totalAmount: number;
  serviceFee: number;
  status: "upcoming" | "completed" | "confirmed" | "cancelled";
  paymentStatus:
    | "unpaid"
    | "paid"
    | "held_in_escrow"
    | "completed_by_helper"
    | "confirmed_by_family"
    | "released_to_helper"
    | "disputed"
    | "refunded";
  notes?: string;
  address?: string;
  clientName?: string;
  clientRole?: "user" | "family";
  clientPhoto?: string;
  clientPhone?: string;
  careRecipientName?: string;
  careLevel?: string;
  supportNeeds?: string[];
  matchId?: string;
  jobId?: string;
  serviceType?: string;
};

export type Message = {
  id: string;
  matchId: string;
  senderId: string; // "me" or helper id
  content: string;
  type:
    | "text"
    | "image"
    | "voice"
    | "system"
    | "booking_request"
    | "booking_accepted"
    | "booking_declined"
    | "booking_countered";
  createdAt: string;
};

export type Match = {
  id: string;
  helperId: string;
  compatibilityScore: number; // 0..100
  reasons: string[];
  createdAt: string;
};

export type Job = {
  id: string;
  title: string;
  postedBy: "family" | "user";
  postedByName: string;
  postedByPhoto?: string;
  description: string;
  requirements: string[];
  supportNeeds: string[];
  date: string;
  time: string;
  durationHours: number;
  pricePerHour: number;
  address: string;
  city: string;
  postalCode: string;
  distanceKm: number;
  // Fake map coords as % offsets relative to a viewer-centered map (0..100).
  mapX: number;
  mapY: number;
  // Real geo coordinates (used by Leaflet map). Optional for legacy mock rows.
  latitude?: number;
  longitude?: number;
  createdAt: string;
};

export type JobApplication = {
  id: string;
  jobId: string;
  helperId: string;
  helperName: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

const photo = (seed: string) =>
  `https://i.pravatar.cc/240?u=${encodeURIComponent(seed)}`;

export const MOCK_HELPERS: Helper[] = [
  {
    id: "h1",
    name: "Sarah Öztürk",
    age: 28,
    photo: photo("sarah-oeztuerk"),
    bio: "Ich bin ausgebildete Betreuungsassistentin und arbeite mit viel Herz und Geduld. Besonders gerne unterstütze ich bei Alltagsaktivitäten und Gesellschaft.",
    motivation: "Ich möchte Menschen im Alltag ein Lächeln schenken und ihre Selbstständigkeit erhalten.",
    qualifications: ["Betreuungsassistent/in §43b", "Erste Hilfe Kurs", "Erfahrung in Seniorenbegleitung"],
    interests: ["Kochen & Backen", "Musik", "Spaziergänge", "Gesellschaftsspiele"],
    languages: ["Deutsch", "Türkisch", "Englisch"],
    pricePerHour: 28,
    distanceKm: 2,
    rating: 4.9,
    verified: true,
    city: "Essen",
    postalCode: "45127",
    experienceYears: 6,
    hasDriverLicense: true,
    hasCar: true,
    smoking: "nein",
    petsAtHome: false,
    workingDays: ["Mo", "Di", "Mi", "Do", "Fr"],
    workingHours: "08:00 – 18:00",
    offers: ["Einkaufen", "Kochen", "Gesellschaft leisten", "Begleitung zu Terminen", "Spiele / Lesen / Musik"],
    badges: ["Verifiziert", "Herzlich", "Zuverlässig"],
    homeCountry: "Deutschland",
    gender: "Frau",
    verificationStatus: "verified",
  },
  {
    id: "h2",
    name: "Julia Hoffmann",
    age: 38,
    photo: photo("julia-hoffmann"),
    bio: "Ich bin Hauswirtschafterin und liebe es, älteren Menschen im Haushalt zu helfen. Gemeinsam kochen und backen macht mir viel Freude.",
    motivation: "Ich habe meine Großmutter lange begleitet und weiß, wie viel kleine Hilfen bewirken.",
    qualifications: ["Hauswirtschaft", "Betreuungsassistent/in §43b"],
    interests: ["Kochen & Backen", "Haushalt & Putzen", "Basteln & Malen"],
    languages: ["Deutsch", "Polnisch"],
    pricePerHour: 24,
    distanceKm: 2,
    rating: 4.8,
    verified: true,
    city: "Essen",
    postalCode: "45130",
    experienceYears: 10,
    hasDriverLicense: true,
    hasCar: false,
    smoking: "nein",
    petsAtHome: true,
    workingDays: ["Mo", "Di", "Do", "Fr"],
    workingHours: "09:00 – 16:00",
    offers: ["Einkaufen", "Kochen", "Haushalt", "Wäsche", "Gesellschaft leisten"],
    badges: ["Verifiziert", "Alltagshilfe", "Zuverlässig"],
    homeCountry: "Deutschland",
    gender: "Frau",
    verificationStatus: "verified",
  },
  {
    id: "h3",
    name: "Michael Weber",
    age: 35,
    photo: photo("michael-weber"),
    bio: "Ich bin IT-Techniker und helfe gerne älteren Menschen mit Smartphone, Tablet und Fernseher. Auch für Spaziergänge und Gespräche habe ich viel Zeit.",
    motivation: "Digitale Teilhabe im Alter liegt mir am Herzen.",
    qualifications: ["Erste Hilfe Kurs", "Erfahrung in Seniorenbegleitung"],
    interests: ["Technik-Hilfe", "Spaziergänge", "Gespräche führen", "Fotografie"],
    languages: ["Deutsch", "Englisch"],
    pricePerHour: 25,
    distanceKm: 3,
    rating: 4.7,
    verified: true,
    city: "Essen",
    postalCode: "45141",
    experienceYears: 3,
    hasDriverLicense: true,
    hasCar: true,
    smoking: "nein",
    petsAtHome: false,
    workingDays: ["Mo", "Mi", "Fr", "Sa"],
    workingHours: "10:00 – 20:00",
    offers: ["Technik-Hilfe", "Spaziergänge", "Begleitung zu Terminen", "Gesellschaft leisten"],
    badges: ["Verifiziert", "Technikfit"],
    homeCountry: "Deutschland",
    gender: "Herr",
    verificationStatus: "verified",
  },
  {
    id: "h4",
    name: "Lisa Bergmann",
    age: 22,
    photo: photo("lisa-bergmann"),
    bio: "Ich studiere Soziale Arbeit und begleite gerne ältere Menschen im Alltag. Ich habe viel Zeit für Spaziergänge, Vorlesen und Gesellschaftsspiele.",
    motivation: "Ich lerne aus jedem Gespräch mit einem älteren Menschen etwas fürs Leben.",
    qualifications: ["Keine formale Ausbildung", "Erste Hilfe Kurs"],
    interests: ["Vorlesen", "Spaziergänge", "Gesellschaftsspiele", "Musik"],
    languages: ["Deutsch", "Englisch", "Spanisch"],
    pricePerHour: 16,
    distanceKm: 4,
    rating: 4.6,
    verified: false,
    city: "Essen",
    postalCode: "45144",
    experienceYears: 1,
    hasDriverLicense: false,
    hasCar: false,
    smoking: "nein",
    petsAtHome: false,
    workingDays: ["Di", "Do", "Sa", "So"],
    workingHours: "14:00 – 20:00",
    offers: ["Gesellschaft leisten", "Spiele / Lesen / Musik", "Spaziergänge"],
    badges: ["Neu", "Herzlich"],
    gender: "Frau",
    verificationStatus: "pending",
  },
  {
    id: "h5",
    name: "Petra Sommer",
    age: 58,
    photo: photo("petra-sommer"),
    bio: "Ich habe drei Kinder großgezogen und viele Jahre meine Eltern begleitet. Haushalt, Kochen und Gesellschaft sind meine Stärken.",
    motivation: "Ich möchte mit meiner Lebenserfahrung anderen Familien den Alltag erleichtern.",
    qualifications: ["Hauswirtschaft", "Erfahrung in Seniorenbegleitung"],
    interests: ["Haushalt & Putzen", "Kochen & Backen", "Gespräche führen", "Gartenarbeit"],
    languages: ["Deutsch"],
    pricePerHour: 20,
    distanceKm: 5,
    rating: 4.9,
    verified: true,
    city: "Essen",
    postalCode: "45276",
    experienceYears: 15,
    hasDriverLicense: true,
    hasCar: true,
    smoking: "nein",
    petsAtHome: true,
    workingDays: ["Mo", "Di", "Mi", "Do"],
    workingHours: "08:00 – 15:00",
    offers: ["Einkaufen", "Kochen", "Haushalt", "Wäsche", "Gesellschaft leisten", "Haustierbetreuung"],
    badges: ["Verifiziert", "Zuverlässig", "Alltagshilfe"],
    gender: "Frau",
    verificationStatus: "verified",
  },
  {
    id: "h6",
    name: "Kevin Hartmann",
    age: 21,
    photo: photo("kevin-hartmann"),
    bio: "Student im 4. Semester. Ich helfe gerne bei Smartphone, Tablet und kleinen Erledigungen im Haushalt.",
    motivation: "Ich möchte nebenbei sinnvoll Geld verdienen und Menschen wirklich helfen.",
    qualifications: ["Keine formale Ausbildung"],
    interests: ["Technik-Hilfe", "Einkaufen", "Spaziergänge", "Brettspiele & Kartenspiele"],
    languages: ["Deutsch", "Englisch"],
    pricePerHour: 16,
    distanceKm: 6,
    rating: 4.5,
    verified: false,
    city: "Essen",
    postalCode: "45356",
    experienceYears: 0,
    hasDriverLicense: true,
    hasCar: false,
    smoking: "nein",
    petsAtHome: false,
    workingDays: ["Mi", "Do", "Fr", "Sa"],
    workingHours: "15:00 – 21:00",
    offers: ["Technik-Hilfe", "Einkaufen", "Spaziergänge", "Gesellschaft leisten"],
    badges: ["Neu", "Technikfit"],
    gender: "Herr",
    verificationStatus: "pending",
  },
  {
    id: "h7",
    name: "Anna Kowalski",
    age: 42,
    photo: photo("anna-kowalski"),
    bio: "Ich arbeite seit vielen Jahren in der Alltagsbegleitung und mag Menschen einfach.",
    motivation: "Zuhören ist meine liebste Beschäftigung.",
    qualifications: ["Alltagsbegleiter/in", "Erste Hilfe Kurs"],
    interests: ["Gespräche führen", "Musik", "Spaziergänge", "Kochen & Backen"],
    languages: ["Deutsch", "Polnisch", "Russisch"],
    pricePerHour: 22,
    distanceKm: 3,
    rating: 4.8,
    verified: true,
    city: "Essen",
    postalCode: "45134",
    experienceYears: 12,
    hasDriverLicense: true,
    hasCar: true,
    smoking: "nein",
    petsAtHome: false,
    workingDays: ["Mo", "Di", "Do", "Fr", "Sa"],
    workingHours: "09:00 – 17:00",
    offers: ["Gesellschaft leisten", "Spaziergänge", "Kochen", "Begleitung zu Terminen"],
    badges: ["Verifiziert", "Herzlich", "Alltagshilfe"],
    gender: "Frau",
    verificationStatus: "verified",
    latitude: 51.4470, longitude: 7.0180,
  },
  {
    id: "h8", name: "Fatima Al-Nasser", age: 34, photo: photo("fatima-alnasser"),
    bio: "Ich habe lange in der ambulanten Betreuung gearbeitet und liebe kulturell offene Familien.",
    motivation: "Sprache und Nähe machen den Alltag leichter – dabei möchte ich helfen.",
    qualifications: ["Betreuungsassistent/in §43b / §53c SGB XI", "Erste Hilfe Kurs"],
    interests: ["Kochen & Backen", "Gespräche führen", "Spaziergänge"],
    languages: ["Deutsch", "Arabisch", "Englisch"],
    pricePerHour: 26, distanceKm: 3.5, rating: 4.9, verified: true,
    city: "Essen", postalCode: "45219",
    experienceYears: 8, hasDriverLicense: true, hasCar: false,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Mo","Di","Mi","Do"], workingHours: "08:00 – 15:00",
    offers: ["Kochen", "Einkaufen", "Gesellschaft leisten", "Begleitung zu Terminen"],
    badges: ["Verifiziert", "Mehrsprachig", "Herzlich"],
    homeCountry: "Syrien", gender: "Frau", verificationStatus: "verified",
    latitude: 51.4088, longitude: 6.9430,
  },
  {
    id: "h9", name: "Tobias Meier", age: 45, photo: photo("tobias-meier"),
    bio: "Gelernter Krankenpflegehelfer, sehr geduldig mit älteren Herren, gerne Werkstatt und Handwerk.",
    motivation: "Ich möchte für Familien der zuverlässige Mann sein, der auch mit anpackt.",
    qualifications: ["Pflegefachhelfer", "Erste Hilfe Kurs", "Erfahrung in Seniorenbegleitung"],
    interests: ["Handwerkliche Tätigkeiten", "Spaziergänge", "Gespräche führen"],
    languages: ["Deutsch"],
    pricePerHour: 27, distanceKm: 7.2, rating: 4.7, verified: true,
    city: "Bochum", postalCode: "44787",
    experienceYears: 14, hasDriverLicense: true, hasCar: true,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Mo","Di","Do","Fr","Sa"], workingHours: "07:00 – 15:00",
    offers: ["Begleitung zu Terminen", "Einkaufen", "Handwerkliche Tätigkeiten", "Gesellschaft leisten"],
    badges: ["Verifiziert", "Fahrdienst", "Handwerklich"],
    homeCountry: "Deutschland", gender: "Herr", verificationStatus: "verified",
    latitude: 51.4818, longitude: 7.2162,
  },
  {
    id: "h10", name: "Nguyễn Thi Mai", age: 29, photo: photo("nguyen-thi-mai"),
    bio: "Studentin der Sozialen Arbeit, ich koche gerne asiatisch und lese vor.",
    motivation: "Zuhören und Vorlesen ist meine liebste Beschäftigung mit älteren Menschen.",
    qualifications: ["Keine formale Ausbildung", "Erste Hilfe Kurs"],
    interests: ["Vorlesen", "Kochen & Backen", "Gesellschaftsspiele"],
    languages: ["Deutsch", "Vietnamesisch", "Englisch"],
    pricePerHour: 17, distanceKm: 4.1, rating: 4.6, verified: false,
    city: "Essen", postalCode: "45326",
    experienceYears: 2, hasDriverLicense: false, hasCar: false,
    smoking: "nein", petsAtHome: true,
    workingDays: ["Di","Do","Fr","Sa","So"], workingHours: "14:00 – 20:00",
    offers: ["Vorlesen", "Kochen", "Gesellschaft leisten", "Spaziergänge"],
    badges: ["Neu", "Mehrsprachig"],
    homeCountry: "Vietnam", gender: "Frau", verificationStatus: "pending",
    latitude: 51.5225, longitude: 7.0180,
  },
  {
    id: "h11", name: "Ahmet Yılmaz", age: 51, photo: photo("ahmet-yilmaz"),
    bio: "Familienvater mit viel Lebenserfahrung, spreche fließend Türkisch und begleite gerne zu Behörden.",
    motivation: "Ich möchte gerade türkischsprachigen Familien den Alltag leichter machen.",
    qualifications: ["Alltagsbegleiter/in", "Erfahrung in Seniorenbegleitung"],
    interests: ["Gespräche führen", "Spaziergänge", "Begleitung zu Terminen"],
    languages: ["Deutsch", "Türkisch"],
    pricePerHour: 23, distanceKm: 5.8, rating: 4.8, verified: true,
    city: "Duisburg", postalCode: "47051",
    experienceYears: 11, hasDriverLicense: true, hasCar: true,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Mo","Di","Mi","Do","Fr"], workingHours: "09:00 – 16:00",
    offers: ["Begleitung zu Terminen", "Behördengänge", "Einkaufen", "Gesellschaft leisten"],
    badges: ["Verifiziert", "Mehrsprachig", "Zuverlässig"],
    homeCountry: "Türkei", gender: "Herr", verificationStatus: "verified",
    latitude: 51.4344, longitude: 6.7623,
  },
  {
    id: "h12", name: "Olena Kovalenko", age: 39, photo: photo("olena-kovalenko"),
    bio: "Ehemalige Erzieherin aus Kyjiw, ich liebe Musik, Handarbeit und ruhige Gespräche.",
    motivation: "Kreatives Miteinander im Alter ist mir sehr wichtig.",
    qualifications: ["Erzieher/in / Pädagog/in", "Erste Hilfe Kurs"],
    interests: ["Musik", "Basteln & Malen", "Vorlesen", "Gedächtnistraining"],
    languages: ["Deutsch", "Ukrainisch", "Russisch", "Englisch"],
    pricePerHour: 21, distanceKm: 4.8, rating: 4.9, verified: true,
    city: "Essen", postalCode: "45355",
    experienceYears: 9, hasDriverLicense: true, hasCar: false,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Mo","Mi","Do","Sa"], workingHours: "10:00 – 17:00",
    offers: ["Gedächtnistraining", "Basteln", "Musik", "Gesellschaft leisten", "Vorlesen"],
    badges: ["Verifiziert", "Herzlich", "Kreativ"],
    homeCountry: "Ukraine", gender: "Frau", verificationStatus: "verified",
    latitude: 51.4952, longitude: 6.9530,
  },
  {
    id: "h13", name: "Marco Rossi", age: 26, photo: photo("marco-rossi"),
    bio: "Sport- und Bewegungswissenschaftler in Ausbildung, spezialisiert auf Sturzprävention.",
    motivation: "Bewegung erhält Selbstständigkeit im Alter – das ist meine Mission.",
    qualifications: ["Keine formale Ausbildung", "Erste Hilfe Kurs"],
    interests: ["Bewegung & Gymnastik", "Spaziergänge", "Stadtbummel & Ausflüge"],
    languages: ["Deutsch", "Italienisch", "Englisch"],
    pricePerHour: 24, distanceKm: 6.4, rating: 4.7, verified: true,
    city: "Mülheim an der Ruhr", postalCode: "45468",
    experienceYears: 3, hasDriverLicense: true, hasCar: true,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Mo","Di","Mi","Do","Fr"], workingHours: "07:00 – 13:00",
    offers: ["Bewegungsübungen ohne medizinischen Hintergrund", "Spaziergänge", "Begleitung zu Terminen"],
    badges: ["Verifiziert", "Sportlich"],
    homeCountry: "Italien", gender: "Herr", verificationStatus: "verified",
    latitude: 51.4318, longitude: 6.8807,
  },
  {
    id: "h14", name: "Grace Owusu", age: 31, photo: photo("grace-owusu"),
    bio: "Krankenschwester aus Ghana, jetzt in Alltagsbegleitung. Sanft, humorvoll, mehrsprachig.",
    motivation: "Ich möchte Menschen Würde und Freude im Alltag schenken.",
    qualifications: ["Pflegefachhelfer", "Erste Hilfe Kurs", "Erfahrung in Seniorenbegleitung"],
    interests: ["Musik", "Gespräche führen", "Spaziergänge"],
    languages: ["Deutsch", "Englisch", "Französisch"],
    pricePerHour: 29, distanceKm: 8.9, rating: 5.0, verified: true,
    city: "Oberhausen", postalCode: "46045",
    experienceYears: 7, hasDriverLicense: true, hasCar: false,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Di","Mi","Do","Fr"], workingHours: "08:00 – 17:00",
    offers: ["Gesellschaft leisten", "Begleitung zu Terminen", "Musik", "Vorlesen"],
    badges: ["Verifiziert", "Herzlich", "Mehrsprachig"],
    homeCountry: "Ghana", gender: "Frau", verificationStatus: "verified",
    latitude: 51.4964, longitude: 6.8628,
  },
  {
    id: "h15", name: "Reza Ahmadi", age: 47, photo: photo("reza-ahmadi"),
    bio: "Ich habe meine Eltern viele Jahre begleitet und mag ruhige Menschen mit Geschichten.",
    motivation: "Zeit schenken ist das schönste Geschenk.",
    qualifications: ["Alltagsbegleiter/in"],
    interests: ["Gespräche führen", "Spaziergänge", "Brettspiele & Kartenspiele"],
    languages: ["Deutsch", "Farsi", "Englisch"],
    pricePerHour: 22, distanceKm: 6.1, rating: 4.6, verified: false,
    city: "Essen", postalCode: "45276",
    experienceYears: 5, hasDriverLicense: true, hasCar: true,
    smoking: "gelegentlich", petsAtHome: true,
    workingDays: ["Mo","Di","Fr","Sa","So"], workingHours: "12:00 – 20:00",
    offers: ["Gesellschaft leisten", "Spaziergänge", "Fahrdienst", "Einkaufen"],
    badges: ["Neu", "Fahrdienst"],
    homeCountry: "Iran", gender: "Herr", verificationStatus: "pending",
    latitude: 51.4272, longitude: 7.0716,
  },
  {
    id: "h16", name: "Sofía García", age: 33, photo: photo("sofia-garcia"),
    bio: "Musiktherapeutische Ausbildung, spiele Gitarre und singe gerne mit Senior:innen.",
    motivation: "Musik weckt Erinnerungen – das erlebe ich immer wieder.",
    qualifications: ["Sozialbetreuung", "Erste Hilfe Kurs"],
    interests: ["Musik", "Basteln & Malen", "Gedächtnistraining"],
    languages: ["Deutsch", "Spanisch", "Englisch"],
    pricePerHour: 28, distanceKm: 11.2, rating: 4.9, verified: true,
    city: "Düsseldorf", postalCode: "40219",
    experienceYears: 6, hasDriverLicense: true, hasCar: false,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Mi","Do","Fr","Sa"], workingHours: "10:00 – 18:00",
    offers: ["Musik", "Gedächtnistraining", "Vorlesen", "Gesellschaft leisten"],
    badges: ["Verifiziert", "Kreativ", "Herzlich"],
    homeCountry: "Spanien", gender: "Frau", verificationStatus: "verified",
    latitude: 51.2277, longitude: 6.7735,
  },
  {
    id: "h17", name: "Aleksandra Nowak", age: 55, photo: photo("aleksandra-nowak"),
    bio: "Hauswirtschafterin mit 20 Jahren Erfahrung. Meine Küche ist immer voller Düfte.",
    motivation: "Ein warmes Zuhause ist die halbe Miete.",
    qualifications: ["Hauswirtschaft", "Erfahrung in Seniorenbegleitung"],
    interests: ["Haushalt & Putzen", "Kochen & Backen", "Wäsche waschen & bügeln"],
    languages: ["Deutsch", "Polnisch"],
    pricePerHour: 20, distanceKm: 2.9, rating: 4.8, verified: true,
    city: "Essen", postalCode: "45143",
    experienceYears: 20, hasDriverLicense: false, hasCar: false,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Mo","Di","Mi","Do","Fr"], workingHours: "08:00 – 14:00",
    offers: ["Haushalt", "Kochen", "Wäsche", "Einkaufen"],
    badges: ["Verifiziert", "Alltagshilfe", "Zuverlässig"],
    homeCountry: "Polen", gender: "Frau", verificationStatus: "verified",
    latitude: 51.4638, longitude: 6.9760,
  },
  {
    id: "h18", name: "Jean-Pierre Dubois", age: 62, photo: photo("jean-pierre-dubois"),
    bio: "Pensionierter Lehrer aus Straßburg. Ich lese vor, bespreche Zeitungen und spiele Schach.",
    motivation: "Geistige Frische ist ein wunderbares Gut.",
    qualifications: ["Erzieher/in / Pädagog/in"],
    interests: ["Vorlesen", "Zeitungslektüre", "Brettspiele & Kartenspiele", "Gespräche führen"],
    languages: ["Deutsch", "Französisch", "Englisch"],
    pricePerHour: 25, distanceKm: 9.4, rating: 4.9, verified: true,
    city: "Düsseldorf", postalCode: "40213",
    experienceYears: 4, hasDriverLicense: true, hasCar: true,
    smoking: "nein", petsAtHome: true,
    workingDays: ["Mo","Mi","Fr"], workingHours: "09:00 – 13:00",
    offers: ["Vorlesen", "Gesellschaft leisten", "Gedächtnistraining", "Spaziergänge"],
    badges: ["Verifiziert", "Bildungserfahren"],
    homeCountry: "Frankreich", gender: "Herr", verificationStatus: "verified",
    latitude: 51.2254, longitude: 6.7763,
  },
  {
    id: "h19", name: "Chiara Bianchi", age: 24, photo: photo("chiara-bianchi"),
    bio: "Medizinstudentin, sehr geduldig, gerne Kartenspiele und Backen.",
    motivation: "Im Studium fehlt mir echte Zeit mit Menschen – das gibt sie mir zurück.",
    qualifications: ["Keine formale Ausbildung", "Erste Hilfe Kurs"],
    interests: ["Kochen & Backen", "Brettspiele & Kartenspiele", "Gespräche führen"],
    languages: ["Deutsch", "Italienisch", "Englisch"],
    pricePerHour: 18, distanceKm: 3.7, rating: 4.5, verified: false,
    city: "Essen", postalCode: "45147",
    experienceYears: 1, hasDriverLicense: true, hasCar: false,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Sa","So"], workingHours: "10:00 – 18:00",
    offers: ["Gesellschaft leisten", "Kochen", "Vorlesen", "Spiele / Lesen / Musik"],
    badges: ["Neu", "Wochenende"],
    homeCountry: "Italien", gender: "Frau", verificationStatus: "pending",
    latitude: 51.4370, longitude: 6.9600,
  },
  {
    id: "h20", name: "David Baumann", age: 40, photo: photo("david-baumann"),
    bio: "Ich bin gelernter Bürokaufmann und helfe gerne bei Anträgen, Post und Behördengängen.",
    motivation: "Papierkram nimmt vielen Menschen die Ruhe – ich mag das Ordnen.",
    qualifications: ["Keine formale Ausbildung", "Erste Hilfe Kurs"],
    interests: ["Gespräche führen", "Technik-Hilfe", "Zeitungslektüre"],
    languages: ["Deutsch", "Englisch"],
    pricePerHour: 26, distanceKm: 4.5, rating: 4.7, verified: true,
    city: "Essen", postalCode: "45134",
    experienceYears: 6, hasDriverLicense: true, hasCar: true,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Mo","Di","Mi","Do"], workingHours: "09:00 – 17:00",
    offers: ["Hilfe bei Briefen", "Hilfe bei Anträgen", "Behördengänge", "Technik-Hilfe"],
    badges: ["Verifiziert", "Organisiert"],
    homeCountry: "Deutschland", gender: "Herr", verificationStatus: "verified",
    latitude: 51.4525, longitude: 7.0464,
  },
  {
    id: "h21", name: "Aylin Kaya", age: 19, photo: photo("aylin-kaya"),
    bio: "Auszubildende in der Altenpflege im 1. Lehrjahr, sehr freundlich und lernbereit.",
    motivation: "Ich möchte praktische Erfahrung sammeln und wirklich helfen.",
    qualifications: ["Keine formale Ausbildung"],
    interests: ["Gespräche führen", "Spaziergänge", "Musik"],
    languages: ["Deutsch", "Türkisch"],
    pricePerHour: 14, distanceKm: 1.8, rating: 4.4, verified: false,
    city: "Essen", postalCode: "45141",
    experienceYears: 0, hasDriverLicense: false, hasCar: false,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Mi","Fr","Sa","So"], workingHours: "13:00 – 19:00",
    offers: ["Gesellschaft leisten", "Spaziergänge", "Vorlesen"],
    badges: ["Neu", "Mehrsprachig"],
    homeCountry: "Deutschland", gender: "Frau", verificationStatus: "pending",
    latitude: 51.4738, longitude: 7.0180,
  },
  {
    id: "h22", name: "Ricardo Ferreira", age: 36, photo: photo("ricardo-ferreira"),
    bio: "Fahrdienst-Profi mit rollstuhlgerechtem Auto. Freundlich und pünktlich.",
    motivation: "Mobil sein bedeutet Freiheit – dafür sorge ich.",
    qualifications: ["Erste Hilfe Kurs", "Erfahrung in Seniorenbegleitung"],
    interests: ["Spaziergänge", "Stadtbummel & Ausflüge", "Gespräche führen"],
    languages: ["Deutsch", "Portugiesisch", "Spanisch"],
    pricePerHour: 30, distanceKm: 12.6, rating: 4.8, verified: true,
    city: "Wuppertal", postalCode: "42103",
    experienceYears: 8, hasDriverLicense: true, hasCar: true,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Mo","Di","Mi","Do","Fr"], workingHours: "07:30 – 17:30",
    offers: ["Fahrdienst", "Begleitung zu Terminen", "Rollstuhl-Ausflüge", "Einkaufen"],
    badges: ["Verifiziert", "Fahrdienst", "Barrierefrei"],
    homeCountry: "Portugal", gender: "Herr", verificationStatus: "verified",
    latitude: 51.2562, longitude: 7.1508,
  },
  {
    id: "h23", name: "Hannah Schulz", age: 28, photo: photo("hannah-schulz"),
    bio: "Physiotherapie-Studentin, ruhig, geduldig, mit Erfahrung in Demenzbegleitung.",
    motivation: "Demenz braucht Ruhe und Struktur – das kann ich geben.",
    qualifications: ["Sozialassistent/in", "Erste Hilfe Kurs", "Erfahrung in Seniorenbegleitung"],
    interests: ["Bewegung & Gymnastik", "Gedächtnistraining", "Vorlesen"],
    languages: ["Deutsch", "Englisch"],
    pricePerHour: 25, distanceKm: 4.9, rating: 4.9, verified: true,
    city: "Essen", postalCode: "45329",
    experienceYears: 4, hasDriverLicense: true, hasCar: false,
    smoking: "nein", petsAtHome: true,
    workingDays: ["Mo","Di","Do","Fr"], workingHours: "09:00 – 15:00",
    offers: ["Gedächtnistraining", "Bewegungsübungen ohne medizinischen Hintergrund", "Gesellschaft leisten"],
    badges: ["Verifiziert", "Demenz-Erfahrung"],
    homeCountry: "Deutschland", gender: "Frau", verificationStatus: "verified",
    latitude: 51.5385, longitude: 6.9970,
  },
  {
    id: "h24", name: "Karolina Wiśniewska", age: 42, photo: photo("karolina-wisniewska"),
    bio: "Zweifache Mutter, kocht polnisch, deutsch und italienisch. Lebhaft und warmherzig.",
    motivation: "Essen verbindet Generationen.",
    qualifications: ["Hauswirtschaft"],
    interests: ["Kochen & Backen", "Haushalt & Putzen", "Gesellschaft leisten"],
    languages: ["Deutsch", "Polnisch", "Italienisch"],
    pricePerHour: 21, distanceKm: 5.5, rating: 4.7, verified: true,
    city: "Gelsenkirchen", postalCode: "45879",
    experienceYears: 12, hasDriverLicense: true, hasCar: true,
    smoking: "nein", petsAtHome: true,
    workingDays: ["Mo","Di","Mi","Do","Fr","Sa"], workingHours: "08:00 – 15:00",
    offers: ["Kochen", "Haushalt", "Einkaufen", "Gesellschaft leisten", "Haustierbetreuung"],
    badges: ["Verifiziert", "Alltagshilfe"],
    homeCountry: "Polen", gender: "Frau", verificationStatus: "verified",
    latitude: 51.5177, longitude: 7.0857,
  },
  {
    id: "h25", name: "Serkan Demir", age: 30, photo: photo("serkan-demir"),
    bio: "Sozialarbeiter, spezialisiert auf Menschen mit Migrationsgeschichte und Behörden-Kram.",
    motivation: "Ich möchte Familien dolmetschen, begleiten und stärken.",
    qualifications: ["Sozialbetreuung", "Erste Hilfe Kurs"],
    interests: ["Gespräche führen", "Begleitung zu Terminen", "Vorlesen"],
    languages: ["Deutsch", "Türkisch", "Kurdisch", "Englisch"],
    pricePerHour: 27, distanceKm: 6.7, rating: 4.9, verified: true,
    city: "Duisburg", postalCode: "47166",
    experienceYears: 5, hasDriverLicense: true, hasCar: true,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Mo","Di","Mi","Do"], workingHours: "09:00 – 18:00",
    offers: ["Behördengänge", "Begleitung zu Terminen", "Hilfe bei Anträgen", "Gesellschaft leisten"],
    badges: ["Verifiziert", "Mehrsprachig", "Dolmetschend"],
    homeCountry: "Türkei", gender: "Herr", verificationStatus: "verified",
    latitude: 51.4844, longitude: 6.7920,
  },
  {
    id: "h26", name: "Beatrix Winter", age: 68, photo: photo("beatrix-winter"),
    bio: "Rentnerin, ehemalige Kinderkrankenschwester, sehr fürsorglich, mag Handarbeit.",
    motivation: "Ich habe Zeit – und die möchte ich sinnvoll verbringen.",
    qualifications: ["Pflegefachhelfer", "Erfahrung in Seniorenbegleitung"],
    interests: ["Basteln & Malen", "Vorlesen", "Kochen & Backen", "Gartenarbeit"],
    languages: ["Deutsch"],
    pricePerHour: 19, distanceKm: 2.4, rating: 4.9, verified: true,
    city: "Essen", postalCode: "45259",
    experienceYears: 30, hasDriverLicense: true, hasCar: false,
    smoking: "nein", petsAtHome: true,
    workingDays: ["Di","Mi","Do","Fr"], workingHours: "10:00 – 16:00",
    offers: ["Gesellschaft leisten", "Basteln", "Vorlesen", "Gartenarbeit", "Kochen"],
    badges: ["Verifiziert", "Herzlich", "Erfahren"],
    homeCountry: "Deutschland", gender: "Frau", verificationStatus: "verified",
    latitude: 51.4181, longitude: 7.0895,
  },
  {
    id: "h27", name: "Alex Berger", age: 35, photo: photo("alex-berger"),
    bio: "Divers, non-binär. Ich mache Nachtwache-Vertretung und Wochenend-Entlastung für pflegende Angehörige.",
    motivation: "Angehörige brauchen auch Pause – dafür bin ich da.",
    qualifications: ["Alltagsbegleiter/in", "Erste Hilfe Kurs", "Erfahrung in Seniorenbegleitung"],
    interests: ["Gespräche führen", "Fernsehen", "Vorlesen"],
    languages: ["Deutsch", "Englisch", "Gebärdensprache DGS"],
    pricePerHour: 34, distanceKm: 3.3, rating: 4.8, verified: true,
    city: "Essen", postalCode: "45128",
    experienceYears: 7, hasDriverLicense: true, hasCar: true,
    smoking: "nein", petsAtHome: false,
    workingDays: ["Fr","Sa","So"], workingHours: "18:00 – 08:00",
    offers: ["Nachtwache-Vertretung", "Wochenend-Entlastung", "Gesellschaft leisten", "Beaufsichtigung in Abwesenheit"],
    badges: ["Verifiziert", "Nachtwache", "Inklusiv"],
    homeCountry: "Deutschland", gender: "Divers", verificationStatus: "verified",
    latitude: 51.4460, longitude: 7.0025,
  },
];

export const MOCK_JOBS: Job[] = [
  {
    id: "j1",
    title: "Begleitung zum Arzt & anschließend Apotheke",
    postedBy: "family",
    postedByName: "Familie Krüger",
    postedByPhoto: photo("familie-krueger"),
    description: "Wir suchen jemanden, der meinen Vater (78) am Donnerstag zum Kardiologen begleitet und danach mit ihm zur Apotheke geht. Er nutzt einen Rollator.",
    requirements: ["Führerschein von Vorteil", "Erfahrung mit Senior:innen", "Geduld & Freundlichkeit"],
    supportNeeds: ["Begleitung zu Arztterminen", "Einkaufen"],
    date: "2026-07-16",
    time: "09:30",
    durationHours: 3,
    pricePerHour: 24,
    address: "Rüttenscheider Str. 128",
    city: "Essen",
    postalCode: "45130",
    distanceKm: 1.4,
    mapX: 42, mapY: 38,
    createdAt: new Date().toISOString(),
  },
  {
    id: "j2",
    title: "Wöchentliche Gesellschaft & Spaziergang",
    postedBy: "user",
    postedByName: "Hilde Bauer",
    postedByPhoto: photo("hilde-bauer"),
    description: "Ich wohne allein und würde mich über regelmäßigen Besuch freuen. Wir könnten spazieren gehen, Karten spielen oder einfach reden. Zwei Stunden pro Woche.",
    requirements: ["Empathisch", "Nichtraucher:in"],
    supportNeeds: ["Gesellschaft leisten", "Spaziergänge", "Spiele / Lesen / Musik"],
    date: "2026-07-14",
    time: "15:00",
    durationHours: 2,
    pricePerHour: 20,
    address: "Kettwiger Str. 12",
    city: "Essen",
    postalCode: "45127",
    distanceKm: 0.6,
    mapX: 55, mapY: 52,
    createdAt: new Date().toISOString(),
  },
  {
    id: "j3",
    title: "Hilfe beim Wochenendeinkauf",
    postedBy: "family",
    postedByName: "Familie Schneider",
    postedByPhoto: photo("familie-schneider"),
    description: "Meine Mutter kann nicht mehr selbst schwere Einkäufe tragen. Wir suchen Unterstützung jeden Samstag ca. 1,5 Stunden.",
    requirements: ["Zuverlässig", "Körperlich fit"],
    supportNeeds: ["Einkaufen"],
    date: "2026-07-11",
    time: "10:00",
    durationHours: 1.5,
    pricePerHour: 22,
    address: "Steeler Str. 214",
    city: "Essen",
    postalCode: "45138",
    distanceKm: 2.1,
    mapX: 68, mapY: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: "j4",
    title: "Technik-Hilfe: Smartphone & TV einrichten",
    postedBy: "user",
    postedByName: "Klaus Petersen",
    postedByPhoto: photo("klaus-petersen"),
    description: "Ich habe ein neues Smartphone bekommen und weiß nicht, wie WhatsApp und die Video-Anrufe funktionieren. Auch der Fernseher hängt. Ein Termin, ca. 2 Std.",
    requirements: ["Technikaffin", "Geduldig erklären können"],
    supportNeeds: ["Technik-Hilfe"],
    date: "2026-07-12",
    time: "14:00",
    durationHours: 2,
    pricePerHour: 25,
    address: "Frohnhauser Str. 44",
    city: "Essen",
    postalCode: "45144",
    distanceKm: 3.2,
    mapX: 25, mapY: 60,
    createdAt: new Date().toISOString(),
  },
  {
    id: "j5",
    title: "Kochen & leichter Haushalt",
    postedBy: "family",
    postedByName: "Familie Wagner",
    postedByPhoto: photo("familie-wagner"),
    description: "Wir suchen dreimal pro Woche jemanden, der mit meiner Schwiegermutter kocht und beim Aufräumen hilft. Sie freut sich über Gesellschaft dabei.",
    requirements: ["Hauswirtschaftliche Erfahrung", "Nichtraucher:in", "Deutsch fließend"],
    supportNeeds: ["Kochen", "Haushalt", "Gesellschaft leisten"],
    date: "2026-07-13",
    time: "11:30",
    durationHours: 2.5,
    pricePerHour: 23,
    address: "Alfredstr. 89",
    city: "Essen",
    postalCode: "45131",
    distanceKm: 2.8,
    mapX: 50, mapY: 72,
    createdAt: new Date().toISOString(),
  },
  { id: "j6", title: "Demenzbegleitung – ruhige Nachmittage", postedBy: "family", postedByName: "Familie Özdemir", postedByPhoto: photo("familie-oezdemir"),
    description: "Meine Mutter (82) hat beginnende Demenz. Wir suchen jemanden für ruhige Nachmittage – Musik hören, Fotos anschauen, Tee trinken.",
    requirements: ["Erfahrung mit Demenz", "Ruhige Art", "Türkisch von Vorteil"],
    supportNeeds: ["Gesellschaft leisten", "Gedächtnistraining"],
    date: "2026-07-18", time: "14:00", durationHours: 3, pricePerHour: 25,
    address: "Segerothstr. 100", city: "Essen", postalCode: "45141", distanceKm: 1.9,
    mapX: 30, mapY: 40, latitude: 51.4681, longitude: 7.0090, createdAt: new Date().toISOString() },
  { id: "j7", title: "Wöchentliches Vorlesen im Hospiz-Umfeld", postedBy: "family", postedByName: "Familie Braun", postedByPhoto: photo("familie-braun"),
    description: "Für meinen Vater in palliativer Situation suchen wir eine ruhige, warmherzige Person zum Vorlesen. Zwei Stunden pro Woche.",
    requirements: ["Sehr einfühlsam", "Erfahrung mit schwerkranken Menschen"],
    supportNeeds: ["Vorlesen", "Gesellschaft leisten"],
    date: "2026-07-15", time: "16:00", durationHours: 2, pricePerHour: 26,
    address: "Huyssenallee 22", city: "Essen", postalCode: "45128", distanceKm: 1.2,
    mapX: 45, mapY: 55, latitude: 51.4440, longitude: 7.0110, createdAt: new Date().toISOString() },
  { id: "j8", title: "Fahrten zur Physiotherapie 2× pro Woche", postedBy: "user", postedByName: "Ilse Wagner", postedByPhoto: photo("ilse-wagner"),
    description: "Ich brauche Hilfe, um dienstags und donnerstags zur Physio und zurück zu kommen. Rollator im Auto verstauen.",
    requirements: ["Führerschein", "Eigenes Auto", "Freundlich"],
    supportNeeds: ["Fahrdienst", "Begleitung zu Terminen"],
    date: "2026-07-21", time: "09:00", durationHours: 2, pricePerHour: 24,
    address: "Steeler Str. 300", city: "Essen", postalCode: "45138", distanceKm: 2.5,
    mapX: 62, mapY: 30, latitude: 51.4520, longitude: 7.0530, createdAt: new Date().toISOString() },
  { id: "j9", title: "Kinderbetreuung während Elternpflege", postedBy: "family", postedByName: "Familie Neumann", postedByPhoto: photo("familie-neumann"),
    description: "Ich pflege meine Mutter zuhause. Suche jemanden, der 2× pro Woche unsere zwei Kinder (6 und 9) für 3 Std. betreut, damit ich mich um Mama kümmern kann.",
    requirements: ["Erfahrung mit Kindern", "Zuverlässig", "Nichtraucher:in"],
    supportNeeds: ["Entlastung", "Kinderbetreuung"],
    date: "2026-07-17", time: "15:00", durationHours: 3, pricePerHour: 20,
    address: "Girardetstr. 8", city: "Essen", postalCode: "45131", distanceKm: 2.6,
    mapX: 50, mapY: 65, latitude: 51.4382, longitude: 6.9998, createdAt: new Date().toISOString() },
  { id: "j10", title: "Haustierbetreuung während Klinikaufenthalt", postedBy: "user", postedByName: "Werner Fischer", postedByPhoto: photo("werner-fischer"),
    description: "Ich muss für 5 Tage in die Klinik. Meine Katze braucht 2× täglich Futter und Gesellschaft. Wohnungsschlüssel wird übergeben.",
    requirements: ["Katzenerfahrung", "Vertrauenswürdig"],
    supportNeeds: ["Haustierbetreuung"],
    date: "2026-07-25", time: "08:00", durationHours: 1, pricePerHour: 18,
    address: "Wittenbergstr. 14", city: "Essen", postalCode: "45276", distanceKm: 4.8,
    mapX: 78, mapY: 55, latitude: 51.4272, longitude: 7.0716, createdAt: new Date().toISOString() },
  { id: "j11", title: "Gartenhilfe – Rasen mähen & Beete jäten", postedBy: "family", postedByName: "Familie Krause", postedByPhoto: photo("familie-krause"),
    description: "Für Oma (89) mit kleinem Garten. Rasen mähen, Beete jäten, Blumen gießen. Alle 14 Tage.",
    requirements: ["Körperlich fit", "Gartenerfahrung"],
    supportNeeds: ["Gartenarbeit"],
    date: "2026-07-20", time: "10:00", durationHours: 2.5, pricePerHour: 19,
    address: "Katernberger Str. 55", city: "Essen", postalCode: "45327", distanceKm: 5.4,
    mapX: 40, mapY: 22, latitude: 51.5152, longitude: 7.0410, createdAt: new Date().toISOString() },
  { id: "j12", title: "Vorbereitung Wohnungsauflösung – sortieren", postedBy: "family", postedByName: "Familie Lehmann", postedByPhoto: photo("familie-lehmann"),
    description: "Nach dem Umzug meiner Mutter ins Heim müssen Schränke sortiert werden. Suche jemanden mit Fingerspitzengefühl.",
    requirements: ["Diskret", "Sortiergeschickt"],
    supportNeeds: ["Haushalt", "Organisation"],
    date: "2026-07-19", time: "10:00", durationHours: 4, pricePerHour: 22,
    address: "Bochumer Str. 40", city: "Gelsenkirchen", postalCode: "45886", distanceKm: 9.8,
    mapX: 22, mapY: 15, latitude: 51.5177, longitude: 7.0857, createdAt: new Date().toISOString() },
  { id: "j13", title: "Behördengang Ausländeramt – arabisch sprechend", postedBy: "user", postedByName: "Aischa Haddad", postedByPhoto: photo("aischa-haddad"),
    description: "Ich brauche Begleitung zum Ausländeramt, jemand der Arabisch spricht und mir beim Ausfüllen der Formulare hilft.",
    requirements: ["Arabisch fließend", "Erfahrung mit Behörden"],
    supportNeeds: ["Behördengänge", "Hilfe bei Anträgen"],
    date: "2026-07-22", time: "09:30", durationHours: 3, pricePerHour: 26,
    address: "Rathenaustr. 1", city: "Essen", postalCode: "45127", distanceKm: 0.8,
    mapX: 55, mapY: 50, latitude: 51.4536, longitude: 7.0143, createdAt: new Date().toISOString() },
  { id: "j14", title: "Videoanruf mit den Enkelkindern einrichten", postedBy: "user", postedByName: "Hannelore Schmidt", postedByPhoto: photo("hannelore-schmidt"),
    description: "Meine Enkel wohnen in Australien. Ich möchte lernen, wie ich WhatsApp-Videoanrufe mache. Bitte in Ruhe erklären.",
    requirements: ["Sehr geduldig", "Technikaffin"],
    supportNeeds: ["Technik-Hilfe", "Smartphone-Hilfe"],
    date: "2026-07-14", time: "11:00", durationHours: 1.5, pricePerHour: 22,
    address: "Kettwiger Str. 44", city: "Essen", postalCode: "45127", distanceKm: 0.4,
    mapX: 58, mapY: 48, latitude: 51.4553, longitude: 7.0130, createdAt: new Date().toISOString() },
  { id: "j15", title: "Begleitung zur Moschee freitags", postedBy: "user", postedByName: "Mustafa Yıldız", postedByPhoto: photo("mustafa-yildiz"),
    description: "Jeden Freitag Begleitung zur Moschee (5 Min. Fußweg, mit Gehstock). Danach Rückweg. 1 Std. inkl. Warten.",
    requirements: ["Respektvoll", "Geduldig"],
    supportNeeds: ["Begleitung zu Terminen"],
    date: "2026-07-17", time: "13:00", durationHours: 1, pricePerHour: 18,
    address: "Altendorfer Str. 200", city: "Essen", postalCode: "45143", distanceKm: 3.1,
    mapX: 28, mapY: 42, latitude: 51.4614, longitude: 6.9840, createdAt: new Date().toISOString() },
  { id: "j16", title: "Wöchentliches polnisches Kochen", postedBy: "family", postedByName: "Familie Kowalski", postedByPhoto: photo("familie-kowalski"),
    description: "Meine Schwiegermutter freut sich über polnische Küche aus ihrer Heimat. Jeden Mittwoch 3 Std. gemeinsam kochen und essen.",
    requirements: ["Polnisch fließend", "Kocht polnische Klassiker"],
    supportNeeds: ["Kochen", "Gesellschaft leisten"],
    date: "2026-07-15", time: "11:00", durationHours: 3, pricePerHour: 22,
    address: "Rellinghauser Str. 76", city: "Essen", postalCode: "45128", distanceKm: 2.1,
    mapX: 48, mapY: 60, latitude: 51.4400, longitude: 7.0220, createdAt: new Date().toISOString() },
  { id: "j17", title: "Café-Ausflug samstags", postedBy: "family", postedByName: "Familie Richter", postedByPhoto: photo("familie-richter"),
    description: "Mein Vater liebt es, samstags im Café Kuchen zu essen und Menschen zu beobachten. Er nutzt Rollator, spricht viel.",
    requirements: ["Redselig", "Rollator-Erfahrung"],
    supportNeeds: ["Spaziergänge", "Gesellschaft leisten"],
    date: "2026-07-18", time: "15:00", durationHours: 2, pricePerHour: 20,
    address: "Werdener Str. 12", city: "Essen", postalCode: "45239", distanceKm: 5.2,
    mapX: 52, mapY: 80, latitude: 51.3856, longitude: 6.9948, createdAt: new Date().toISOString() },
  { id: "j18", title: "Rollstuhl-Spaziergang im Grugapark", postedBy: "family", postedByName: "Familie Berger", postedByPhoto: photo("familie-berger"),
    description: "1× pro Woche 2 Std. Spaziergang im Grugapark mit unserer Oma im Rollstuhl. Sie mag Vögel, Blumen und Eis.",
    requirements: ["Körperlich fit", "Freundlich"],
    supportNeeds: ["Spaziergänge", "Rollstuhl-Ausflüge"],
    date: "2026-07-16", time: "14:30", durationHours: 2, pricePerHour: 21,
    address: "Norbertstr. 2", city: "Essen", postalCode: "45131", distanceKm: 2.4,
    mapX: 45, mapY: 68, latitude: 51.4348, longitude: 7.0079, createdAt: new Date().toISOString() },
  { id: "j19", title: "Sturzprävention-Übungen zuhause", postedBy: "user", postedByName: "Elke Hartmann", postedByPhoto: photo("elke-hartmann"),
    description: "Ich möchte 2× pro Woche einfache Übungen machen, damit ich sicherer auf den Beinen bleibe. Kein Sportverein, bitte zuhause.",
    requirements: ["Erfahrung mit Bewegungsübungen", "Motivierend"],
    supportNeeds: ["Bewegungsübungen ohne medizinischen Hintergrund"],
    date: "2026-07-14", time: "10:00", durationHours: 1, pricePerHour: 24,
    address: "Frohnhauser Str. 200", city: "Essen", postalCode: "45144", distanceKm: 3.9,
    mapX: 20, mapY: 58, latitude: 51.4562, longitude: 6.9548, createdAt: new Date().toISOString() },
  { id: "j20", title: "Wochenend-Entlastung für pflegende Tochter", postedBy: "family", postedByName: "Familie Vogel", postedByPhoto: photo("familie-vogel"),
    description: "Ich pflege meine Mutter täglich. Suche für Samstag 6 Std. Entlastung, damit ich Zeit für mich habe.",
    requirements: ["Pflegeerfahrung wünschenswert", "Zuverlässig"],
    supportNeeds: ["Wochenend-Entlastung", "Beaufsichtigung in Abwesenheit"],
    date: "2026-07-18", time: "10:00", durationHours: 6, pricePerHour: 28,
    address: "Fritz-Erler-Str. 8", city: "Bochum", postalCode: "44795", distanceKm: 8.6,
    mapX: 88, mapY: 20, latitude: 51.4700, longitude: 7.2350, createdAt: new Date().toISOString() },
  { id: "j21", title: "Frühstückshilfe morgens", postedBy: "user", postedByName: "Gerhard Meier", postedByPhoto: photo("gerhard-meier"),
    description: "Mo–Fr eine Stunde morgens: Frühstück machen, Tabletten bereitlegen, kurzes Gespräch. Ich freue mich auf einen festen Menschen.",
    requirements: ["Sehr zuverlässig", "Frühaufsteher:in"],
    supportNeeds: ["Kochen", "Gesellschaft leisten"],
    date: "2026-07-13", time: "07:30", durationHours: 1, pricePerHour: 19,
    address: "Bredeneyer Str. 100", city: "Essen", postalCode: "45133", distanceKm: 3.5,
    mapX: 42, mapY: 75, latitude: 51.4172, longitude: 7.0025, createdAt: new Date().toISOString() },
  { id: "j22", title: "Wäsche waschen & bügeln 1× pro Woche", postedBy: "family", postedByName: "Familie Klein", postedByPhoto: photo("familie-klein"),
    description: "Für meine Tante (79). Waschmaschine bedienen, aufhängen, bügeln, in den Schrank sortieren. Ca. 2 Std.",
    requirements: ["Hauswirtschaftlich erfahren"],
    supportNeeds: ["Wäsche", "Haushalt"],
    date: "2026-07-16", time: "09:00", durationHours: 2, pricePerHour: 20,
    address: "Von-Bock-Str. 4", city: "Mülheim an der Ruhr", postalCode: "45468", distanceKm: 7.9,
    mapX: 18, mapY: 40, latitude: 51.4318, longitude: 6.8807, createdAt: new Date().toISOString() },
  { id: "j23", title: "Wocheneinkauf türkischer Supermarkt", postedBy: "user", postedByName: "Emine Aslan", postedByPhoto: photo("emine-aslan"),
    description: "Ich möchte 1× pro Woche zum türkischen Supermarkt begleitet werden. Danach zusammen Kaffee trinken.",
    requirements: ["Türkisch sprechend", "Körperlich fit"],
    supportNeeds: ["Einkaufen", "Gesellschaft leisten"],
    date: "2026-07-20", time: "10:30", durationHours: 2, pricePerHour: 20,
    address: "Bochumer Landstr. 300", city: "Essen", postalCode: "45276", distanceKm: 5.1,
    mapX: 80, mapY: 60, latitude: 51.4460, longitude: 7.0900, createdAt: new Date().toISOString() },
  { id: "j24", title: "Begleitung Gottesdienst sonntags", postedBy: "user", postedByName: "Christel Berger", postedByPhoto: photo("christel-berger"),
    description: "Sonntags 10:30 Uhr Gottesdienst in der Alten Kirche. Ich brauche Arm zum Einhängen und jemanden für den Rückweg.",
    requirements: ["Freundlich", "Pünktlich"],
    supportNeeds: ["Begleitung zu Terminen"],
    date: "2026-07-19", time: "10:00", durationHours: 2, pricePerHour: 18,
    address: "Kettwiger Str. 2", city: "Essen", postalCode: "45127", distanceKm: 0.5,
    mapX: 56, mapY: 50, latitude: 51.4560, longitude: 7.0117, createdAt: new Date().toISOString() },
  { id: "j25", title: "Nachtwache-Vertretung eine Nacht", postedBy: "family", postedByName: "Familie Winter", postedByPhoto: photo("familie-winter"),
    description: "Meine Mutter darf nachts nicht allein sein (Sturzgefahr). Suche jemanden für Samstagnacht 20:00–08:00 zur Entlastung meines Vaters.",
    requirements: ["Nachtaktiv", "Ruhig", "Erfahrung mit Sturzrisiko"],
    supportNeeds: ["Nachtwache-Vertretung", "Beaufsichtigung in Abwesenheit"],
    date: "2026-07-25", time: "20:00", durationHours: 12, pricePerHour: 30,
    address: "Ruhrallee 90", city: "Essen", postalCode: "45138", distanceKm: 2.9,
    mapX: 65, mapY: 68, latitude: 51.4400, longitude: 7.0410, createdAt: new Date().toISOString() },
];

export const INTERESTS = [
  "Backen", "Kochen", "Spazierengehen", "Musik hören", "Musik spielen",
  "Malen", "Basteln", "Lesen", "Gespräche führen", "Gesellschaftsspiele",
  "Fernsehen", "Zeitungslektüre", "Garten / Pflanzen", "Haustiere",
  "Technik", "Ausflüge", "Handwerk", "Erinnerungsarbeit",
];

export const SUPPORT_CATEGORIES: { title: string; items: string[] }[] = [
  {
    title: "Haushaltsnahe Dienstleistungen",
    items: [
      "Einkaufen gehen oder Begleitung zum Einkauf",
      "Zubereitung einfacher Mahlzeiten",
      "Unterstützung beim Aufräumen",
      "Unterstützung beim Putzen (keine professionelle Reinigung)",
      "Wäsche waschen, aufhängen, bügeln",
      "Müll rausbringen",
      "Betten beziehen",
      "Pflanzenpflege",
      "Balkonpflege",
    ],
  },
  {
    title: "Alltagsbegleitung & Gesellschaft",
    items: [
      "Spaziergänge",
      "Begleitung zu Arztterminen",
      "Begleitung zu Behörden",
      "Begleitung zum Friseur",
      "Gespräche",
      "Vorlesen",
      "Spiele spielen",
      "Gemeinsames Fernsehen",
      "Musik hören",
      "Erinnerung an Termine",
      "Unterstützung bei Tagesstruktur",
      "Einfache Tagesplanung",
    ],
  },
  {
    title: "Organisation & Kommunikation",
    items: [
      "Hilfe bei Briefen",
      "Hilfe bei Anträgen",
      "Dokumente sortieren",
      "Hilfe mit Telefon",
      "Hilfe mit Fernseher",
      "Smartphone-Hilfe",
      "Tablet-Hilfe",
      "Bestellung von Hilfsmitteln oder Medikamenten (nicht medizinisch)",
    ],
  },
  {
    title: "Betreuung & Aktivierung",
    items: [
      "Gespräche zur geistigen Aktivierung",
      "Biografiearbeit",
      "Gedächtnistraining",
      "Malen",
      "Basteln",
      "Handwerkliche Aktivitäten",
      "Bewegungsübungen ohne medizinischen Hintergrund",
      "Gesellschaftsspiele",
      "Puzzle",
      "Musik",
    ],
  },
  {
    title: "Entlastung für Angehörige",
    items: [
      "Zeitweise Betreuung während Abwesenheit",
      "Begleitdienste zur Entlastung",
      "Beaufsichtigung in Abwesenheit",
    ],
  },
];

export const HELPER_QUALIFICATIONS = [
  "Alltagsbegleiter/in",
  "Betreuungsassistent/in §43b / §53c SGB XI",
  "Hauswirtschaft",
  "Erste Hilfe Kurs",
  "Sozialbetreuung",
  "Familienpfleger/in",
  "Erzieher/in / Pädagog/in",
  "Sozialassistent/in",
  "Erfahrung in Seniorenbegleitung",
  "Keine formale Ausbildung",
];

export const HELPER_INTERESTS = [
  "Spaziergänge", "Gespräche führen", "Kochen & Backen", "Gesellschaftsspiele",
  "Vorlesen", "Technik-Hilfe", "Einkaufen", "Haushalt & Putzen",
  "Gartenarbeit", "Bewegung & Gymnastik", "Basteln & Malen", "Musik",
  "Begleitung zu Terminen", "Haustierbetreuung", "Wäsche waschen & bügeln",
  "Handwerkliche Tätigkeiten", "Fotografie", "Gedächtnistraining",
  "Brettspiele & Kartenspiele", "Stadtbummel & Ausflüge",
];

export const LANGUAGES = [
  "Deutsch", "Englisch", "Türkisch", "Polnisch", "Russisch",
  "Arabisch", "Spanisch", "Französisch", "Italienisch", "Ukrainisch",
];

export const CARE_LEVELS = [
  "Kein Pflegegrad", "Pflegegrad 1", "Pflegegrad 2",
  "Pflegegrad 3", "Pflegegrad 4", "Pflegegrad 5",
];

export const MOBILITY = [
  "vollständig mobil", "braucht Begleitung", "Rollator",
  "Rollstuhl", "überwiegend zuhause",
];

/** Simple KI-style compatibility scoring against a family profile. */
export function scoreHelper(helper: Helper, profile: FamilyProfile | null): {
  score: number;
  reasons: string[];
} {
  if (!profile) {
    // Fallback: reward verification & rating so list still looks intentional.
    const score = Math.round(helper.rating * 18 + (helper.verified ? 8 : 0));
    return { score: Math.min(99, score), reasons: ["Beliebte Helfer:in in Ihrer Nähe"] };
  }

  const reasons: string[] = [];
  let score = 55;

  // interest overlap
  const interestOverlap = helper.interests.filter((i) =>
    profile.interests.some((pi) => i.toLowerCase().includes(pi.toLowerCase()) || pi.toLowerCase().includes(i.toLowerCase()))
  );
  if (interestOverlap.length) {
    score += Math.min(20, interestOverlap.length * 6);
    reasons.push(`Gemeinsame Interessen: ${interestOverlap.slice(0, 3).join(", ")}`);
  }

  // support-need matching
  const offerOverlap = helper.offers.filter((o) =>
    profile.supportNeeds.some((n) => n.toLowerCase().includes(o.toLowerCase()) || o.toLowerCase().includes(n.split(" ")[0].toLowerCase()))
  );
  if (offerOverlap.length) {
    score += Math.min(15, offerOverlap.length * 4);
    reasons.push(`Bietet: ${offerOverlap.slice(0, 3).join(", ")}`);
  }

  // price
  if (profile.maxPricePerHour && helper.pricePerHour <= profile.maxPricePerHour) {
    score += 6;
    reasons.push(`Stundensatz im Budget (${helper.pricePerHour} €/Std.)`);
  }

  // gender preference
  if (profile.genderPreference && profile.genderPreference !== "egal" && helper.gender === profile.genderPreference) {
    score += 4;
    reasons.push(`Passt zur Geschlechtspräferenz`);
  }

  // verified & rating bump
  if (helper.verified) score += 4;
  score += Math.round((helper.rating - 4) * 6);

  if (!reasons.length) reasons.push("Verfügbar in Ihrer Nähe");
  return { score: Math.min(99, Math.max(35, score)), reasons };
}
