"use client";

import { useState } from "react";

export function CopyEmailsButton({ emails }: { emails: string[] }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={emails.length === 0}
      className="rounded-md border border-black/15 bg-white px-3 py-1.5 text-sm font-medium hover:bg-black/5 disabled:opacity-40"
    >
      {copied ? "Kopiert ✓" : `Kopier ${emails.length} e-postadresser`}
    </button>
  );
}
