import type { ReactNode } from "react";
import { SparklesIcon, ToolboxIcon } from "@/components/icons";

function Svg({ className, children }: { className: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

type IconProps = { className?: string };

// Produktledelse: en pakke/boks (produktet).
function ProductIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
      <path d="m4 7 8 4 8-4" />
      <path d="M12 11v10" />
    </Svg>
  );
}

// Teamledelse: tre personer.
function TeamIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="8" r="2.8" />
      <path d="M6.8 19v-1.5a3.5 3.5 0 0 1 3.5-3.5h3.4a3.5 3.5 0 0 1 3.5 3.5V19" />
      <circle cx="5.5" cy="9.5" r="2" />
      <path d="M2.5 17v-.8a2.8 2.8 0 0 1 2.8-2.8" />
      <circle cx="18.5" cy="9.5" r="2" />
      <path d="M21.5 17v-.8a2.8 2.8 0 0 0-2.8-2.8" />
    </Svg>
  );
}

// Coaching og fasilitering: samtale (to snakkebobler).
function CoachingIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 5h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-3.5 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="M19 9h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1v2.5l-3-2.5h-4.5" />
    </Svg>
  );
}

// Forretningsutvikling: stigende kurve med pil.
function GrowthIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </Svg>
  );
}

// Digitalisering: skjerm med kodeparenteser.
function DigitalIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
      <path d="m9.5 8.5-2 1.5 2 1.5" />
      <path d="m14.5 8.5 2 1.5-2 1.5" />
    </Svg>
  );
}

// Endringsledelse: to sirkulære piler.
function ChangeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 11a8 8 0 0 0-14.5-4.5L4 8" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14.5 4.5L20 16" />
      <path d="M20 20v-4h-4" />
    </Svg>
  );
}

// Arkitektur: lag på lag.
function ArchitectureIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </Svg>
  );
}

// Karriere: trapp oppover.
function CareerIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 20h5v-5h5v-5h5V5h3" />
    </Svg>
  );
}

const ICONS: Record<string, (props: IconProps) => ReactNode> = {
  Produktledelse: ProductIcon,
  Teamledelse: TeamIcon,
  "Coaching og fasilitering": CoachingIcon,
  KI: SparklesIcon,
  Forretningsutvikling: GrowthIcon,
  Digitalisering: DigitalIcon,
  Endringsledelse: ChangeIcon,
  Arkitektur: ArchitectureIcon,
  Karriere: CareerIcon,
};

// Ikon for en av bloggens kategorier. Ukjent eller manglende kategori gir verktøykasse-ikonet.
export function CategoryIcon({
  category,
  className,
}: {
  category: string | null | undefined;
  className?: string;
}) {
  const Icon = (category && ICONS[category]) || ToolboxIcon;
  return <Icon className={className} />;
}
