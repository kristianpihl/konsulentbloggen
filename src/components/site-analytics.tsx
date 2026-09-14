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

/**
 * Usynlig komponent som registrerer sidevisninger og tid brukt per side.
 * Ingen cookies, ingen personopplysninger — kun sti, en tilfeldig
 * sesjons-id og varighet. Monteres én gang i (site)/layout.tsx.
 */
export function SiteAnalytics() {
  const pathname = usePathname();
  const viewIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    // Avslutt forrige sidevisning (hvis noen) før vi starter en ny —
    // dekker client-side navigasjon mellom sider i appen.
    if (viewIdRef.current) {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      sendBeacon({ event: "leave", id: viewIdRef.current, durationSeconds: elapsed });
      viewIdRef.current = null;
    }

    startedAtRef.current = Date.now();

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

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden" && viewIdRef.current) {
        const elapsed = (Date.now() - startedAtRef.current) / 1000;
        sendBeacon({ event: "leave", id: viewIdRef.current, durationSeconds: elapsed });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}
