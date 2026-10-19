"use client";

import { useActionState, useState } from "react";
import { CoverImageField } from "@/components/admin/cover-image-field";
import { FileAttachmentsField } from "@/components/admin/file-attachments-field";
import { slugify } from "@/lib/slugify";
import { MAX_RESOURCE_CONTENT_LENGTH, RESOURCE_KINDS } from "@/types/resource";
import type { Resource } from "@/types/resource";
import type { ResourceFormState } from "@/app/admin/maler/actions";

export function ResourceForm({
  action,
  resource,
  submitLabel,
}: {
  action: (prevState: ResourceFormState, formData: FormData) => Promise<ResourceFormState>;
  resource?: Resource;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [title, setTitle] = useState(resource?.title ?? "");
  const [content, setContent] = useState(resource?.content ?? "");

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
          defaultValue={resource?.title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="kind" className="block text-sm font-medium">
            Type
          </label>
          <select
            id="kind"
            name="kind"
            defaultValue={resource?.kind ?? "mal"}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
          >
            {RESOURCE_KINDS.map((kind) => (
              <option key={kind.value} value={kind.value}>
                {kind.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium">
            Slug (URL)
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={resource?.slug}
            placeholder={slugify(title) || "genereres-fra-tittel"}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 font-mono text-sm outline-none focus:border-black/40"
          />
          <p className="mt-1 text-xs text-black/50">
            Blir kristianpihl.no/maler/{resource?.slug || slugify(title) || "slug"}.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium">
          Kort beskrivelse
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={resource?.excerpt ?? ""}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
        />
        <p className="mt-1 text-xs text-black/50">Vises i listen og øverst på siden.</p>
      </div>

      <CoverImageField
        initialUrl={resource?.cover_image_url}
        helpText="Valgfritt. Vises i listen og øverst på siden. Anbefalt 16:9. Maks 5 MB."
      />

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="content" className="block text-sm font-medium">
            Slik bruker du den (Markdown)
          </label>
          <span className="text-xs text-black/50">
            {content.length} / {MAX_RESOURCE_CONTENT_LENGTH}
          </span>
        </div>
        <textarea
          id="content"
          name="content"
          rows={18}
          required
          maxLength={MAX_RESOURCE_CONTENT_LENGTH}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 font-mono text-sm outline-none focus:border-black/40"
        />
        <p className="mt-1 text-xs text-black/50">
          Bruk <code>##</code> foran overskrifter. Forklar hva malen er til for,
          når du bruker den, og hvordan.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="best_for" className="block text-sm font-medium">
            Passer best for
          </label>
          <textarea
            id="best_for"
            name="best_for"
            rows={4}
            defaultValue={(resource?.best_for ?? []).join("\n")}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
          />
          <p className="mt-1 text-xs text-black/50">Én per linje, for eksempel «Rekruttering».</p>
        </div>
        <div>
          <label htmlFor="key_features" className="block text-sm font-medium">
            Nøkkelfunksjoner
          </label>
          <textarea
            id="key_features"
            name="key_features"
            rows={4}
            defaultValue={(resource?.key_features ?? []).join("\n")}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
          />
          <p className="mt-1 text-xs text-black/50">Én per linje, for eksempel «Team-kart».</p>
        </div>
      </div>

      <FileAttachmentsField initialFiles={resource?.files} />

      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={resource?.status ?? "draft"}
          className="mt-1 rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
        >
          <option value="draft">Utkast (ikke synlig)</option>
          <option value="published">Publisert</option>
        </select>
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
