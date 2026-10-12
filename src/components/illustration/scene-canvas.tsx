"use client";

import { useEffect, useMemo, useRef } from "react";
import { Patrick_Hand } from "next/font/google";
import { FONT_SIZE, drawScene, layoutBubbles } from "@/lib/illustration/draw";
import type { SceneSpec } from "@/lib/illustration/types";

const handwriting = Patrick_Hand({ weight: "400", subsets: ["latin", "latin-ext"] });

export function SceneCanvas({ scene }: { scene: SceneSpec }) {
  const layerRef = useRef<SVGGElement>(null);
  const bubbles = useMemo(() => layoutBubbles(scene), [scene]);

  useEffect(() => {
    if (layerRef.current) drawScene(layerRef.current, scene, bubbles);
  }, [scene, bubbles]);

  return (
    <svg
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      width="100%"
      role="img"
      aria-label="Strektegning av figurer som snakker sammen"
      style={{ background: "#ffffff", display: "block" }}
    >
      <g ref={layerRef} />
      <g
        fill="#141414"
        textAnchor="middle"
        style={{ fontFamily: handwriting.style.fontFamily, fontSize: FONT_SIZE }}
      >
        {bubbles.map((b, i) =>
          b.lines.map((line, li) => (
            <text
              key={`${i}-${li}`}
              x={b.x + b.w / 2}
              y={b.y + 40 + li * FONT_SIZE * 1.3 + FONT_SIZE * 0.35}
            >
              {line}
            </text>
          )),
        )}
      </g>
    </svg>
  );
}
