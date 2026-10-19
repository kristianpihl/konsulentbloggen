// «Om meg»-siden er en vanlig statisk side (slug «om») der teksten er Markdown.
// Teksten før første «## »-overskrift er ingressen. Hver «## »-overskrift som
// heter det samme som en av kompetanseområdene under, blir en bar i
// accordion-menyen. Andre «## »-seksjoner (for eksempel «Ta kontakt») vises som
// vanlig tekst under menyen.
export const ABOUT_SLUG = "om";

// Rekkefølgen i menyen.
export const ABOUT_SECTIONS = [
  "Produktledelse",
  "Teamledelse",
  "Coaching og fasilitering",
  "KI",
  "Forretningsutvikling",
  "Endringsledelse",
  "Digitalisering",
  "Arkitektur",
] as const;

export interface AboutParts {
  intro: string;
  // Alltid alle åtte, i fast rekkefølge. Tom tekst hvis seksjonen mangler.
  sections: { title: string; body: string }[];
  // Seksjoner som ikke er kompetanseområder.
  extras: { title: string; body: string }[];
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function parseAboutContent(content: string): AboutParts {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const introLines: string[] = [];
  const blocks: { title: string; lines: string[] }[] = [];

  for (const line of lines) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      blocks.push({ title: heading[1], lines: [] });
    } else if (blocks.length > 0) {
      blocks[blocks.length - 1].lines.push(line);
    } else {
      introLines.push(line);
    }
  }

  const bodyOf = (block: { lines: string[] }) => block.lines.join("\n").trim();

  const sections = ABOUT_SECTIONS.map((title) => {
    const block = blocks.find((item) => normalize(item.title) === normalize(title));
    return { title, body: block ? bodyOf(block) : "" };
  });

  const known = new Set(ABOUT_SECTIONS.map(normalize));
  const extras = blocks
    .filter((block) => !known.has(normalize(block.title)))
    .map((block) => ({ title: block.title, body: bodyOf(block) }));

  return { intro: introLines.join("\n").trim(), sections, extras };
}
