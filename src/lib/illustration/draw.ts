import rough from "roughjs";
import type { Options } from "roughjs/bin/core";
import type { BubbleSpec, CharacterSpec, SceneSpec } from "./types";

const NS = "http://www.w3.org/2000/svg";
const INK = "#141414";

export const FONT_SIZE = 30;
const CHAR_WIDTH = FONT_SIZE * 0.47;
const FIGURE_HEIGHT = 557; // fra bakken til toppen av hodet, ved scale 1

export interface BubbleLayout {
  spec: BubbleSpec;
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
  tipX: number;
  tipY: number;
  headX: number;
}

function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function groundY(scene: SceneSpec): number {
  return scene.height - 70;
}

function headTop(scene: SceneSpec, c: CharacterSpec): number {
  return groundY(scene) - FIGURE_HEIGHT * (c.scale ?? 1);
}

export function layoutBubbles(scene: SceneSpec): BubbleLayout[] {
  return scene.bubbles.flatMap((spec) => {
    const character = scene.characters.find((c) => c.id === spec.by);
    if (!character) return [];

    const maxChars = Math.max(8, Math.floor((spec.width ?? 300) / CHAR_WIDTH));
    const lines = wrap(spec.text, maxChars);
    const textW = Math.max(...lines.map((l) => l.length)) * CHAR_WIDTH;
    const w = textW + 76;
    const h = lines.length * FONT_SIZE * 1.3 + 54;

    const top = headTop(scene, character);
    const bottom = top - (spec.lift ?? 46);
    const cx = character.x + (spec.dx ?? 0);
    const x = Math.min(Math.max(cx - w / 2, 24), scene.width - w - 24);

    return [
      {
        spec,
        x,
        y: bottom - h,
        w,
        h,
        lines,
        tipX: character.x,
        tipY: top - 14,
        headX: character.x,
      },
    ];
  });
}

