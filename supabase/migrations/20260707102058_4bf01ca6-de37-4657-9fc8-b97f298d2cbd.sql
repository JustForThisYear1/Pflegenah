CREATE TABLE public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  service_type text not null,
  address text not null,
  postal_code text not null,
  city text not null,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  budget_per_hour numeric(6,2) not null,
  duration_hours numeric(4,1) not null,
  created_by_role text not null default 'family',
  created_at timestamptz not null default now()
);

GRANT SELECT ON public.jobs TO anon;
GRANT SELECT ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prototype: anyone can read jobs"
  ON public.jobs FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.jobs (title, description, service_type, address, postal_code, city, latitude, longitude, budget_per_hour, duration_hours, created_by_role) VALUES
  ('Einkaufsbegleitung Rewe', 'Wöchentlicher Einkauf mit meiner Mutter (78), leichte Gehhilfe.', 'Einkaufen', 'Rüttenscheider Str. 120', '45130', 'Essen', 51.436800, 7.006700, 22.00, 2.0, 'family'),
  ('Spaziergang im Grugapark', 'Netter Begleiter für 1-stündigen Spaziergang gesucht, 2× pro Woche.', 'Spaziergang', 'Virchowstraße 167a', '45147', 'Essen', 51.428900, 6.987300, 20.00, 1.5, 'family'),
  ('Arztbegleitung Kardiologie', 'Fahrt & Begleitung zum Facharzt-Termin am Vormittag.', 'Arztbegleitung', 'Alfredstraße 279', '45133', 'Essen', 51.420100, 6.996500, 25.00, 3.0, 'user'),
  ('Haushaltshilfe leichte Reinigung', 'Küche und Bad putzen, Wäsche zusammenlegen.', 'Haushalt', 'Bahnhofstraße 40', '47051', 'Duisburg', 51.432900, 6.775800, 21.00, 3.0, 'family'),
  ('Technikhilfe Tablet & WLAN', 'Hilfe beim Einrichten des Tablets meines Vaters für Videoanrufe.', 'Technikhilfe', 'Kortumstraße 82', '44787', 'Bochum', 51.481300, 7.219400, 28.00, 1.5, 'family'),
  ('Gesellschaft am Nachmittag', 'Vorlesen, plaudern, Kaffee trinken – 2× wöchentlich.', 'Gesellschaft', 'Königsallee 60', '40212', 'Düsseldorf', 51.226900, 6.780800, 22.00, 2.5, 'user'),
  ('Hundebetreuung Dackel', 'Gassi gehen mit Dackel Emmi während Reha-Zeit.', 'Haustierbetreuung', 'Hohe Straße 68', '50667', 'Köln', 50.936800, 6.955500, 18.00, 1.0, 'user'),
  ('Gartenarbeit Herbstlaub', 'Laub harken und Beete winterfest machen.', 'Gartenarbeit', 'Ruhrallee 100', '45138', 'Essen', 51.436000, 7.033000, 20.00, 3.0, 'family');