import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/AppLayout";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutz – Pflegenah" },
      { name: "description", content: "Datenschutzerklärung von Pflegenah nach DSGVO." },
    ],
  }),
  component: Datenschutz,
});

function Datenschutz() {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-[720px]">
        <ScreenHeader title="Datenschutz" subtitle="Informationen nach Art. 13 DSGVO" back="/" />
        <div className="space-y-6 rounded-2xl bg-card p-6 shadow-card text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold mb-2">1. Verantwortlicher</h2>
            <p>
              Pflegenah UG (haftungsbeschränkt), Musterstraße 12, 45127 Essen,
              E-Mail: datenschutz@pflegenah.de
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">2. Verarbeitung Ihrer Daten</h2>
            <p>
              Wir verarbeiten personenbezogene Daten (z. B. Name, Adresse, E-Mail, Standort) ausschließlich zur
              Vermittlung von Alltagshilfe zwischen Familien und Helfer:innen sowie zur Bereitstellung und
              Verbesserung unserer Plattform. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und f DSGVO.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">3. Standortdaten</h2>
            <p>
              Für die Kartenansicht kann Ihr Browserstandort verwendet werden. Die Freigabe erfolgt freiwillig
              über den Browser. Ohne Freigabe wird kein Standort erhoben.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">4. Nachrichten & Buchungen</h2>
            <p>
              Chatnachrichten und Buchungsanfragen werden gespeichert, um Terminabsprachen zu ermöglichen und
              den Verlauf für Sie einsehbar zu halten.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">5. Auftragsverarbeitung & Hosting</h2>
            <p>
              Unsere Plattform wird auf Servern innerhalb der EU gehostet. Dienstleister sind vertraglich zur
              Einhaltung der DSGVO verpflichtet.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">6. Ihre Rechte</h2>
            <p>
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und
              Widerspruch. Beschwerden können Sie bei der zuständigen Aufsichtsbehörde einlegen.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">7. Kontakt</h2>
            <p>Anfragen zum Datenschutz richten Sie bitte an datenschutz@pflegenah.de.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
