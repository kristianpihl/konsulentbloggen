// Hjelpefunksjoner for planlagt publisering. Alle klokkeslett i admin
// tolkes som norsk tid (Europe/Oslo), også ved sommer-/vintertid.

const TZ = "Europe/Oslo";
const THURSDAY = 4;
const SLOT_HOUR = 9;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function partsInTz(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const p = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    y: Number(p.year),
    m: Number(p.month),
    d: Number(p.day),
    h: Number(p.hour),
    mi: Number(p.minute),
    s: Number(p.second),
  };
}

function offsetMs(date: Date): number {
  const p = partsInTz(date);
  const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

// "2026-10-15T09:00" (norsk tid) → Date (riktig UTC-tidspunkt)
export function osloLocalToDate(local: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  const naive = Date.UTC(y, mo - 1, d, h, mi);
  let guess = naive - offsetMs(new Date(naive));
  guess = naive - offsetMs(new Date(guess));
  return new Date(guess);
}

// ISO-tidspunkt → "2026-10-15T09:00" i norsk tid (til datetime-local-felt)
export function isoToOsloLocal(iso: string): string {
  const p = partsInTz(new Date(iso));
  return `${p.y}-${pad(p.m)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}`;
}

// Er tidspunktet (ISO) i fremtiden? Brukes til å avgjøre om et innlegg er planlagt.
export function isInFuture(iso: string): boolean {
  return new Date(iso).getTime() > Date.now();
}

export function formatDateTimeOslo(iso: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// Første torsdag kl. 09:00 (norsk tid) som er i fremtiden og ikke allerede
// har et planlagt innlegg. `taken` er publiseringstidspunkt (ISO) som er opptatt.
export function nextFreeThursdaySlot(now: Date, taken: string[]): string {
  const takenMinutes = new Set(
    taken.map((iso) => Math.floor(new Date(iso).getTime() / 60000)),
  );
  const today = partsInTz(now);

  for (let i = 0; i < 800; i++) {
    const day = new Date(Date.UTC(today.y, today.m - 1, today.d + i, 12));
    if (day.getUTCDay() !== THURSDAY) continue;

    const local = `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}T${pad(SLOT_HOUR)}:00`;
    const slot = osloLocalToDate(local);
    if (!slot) continue;
    if (slot.getTime() <= now.getTime()) continue;
    if (takenMinutes.has(Math.floor(slot.getTime() / 60000))) continue;
    return local;
  }

  return "";
}
