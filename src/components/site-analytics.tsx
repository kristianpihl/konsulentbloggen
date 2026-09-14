"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "kb_session_id";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // sessionStorage utilgjengelig (f.eks. privat nettlesing) — bruk en
    // engangs-id for dette besøket i stedet.
    return crypto.randomUUID();
  }
}

function sendBeacon(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
  } else {
    fetch("/api/track", { method: "POST", body, keepalive: true });
  }
}

// Hvor langt ned på siden besøkeren har scrollet, i prosent (0-100).
function currentScrollPercent(): number {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - doc.clientHeight;
  if (scrollable <= 0) return 100; // hele siden er synlig uten å scrolle
  const scrollTop = window.scrollY || doc.scrollTop;
  return Math.min(100, Math.max(0, Math.round((scrollTop / scrollable) * 100)));
}

/**
 * Usynlig komponent som registrerer sidevisninger, tid brukt og
 * scroll-dybde per side. Ingen cookies, ingen personopplysninger — kun
 * sti, en tilfeldig sesjons-id, varighet og hvor langt ned man scrollet.
 * Monteres én gang i (site)/layout.tsx.
 */
export function SiteAnalytics() {
  const pathname = usePathname();
  const viewIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);

  useEffect(() => {
    // Avslutt forrige sidevisning (hvis noen) før vi starter en ny —
    // dekker client-side navigasjon mellom sider i appen.
    if (viewIdRef.current) {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      sendBeacon({
        event: "leave",
        id: viewIdRef.current,
        durationSeconds: elapsed,
        scrollDepth: maxScrollRef.current,
      });
      viewIdRef.current = null;
    }

    startedAtRef.current = Date.now();
    maxScrollRef.current = currentScrollPercent();

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "view",
        path: pathname,
        sessionId: getSessionId(),
        referrer: document.referrer || null,
      }),
    })
      .then((res) => res.json())
      .then((data: { id?: string }) => {
        if (data.id) viewIdRef.current = data.id;
      })
      .catch(() => {
        // Stille feil — analytics skal aldri påvirke brukeropplevelsen.
      });

    function handleScroll() {
      maxScrollRef.current = Math.max(maxScrollRef.current, currentScrollPercent());
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden" && viewIdRef.current) {
        const elapsed = (Date.now() - startedAtRef.current) / 1000;
        sendBeacon({
          event: "leave",
          id: viewIdRef.current,
          durationSeconds: elapsed,
          scrollDepth: maxScrollRef.current,
        });
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleVisibilityChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}
