"use client";

import { useActionState, useState } from "react";
import { slugify } from "@/lib/slugify";
import { CoverImageField } from "@/components/admin/cover-image-field";
import { ContentEditor } from "@/components/admin/content-editor";
import type { Post } from "@/types/post";
import type { PostFormState } from "@/app/admin/actions";

export function PostForm({
  action,
  post,
  submitLabel,
}: {
  action: (prevState: PostFormState, formData: FormData) => Promise<PostFormState>;
  post?: Post;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [title, setTitle] = useState(post?.title ?? "");

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
          defaultValue={post?.title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium">
          Slug (URL)
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={post?.slug}
          placeholder={slugify(title) || "genereres-fra-tittel"}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 font-mono text-sm outline-none focus:border-black/40"
        />
        <p className="mt-1 text-xs text-black/50">
          La stå tom for å generere automatisk fra tittelen.
        </p>
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium">
          Kort ingress
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt ?? ""}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
        />
      </div>

      <CoverImageField initialUrl={post?.cover_image_url} />

      <ContentEditor defaultValue={post?.content ?? ""} />

      <div>
        <label htmlFor="tags" className="block text-sm font-medium">
          Tags (kommaseparert)
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={post?.tags.join(", ") ?? ""}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={post?.status ?? "draft"}
          className="mt-1 rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
        >
          <option value="draft">Utkast</option>
          <option value="published">Publisert</option>
        </select>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-700">Lagret.</p>
      )}

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
