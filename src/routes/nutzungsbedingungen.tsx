import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/AppLayout";

export const Route = createFileRoute("/nutzungsbedingungen")({
  head: () => ({
    meta: [
      { title: "Nutzungsbedingungen – Pflegenah" },
      { name: "description", content: "Allgemeine Nutzungsbedingungen der Pflegenah-Plattform." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-[720px]">
        <ScreenHeader title="Nutzungsbedingungen" subtitle="Regeln für die Nutzung der Plattform" back="/" />
        <div className="space-y-6 rounded-2xl bg-card p-6 shadow-card text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold mb-2">1. Geltungsbereich</h2>
            <p>
              Diese Nutzungsbedingungen regeln die Nutzung der Pflegenah-Plattform durch Familien,
              Hilfesuchende und Helfer:innen.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">2. Vermittlung, keine Pflegeleistung</h2>
            <p>
              Pflegenah vermittelt ausschließlich Kontakte für Alltagshilfe und Gesellschaft. Wir erbringen
              keine medizinischen oder pflegerischen Leistungen im Sinne des SGB XI.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">3. Registrierung</h2>
            <p>
              Nutzer:innen müssen wahrheitsgemäße Angaben machen. Helfer:innen durchlaufen eine Prüfung
              (Identität, Referenzen), bevor sie freigeschaltet werden.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">4. Buchungen & Zahlungen</h2>
            <p>
              Buchungen kommen direkt zwischen Familien und Helfer:innen zustande. Beträge werden bis zur
              Leistungserbringung treuhänderisch gehalten und danach ausgezahlt.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">5. Verhaltensregeln</h2>
            <p>
              Ein respektvoller Umgang ist Grundlage der Plattform. Diskriminierendes, beleidigendes oder
              rechtswidriges Verhalten führt zur Sperrung.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">6. Haftung</h2>
            <p>
              Pflegenah haftet nur für Vorsatz und grobe Fahrlässigkeit sowie im Rahmen zwingender
              gesetzlicher Vorschriften.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">7. Änderungen</h2>
            <p>Wir können diese Bedingungen anpassen und informieren rechtzeitig über Änderungen.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
