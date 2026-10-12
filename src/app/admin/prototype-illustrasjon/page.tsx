import type { Metadata } from "next";
import { SceneCanvas } from "@/components/illustration/scene-canvas";
import type { SceneSpec } from "@/lib/illustration/types";

export const metadata: Metadata = {
  title: "Prototype: illustrasjon",
  robots: { index: false, follow: false },
};

const sprintdemo: SceneSpec = {
  width: 1440,
  height: 880,
  seed: 11,
  characters: [
    { id: "a", x: 190, arms: "folded", mouth: "talk", gaze: { x: 0.9, y: 0.3 } },
    { id: "b", x: 450, arms: "folded", mouth: "talk", gaze: { x: 0.9, y: 0.3 }, accessory: "cap", scale: 0.92 },
    { id: "c", x: 790, arms: "shrug", mouth: "talk", gaze: { x: 0, y: 0 } },
    { id: "d", x: 1200, arms: "shrug", mouth: "flat", gaze: { x: 0, y: 0 } },
  ],
  bubbles: [
    { by: "c", kind: "speech", text: "Kan vi skippe sprintdemo denne gangen?", width: 260 },
    { by: "d", kind: "speech", text: "Hmmm.... vell...tja...", width: 280, lift: 60 },
  ],
};

const tenking: SceneSpec = {
  width: 1440,
  height: 880,
  seed: 23,
  characters: [
    { id: "a", x: 470, arms: "down", mouth: "flat", gaze: { x: 0.6, y: -0.8 }, accessory: "glasses" },
    { id: "b", x: 980, arms: "shrug", mouth: "smile", gaze: { x: -0.7, y: 0 }, accessory: "hair" },
  ],
  bubbles: [
    { by: "a", kind: "thought", text: "Hvorfor tar alt så lang tid?", width: 300, dx: -60 },
    { by: "b", kind: "speech", text: "Skal vi ta en kaffe først?", width: 280, dx: 40 },
  ],
};

export default function PrototypePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Prototype: tegnet illustrasjon</h1>
        <p className="mt-2 text-black/60">
          Midlertidig testside. Figurer og bobler tegnes av koden med samme
          «skisse»-motor som Excalidraw (rough.js), så de ser ut som håndtegnet.
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-medium">Scene 1 — snakkebobler</h2>
        <div className="overflow-hidden rounded-lg border border-black/10">
          <SceneCanvas scene={sprintdemo} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-medium">Scene 2 — tenkeboble, briller og hår</h2>
        <div className="overflow-hidden rounded-lg border border-black/10">
          <SceneCanvas scene={tenking} />
        </div>
      </section>
    </div>
  );
}
