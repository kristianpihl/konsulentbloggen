"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MAX_POST_CONTENT_LENGTH } from "@/types/post";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const EMOJIS = [
  "😀", "😂", "😉", "🙂", "😍", "🤔", "😅", "🙌",
  "👍", "👏", "💪", "🙏", "❤️", "🔥", "✨", "🎉",
  "🚀", "💡", "📌", "✅", "⚠️", "📈", "📉", "🧠",
];

export function ContentEditor({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function insertAtCursor(text: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      setValue((current) => (current + text).slice(0, MAX_POST_CONTENT_LENGTH));
      return;
    }

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const next = (
      value.slice(0, start) +
      text +
      value.slice(end)
    ).slice(0, MAX_POST_CONTENT_LENGTH);

    setValue(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const position = Math.min(start + text.length, next.length);
      textarea.setSelectionRange(position, position);
    });
  }

  async function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Filen må være et bilde.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("Bildet må være under 5 MB.");
      return;
    }

    setError("");
    setUploading(true);

    const supabase = createClient();
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError(`Opplasting feilet: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    insertAtCursor(`\n\n![](${data.publicUrl})\n\n`);
    setUploading(false);
  }

  const remaining = MAX_POST_CONTENT_LENGTH - value.length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor="content" className="block text-sm font-medium">
          Innhold (Markdown)
        </label>
        <span
          className={`text-xs ${remaining < 0 ? "font-medium text-red-600" : "text-black/50"}`}
        >
          {value.length} / {MAX_POST_CONTENT_LENGTH} tegn
        </span>
      </div>

      <div className="mt-1 flex items-center gap-4 text-sm">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-black/70 hover:text-black disabled:opacity-50"
        >
          {uploading ? "Laster opp…" : "+ Sett inn bilde"}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="text-black/70 hover:text-black"
          >
            + Sett inn emoji
          </button>
          {showEmoji && (
            <div className="absolute z-10 mt-1 grid w-56 grid-cols-8 gap-0.5 rounded-md border border-black/15 bg-white p-2 shadow-md">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    insertAtCursor(emoji);
                    setShowEmoji(false);
                  }}
                  className="rounded p-1 text-lg hover:bg-black/5"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      <textarea
        ref={textareaRef}
        id="content"
        name="content"
        rows={16}
        required
        maxLength={MAX_POST_CONTENT_LENGTH}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-2 w-full rounded-md border border-black/15 px-3 py-2 font-mono text-sm outline-none focus:border-black/40"
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-black/50">
        Bruk Markdown for formatering. Bilder du setter inn her limes inn
        som <code>![](url)</code> der markøren står, og vises midt i
        artikkelen — ikke bare øverst.
      </p>
    </div>
  );
}
