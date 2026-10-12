import { MAX_POST_CONTENT_LENGTH } from "@/types/post";

export const MAX_BUILDER_INPUT_LENGTH = 1500;
export const MAX_PRINCIPLES_LENGTH = 8000;

// Settes til true når generatoren faktisk kaller Claude (se generateArticle).
export const AI_GENERATION_ENABLED = false;

export interface BuilderInput {
  problem: string;
  solution: string;
  category: string | null;
  principles: string;
}

export interface GeneratedArticle {
  title: string;
  excerpt: string;
  content: string;
}

function firstSentence(text: string, max: number): string {
  const sentence = text.split(/(?<=[.!?])\s/)[0] ?? text;
  const trimmed = sentence.replace(/\s+/g, " ").trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

const ARTICLE_ENDING = "## Hva tenker du? 💬";

// Klipper brødteksten slik at avslutningen alltid får plass innenfor makslengden.
function clampContent(body: string): string {
  const room = MAX_POST_CONTENT_LENGTH - ARTICLE_ENDING.length - 2;
  let text = body;
  if (text.length > room) {
    const cut = text.slice(0, room);
    const lastBreak = cut.lastIndexOf("\n\n");
    text = (lastBreak > room * 0.6 ? cut.slice(0, lastBreak) : cut).trimEnd();
  }
  return `${text}\n\n${ARTICLE_ENDING}`;
}

// Enkel mal: problem først, deretter løsning. Brukes til generatoren er koblet
// til Claude, slik at hele flyten (skjema → utkast → redigering) kan testes.
function templateArticle({ problem, solution }: BuilderInput): GeneratedArticle {
  return {
    title: firstSentence(problem, 90),
    excerpt: firstSentence(problem, 160),
    content: clampContent(`${problem}\n\n## Hva kan du gjøre? 💡\n\n${solution}`),
  };
}

// Her kobler vi på Claude senere: send `principles` som systeminstruks og
// `problem`/`solution` som innhold, og be om tittel, ingress og tekst
// (maks MAX_POST_CONTENT_LENGTH tegn) som struktur. Resten av flyten er uendret.
export async function generateArticle(input: BuilderInput): Promise<GeneratedArticle> {
  return templateArticle(input);
}
