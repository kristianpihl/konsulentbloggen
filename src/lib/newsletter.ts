import { createClient } from "@/lib/supabase/server";
import type { Subscriber } from "@/types/subscriber";

const TZ = "Europe/Oslo";
const DAY_MS = 24 * 60 * 60 * 1000;

// Alle abonnenter (aktive og avmeldte), nyeste først. Leses med admin-
// innloggingen din; RLS-policyen slipper bare deg gjennom.
export async function getSubscribersForAdmin(): Promise<Subscriber[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  if (error) {
    console.error("Klarte ikke å hente abonnenter:", error.message);
    return [];
  }
  return data ?? [];
}

export interface TrendPoint {
  date: string; // yyyy-mm-dd (norsk dato)
  active: number; // antall aktive abonnenter ved utgangen av dagen
}

function osloDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
}

// Antall aktive abonnenter per dag, fra første innmelding (maks `maxDays`
// dager tilbake) til i dag. Hver innmelding teller +1 den dagen den skjedde,
// hver avmelding −1.
export function buildTrend(subscribers: Subscriber[], maxDays = 90): TrendPoint[] {
  if (subscribers.length === 0) return [];

  const delta = new Map<string, number>();
  const bump = (iso: string, by: number) => {
    const day = osloDay(new Date(iso));
    delta.set(day, (delta.get(day) ?? 0) + by);
  };
  let earliest = Infinity;
  for (const s of subscribers) {
    bump(s.subscribed_at, 1);
    earliest = Math.min(earliest, new Date(s.subscribed_at).getTime());
    if (s.status === "unsubscribed" && s.unsubscribed_at) bump(s.unsubscribed_at, -1);
  }

  const today = new Date();
  const days = Math.min(maxDays, Math.floor((today.getTime() - earliest) / DAY_MS) + 1);
  const points: TrendPoint[] = [];
  let running = 0;
  // Summer alt som skjedde før vinduet starter.
  const firstShown = osloDay(new Date(today.getTime() - (days - 1) * DAY_MS));
  for (const [day, by] of delta) if (day < firstShown) running += by;

  for (let i = days - 1; i >= 0; i--) {
    const day = osloDay(new Date(today.getTime() - i * DAY_MS));
    running += delta.get(day) ?? 0;
    points.push({ date: day, active: running });
  }
  return points;
}

// Antall aktive abonnenter som meldte seg på de siste `days` dagene.
export function countNewSubscribers(subscribers: Subscriber[], days: number): number {
  const since = Date.now() - days * DAY_MS;
  return subscribers.filter(
    (s) => s.status === "active" && new Date(s.subscribed_at).getTime() >= since,
  ).length;
}