function bubblePath(b: BubbleLayout): string {
  const { x, y, w, h } = b;
  const r = 30;
  const baseX = Math.min(Math.max(b.tipX, x + 54), x + w - 54);
  return [
    `M ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `L ${x + w} ${y + h - r}`,
    `Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `L ${baseX + 20} ${y + h}`,
    `L ${b.tipX} ${b.tipY}`,
    `L ${baseX - 22} ${y + h}`,
    `L ${x + r} ${y + h}`,
    `Q ${x} ${y + h} ${x} ${y + h - r}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    "Z",
  ].join(" ");
}

function group(parent: Element, transform?: string): SVGGElement {
  const g = document.createElementNS(NS, "g");
  if (transform) g.setAttribute("transform", transform);
  parent.appendChild(g);
  return g;
}

function drawCharacter(
  rc: ReturnType<typeof rough.svg>,
  layer: Element,
  scene: SceneSpec,
  c: CharacterSpec,
  index: number,
) {
  const scale = c.scale ?? 1;
  const g = group(layer, `translate(${c.x} ${groundY(scene)}) scale(${scale})`);
  const seed = (scene.seed ?? 7) + index * 31;
  const line: Options = {
    stroke: INK,
    strokeWidth: 3.4,
    roughness: 1.5,
    bowing: 1.4,
    seed,
  };
  // Ben tegnes først og festes inne i kroppen (overtegnes av hvit fyll)
  g.appendChild(rc.path("M -24 -150 Q -52 -80 -46 0", { ...line, seed: seed + 1 }));
  g.appendChild(rc.path("M 24 -150 Q 54 -76 52 0", { ...line, seed: seed + 2 }));

  // Resten av figuren løftes 35 px slik at bena blir lange nok
  const up = group(g, "translate(0 -35)");
  const add = (node: SVGGElement) => up.appendChild(node);

  // Kropp og hode (hvit fyll skjuler linjer bak)
  add(
    rc.ellipse(0, -277, 150, 334, {
      ...line,
      fill: "#ffffff",
      fillStyle: "solid",
      seed: seed + 5,
    }),
  );
  add(
    rc.circle(0, -470, 104, {
      ...line,
      fill: "#ffffff",
      fillStyle: "solid",
      seed: seed + 6,
    }),
  );

  // Armer tegnes foran kroppen
  const arms = c.arms ?? "down";
  if (arms === "shrug") {
    add(rc.path("M -64 -366 Q -118 -336 -138 -404", { ...line, seed: seed + 3 }));
    add(rc.path("M 64 -366 Q 118 -336 140 -404", { ...line, seed: seed + 4 }));
  } else if (arms === "folded") {
    add(rc.path("M -66 -350 Q -158 -344 -112 -298 L -18 -262", { ...line, seed: seed + 3 }));
    add(rc.path("M 68 -330 Q 40 -300 -70 -318", { ...line, seed: seed + 4 }));
  } else {
    add(rc.path("M -64 -366 Q -122 -300 -108 -226", { ...line, seed: seed + 3 }));
    add(rc.path("M 64 -366 Q 124 -300 110 -226", { ...line, seed: seed + 4 }));
  }

  // Øyne
  const gx = (c.gaze?.x ?? 0) * 6;
  const gy = (c.gaze?.y ?? 0) * 6;
  for (const ex of [-21, 21]) {
    add(rc.circle(ex, -480, 31, { ...line, strokeWidth: 2.6, fill: "#ffffff", fillStyle: "solid", seed: seed + 7 + ex }));
    add(rc.circle(ex + gx, -480 + gy, 12, { ...line, strokeWidth: 1, fill: INK, fillStyle: "solid", seed: seed + 9 + ex }));
  }

  // Munn
  const mouth = c.mouth ?? "flat";
  const mo: Options = { ...line, strokeWidth: 2.6, seed: seed + 11 };
  if (mouth === "talk") {
    add(rc.polygon([[-20, -444], [18, -450], [-2, -430]], mo));
  } else if (mouth === "smile") {
    add(rc.path("M -20 -446 Q 0 -428 20 -446", mo));
  } else if (mouth === "open") {
    add(rc.ellipse(0, -438, 20, 16, mo));
  } else {
    add(rc.line(-20, -440, 20, -440, mo));
  }

  // Kjennetegn
  const acc = c.accessory ?? "none";
  if (acc === "cap") {
    add(rc.path("M -50 -497 A 50 44 0 0 1 50 -497 Z", { ...line, fill: INK, fillStyle: "solid", seed: seed + 13 }));
    add(rc.path("M 22 -503 L 84 -512 L 70 -490 L 22 -492 Z", { ...line, fill: INK, fillStyle: "solid", seed: seed + 14 }));
  } else if (acc === "glasses") {
    add(rc.circle(-21, -480, 42, { ...line, strokeWidth: 2.4, seed: seed + 13 }));
    add(rc.circle(21, -480, 42, { ...line, strokeWidth: 2.4, seed: seed + 14 }));
    add(rc.line(-4, -481, 4, -481, { ...line, strokeWidth: 2.4, seed: seed + 15 }));
  } else if (acc === "hair") {
    add(rc.line(-14, -520, -20, -546, { ...line, seed: seed + 13 }));
    add(rc.line(0, -522, 0, -552, { ...line, seed: seed + 14 }));
    add(rc.line(14, -520, 22, -546, { ...line, seed: seed + 15 }));
  }
}

function drawBubble(
  rc: ReturnType<typeof rough.svg>,
  layer: Element,
  scene: SceneSpec,
  b: BubbleLayout,
  index: number,
) {
  const opts: Options = {
    stroke: INK,
    strokeWidth: 3.4,
    roughness: 1.5,
    bowing: 1.4,
    seed: (scene.seed ?? 7) + 400 + index * 17,
    fill: "#ffffff",
    fillStyle: "solid",
  };

  if (b.spec.kind === "speech") {
    layer.appendChild(rc.path(bubblePath(b), opts));
    return;
  }

  // Tenkeboble: sky-aktig ellipse + små sirkler ned mot hodet
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  layer.appendChild(rc.ellipse(cx, cy, b.w + 24, b.h + 18, opts));
  const startY = b.y + b.h + 8;
  const steps = 3;
  for (let i = 0; i < steps; i++) {
    const t = (i + 1) / (steps + 0.4);
    const px = cx + (b.headX - cx) * t;
    const py = startY + (b.tipY - startY) * t;
    layer.appendChild(rc.circle(px, py, 26 - i * 7, { ...opts, seed: (opts.seed ?? 0) + i + 1 }));
  }
}

export function drawScene(layer: SVGGElement, scene: SceneSpec, bubbles: BubbleLayout[]) {
  while (layer.firstChild) layer.removeChild(layer.firstChild);
  const svg = layer.ownerSVGElement;
  if (!svg) return;
  const rc = rough.svg(svg);

  scene.characters.forEach((c, i) => drawCharacter(rc, layer, scene, c, i));
  bubbles.forEach((b, i) => drawBubble(rc, layer, scene, b, i));
}
