export type Mouth = "talk" | "flat" | "smile" | "open";
export type Arms = "shrug" | "down" | "folded";
export type Accessory = "none" | "cap" | "glasses" | "hair";

export interface CharacterSpec {
  id: string;
  x: number; // midten av figuren, i scenens koordinater
  mouth?: Mouth;
  arms?: Arms;
  gaze?: { x: number; y: number }; // -1..1, hvor øynene ser
  accessory?: Accessory;
  scale?: number;
}

export interface BubbleSpec {
  by: string; // id til figuren som snakker/tenker
  kind: "speech" | "thought";
  text: string;
  width?: number; // ønsket maks tekstbredde i px
  dx?: number; // forskyv boblen sideveis
  lift?: number; // ekstra avstand over hodet
}

export interface SceneSpec {
  width: number;
  height: number;
  seed?: number;
  characters: CharacterSpec[];
  bubbles: BubbleSpec[];
}
