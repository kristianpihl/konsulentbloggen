"use client";

import { useActionState, useState } from "react";
import { slugify } from "@/lib/slugify";
import { CoverImageField } from "@/components/admin/cover-image-field";
import { ContentEditor } from "@/components/admin/content-editor";
import type { Post } from "@/types/post";
import { nextFreeSlot } from "@/app/admin/actions";
import { isInFuture, isoToOsloLocal } from "@/lib/schedule";
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
  const [alreadyLive] = useState(
    post?.status === "published" && !!post.published_at && !isInFuture(post.published_at),
  );
  const [mode, setMode] = useState<"draft" | "now" | "scheduled">(
    post?.status !== "published"
      ? "draft"
      : alreadyLive
        ? "now"
        : "scheduled",
  );
  const [publishAt, setPublishAt] = useState(
    post?.published_at ? isoToOsloLocal(post.published_at) : "",
  );
  const [findingSlot, setFindingSlot] = useState(false);

  async function pickThursdaySlot() {
    setFindingSlot(true);
    const slot = await nextFreeSlot(post?.id);
    setFindingSlot(false);
    if (slot) setPublishAt(slot);
  }

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

      <fieldset>
        <legend className="block text-sm font-medium">Publisering</legend>
        <input type="hidden" name="status" value={mode === "draft" ? "draft" : "published"} />
        <input type="hidden" name="publish_now" value={mode === "now" ? "1" : ""} />

        <div className="mt-2 space-y-2">
          {(
            [
              ["draft", "Utkast", "Vises ikke på siden."],
              [
                "now",
                alreadyLive ? "Publisert" : "Publiser nå",
                alreadyLive
                  ? "Innlegget er allerede synlig på siden."
                  : "Synlig på siden så snart du lagrer.",
              ],
              ["scheduled", "Planlegg", "Dukker opp av seg selv på tidspunktet du velger."],
            ] as const
          ).map(([value, label, hint]) => (
            <label key={value} className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="radio"
                name="publish_mode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
                className="mt-1"
              />
              <span>
                <span className="font-medium">{label}</span>
                <span className="block text-xs text-black/50">{hint}</span>
              </span>
            </label>
          ))}
        </div>

        {mode === "scheduled" && (
          <div className="mt-4">
            <label htmlFor="publish_at" className="block text-sm font-medium">
              Publiseringstidspunkt (norsk tid)
            </label>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <input
                id="publish_at"
                name="publish_at"
                type="datetime-local"
                required
                value={publishAt}
                onChange={(event) => setPublishAt(event.target.value)}
                className="rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
              />
              <button
                type="button"
                onClick={pickThursdaySlot}
                disabled={findingSlot}
                className="rounded-md border border-black/15 px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
              >
                {findingSlot ? "Finner tidspunkt…" : "Neste ledige torsdag kl. 09:00"}
              </button>
            </div>
          </div>
        )}
      </fieldset>

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
