"use client";

import { useState } from "react";

function PdfIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
      <path d="M9 16.5h1.2a1.3 1.3 0 0 0 0-2.6H9V17" />
      <path d="M13 13.9v3.6h1a1.8 1.8 0 0 0 0-3.6h-1Z" />
      <path d="M17.5 13.9h-1.7v3.6" />
      <path d="M15.8 15.6h1.4" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M7 8V3h10v5" />
      <rect x="4" y="8" width="16" height="8" rx="1" />
      <path d="M7 16h10v5H7Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-6 w-6"
      aria-hidden
    >
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8 15.8 6.2M8.2 13.2l7.6 4.6" />
    </svg>
  );
}

export function ArticleActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Brukeren avbrøt delingen — ikke noe å gjøre.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Utilgjengelig utklippstavle — ignorer stille.
    }
  }

  return (
    <div className="flex items-center gap-10 py-6 sm:gap-14">
      <button
        type="button"
        onClick={handlePrint}
        className="flex flex-col items-center gap-1.5 text-black/60 hover:text-black"
      >
        <PdfIcon />
        <span className="text-xs font-medium tracking-wide">LAG PDF</span>
      </button>
      <button
        type="button"
        onClick={handlePrint}
        className="flex flex-col items-center gap-1.5 text-black/60 hover:text-black"
      >
        <PrintIcon />
        <span className="text-xs font-medium tracking-wide">PRINT</span>
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="flex flex-col items-center gap-1.5 text-black/60 hover:text-black"
      >
        <ShareIcon />
        <span className="text-xs font-medium tracking-wide">
          {copied ? "KOPIERT!" : "DEL"}
        </span>
      </button>
    </div>
  );
}
