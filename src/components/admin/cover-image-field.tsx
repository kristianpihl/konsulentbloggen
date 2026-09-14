"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function CoverImageField({
  initialUrl,
  name = "cover_image_url",
  label = "Forsidebilde",
  helpText = "Valgfritt. Vises i blogglisten og øverst i innlegget. Maks 5 MB.",
}: {
  initialUrl?: string | null;
  name?: string;
  label?: string;
  helpText?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Filen må være et bilde.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
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
    setUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="mt-2 space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- forhåndsvisning av opplastet Supabase Storage-bilde, url er dynamisk per prosjekt */}
          <img
            src={url}
            alt=""
            className="h-40 w-full rounded-md border border-black/10 object-cover"
          />
          <div className="flex gap-4 text-sm">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-black/70 hover:text-black disabled:opacity-50"
            >
              {uploading ? "Laster opp…" : "Bytt bilde"}
            </button>
            <button
              type="button"
              onClick={() => setUrl("")}
              className="text-red-600 hover:text-red-800"
            >
              Fjern
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-1 w-full rounded-md border border-dashed border-black/20 px-3 py-6 text-sm text-black/50 hover:border-black/40 disabled:opacity-50"
        >
          {uploading ? "Laster opp…" : "Klikk for å laste opp bilde"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-black/50">{helpText}</p>
    </div>
  );
}
