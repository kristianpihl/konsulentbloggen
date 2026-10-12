"use client";

import { useActionState, useState } from "react";
import { saveStyleGuide, type StyleGuideState } from "@/app/admin/bygger/actions";
import { MAX_PRINCIPLES_LENGTH } from "@/lib/content-builder";

export function StyleGuideForm({ initial }: { initial: string }) {
  const [state, formAction, pending] = useActionState<StyleGuideState, FormData>(
    saveStyleGuide,
    null,
  );
  const [value, setValue] = useState(initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="principles" className="block text-sm font-medium">
            Prinsipper
          </label>
          <span className="text-xs text-black/50">
            {value.length} / {MAX_PRINCIPLES_LENGTH}
          </span>
        </div>
        <textarea
          id="principles"
          name="principles"
          rows={22}
          required
          maxLength={MAX_PRINCIPLES_LENGTH}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 font-mono text-sm outline-none focus:border-black/40"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Lagret.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50"
      >
        {pending ? "Lagrer…" : "Lagre prinsipper"}
      </button>
    </form>
  );
}
