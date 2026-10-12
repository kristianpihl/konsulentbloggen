"use client";

import { useActionState, useState } from "react";
import { createDraftFromBuilder, type BuilderState } from "@/app/admin/bygger/actions";
import { MAX_BUILDER_INPUT_LENGTH } from "@/lib/content-builder";

function CountedTextarea({
  id,
  name,
  label,
  help,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  help: string;
  placeholder: string;
}) {
  const [value, setValue] = useState("");

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
        <span className="text-xs text-black/50">
          {value.length} / {MAX_BUILDER_INPUT_LENGTH}
        </span>
      </div>
      <textarea
        id={id}
        name={name}
        rows={5}
        required
        maxLength={MAX_BUILDER_INPUT_LENGTH}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
      />
      <p className="mt-1 text-xs text-black/50">{help}</p>
    </div>
  );
}

export function BuilderForm({ categories }: { categories: readonly string[] }) {
  const [state, formAction, pending] = useActionState<BuilderState, FormData>(
    createDraftFromBuilder,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <CountedTextarea
        id="problem"
        name="problem"
        label="Problem eller situasjon"
        help="Beskriv situasjonen slik den oppleves. Artikkelen starter her."
        placeholder="F.eks.: Teamet har sprintdemo hver fjortende dag, men ingen forbereder seg og få dukker opp…"
      />

      <CountedTextarea
        id="solution"
        name="solution"
        label="Løsning"
        help="Hva er løsningen eller de viktigste grepene? Stikkord holder."
        placeholder="F.eks.: Gjør demoen kort, la én person vise ekte bruk, inviter en bruker…"
      />

      <div>
        <label htmlFor="category" className="block text-sm font-medium">
          Kategori
        </label>
        <select
          id="category"
          name="category"
          defaultValue=""
          className="mt-1 rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
        >
          <option value="">Ingen</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50"
      >
        {pending ? "Lager utkast…" : "Lag utkast"}
      </button>
    </form>
  );
}
