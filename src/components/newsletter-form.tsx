"use client";

import { useActionState } from "react";
import { subscribe, type SubscribeState } from "@/app/(site)/nyhetsbrev/actions";

const initialState: SubscribeState = { status: "idle" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribe, initialState);

  if (state.status === "done") {
    return (
      <div className="mt-6 rounded-lg border border-black/10 bg-neutral-50 p-5">
        <p className="font-semibold">Takk! Du er med 🎉</p>
        <p className="mt-1 text-sm text-black/60">
          Du får beskjed når det kommer noe nytt.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6">
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="din@epost.no"
          aria-label="E-postadresse"
          className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none placeholder:text-black/40 focus:border-black/40"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50"
        >
          {pending ? "Melder på…" : "Meld på"}
        </button>
      </div>

      <fieldset className="mt-4 space-y-2">
        <legend className="text-sm font-medium">Jeg vil få beskjed om</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="wants_posts" defaultChecked className="h-4 w-4 accent-black" />
          Nye artikler
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="wants_resources" defaultChecked className="h-4 w-4 accent-black" />
          Nye maler og verktøy
        </label>
      </fieldset>

      {/* Skjult felt for å fange roboter. Ekte brukere ser det ikke. */}
      <div className="hidden" aria-hidden>
        <label>
          Nettsted
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && (
        <p className="mt-3 text-sm text-red-600">{state.message}</p>
      )}

      <p className="mt-4 text-xs text-black/50">
        Jeg bruker e-postadressen din bare til å sende deg dette, og deler den
        ikke med andre. Du kan melde deg av når som helst.
      </p>
    </form>
  );
}
