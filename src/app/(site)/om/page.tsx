import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Om meg",
};

// Rediger tekstene under med din egen bakgrunn, erfaring og kompetanseområder.
const competence = [
  "Prosjekt- og leveranseledelse",
  "Digitalisering og prosessforbedring",
  "Kravarbeid og interessentstyring",
  "Teknologi- og løsningsforståelse",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Om meg</h1>
      <p className="mt-4 max-w-xl text-black/70">
        Jeg er {siteConfig.role.toLowerCase()} med erfaring fra prosjekter i
        skjæringspunktet mellom teknologi, organisasjon og mennesker. Her på
        bloggen deler jeg korte, praktiske poster om ting jeg lærer underveis.
      </p>

      <h2 className="mt-12 text-lg font-semibold">Kompetanseområder</h2>
      <ul className="mt-4 space-y-2 text-black/70">
        {competence.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden>—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-lg font-semibold">Ta kontakt</h2>
      <p className="mt-4 text-black/70">
        Ønsker du å ta en prat om et prosjekt eller et oppdrag? Send meg en
        e-post på{" "}
        <a href={`mailto:${siteConfig.email}`} className="underline">
          {siteConfig.email}
        </a>{" "}
        eller finn meg på{" "}
        <a
          href={siteConfig.linkedin}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          LinkedIn
        </a>
        .
      </p>
    </div>
  );
}
