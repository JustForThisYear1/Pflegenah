import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/AppLayout";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum – Pflegenah" },
      { name: "description", content: "Impressum und Anbieterkennzeichnung von Pflegenah." },
    ],
  }),
  component: Impressum,
});

function Impressum() {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-[720px]">
        <ScreenHeader title="Impressum" subtitle="Angaben gemäß § 5 TMG" back="/" />
        <div className="space-y-6 rounded-2xl bg-card p-6 shadow-card text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold mb-2">Anbieter</h2>
            <p>
              Pflegenah UG (haftungsbeschränkt)<br />
              Musterstraße 12<br />
              45127 Essen<br />
              Deutschland
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">Kontakt</h2>
            <p>
              Telefon: +49 (0)201 000 000<br />
              E-Mail: hallo@pflegenah.de
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">Vertretungsberechtigt</h2>
            <p>Geschäftsführung: Maria Musterfrau</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">Registereintrag</h2>
            <p>
              Amtsgericht Essen, HRB 000000<br />
              USt-IdNr.: DE000000000
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)</h2>
            <p>Maria Musterfrau, Anschrift wie oben</p>
          </section>
          <section>
            <h2 className="text-lg font-bold mb-2">EU-Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a href="https://ec.europa.eu/consumers/odr/" className="underline" target="_blank" rel="noreferrer">
                ec.europa.eu/consumers/odr
              </a>
              . Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
