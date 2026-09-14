"use client";

import { useActionState, useState } from "react";
import { CoverImageField } from "@/components/admin/cover-image-field";
import { slugify } from "@/lib/slugify";
import type { StaticPage } from "@/types/page";
import type { PageFormState } from "@/app/admin/sider/actions";

export function PageForm({
  action,
  page,
  submitLabel,
}: {
  action: (prevState: PageFormState, formData: FormData) => Promise<PageFormState>;
  page?: StaticPage;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [title, setTitle] = useState(page?.title ?? "");

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Tittel
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={page?.title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
        />
        <p className="mt-1 text-xs text-black/50">
          Vises også som lenketekst i toppmenyen.
        </p>
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium">
          Slug (URL)
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={page?.slug}
          placeholder={slugify(title) || "genereres-fra-tittel"}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 font-mono text-sm outline-none focus:border-black/40"
        />
        <p className="mt-1 text-xs text-black/50">
          Siden blir tilgjengelig på kristianpihl.no/
          {page?.slug || slugify(title) || "slug"}. La stå tom for å generere
          automatisk fra tittelen.
        </p>
      </div>

      <CoverImageField
        initialUrl={page?.cover_image_url}
        helpText="Valgfritt. Vises øverst på siden. Maks 5 MB."
      />

      <div>
        <label htmlFor="content" className="block text-sm font-medium">
          Innhold (Markdown)
        </label>
        <textarea
          id="content"
          name="content"
          rows={16}
          required
          defaultValue={page?.content ?? ""}
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
        {pending ? "Lagrer…" : submitLabel}
      </button>
    </form>
  );
}
