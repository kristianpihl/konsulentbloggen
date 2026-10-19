"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import {
  ALLOWED_RESOURCE_EXTENSIONS,
  MAX_RESOURCE_FILES,
  MAX_RESOURCE_FILE_BYTES,
  RESOURCE_BUCKET,
  formatFileSize,
} from "@/types/resource";
import type { ResourceFile } from "@/types/resource";

export function FileAttachmentsField({
  initialFiles,
}: {
  initialFiles?: ResourceFile[];
}) {
  const [files, setFiles] = useState<ResourceFile[]>(initialFiles ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.length === 0) return;

    if (files.length + selected.length > MAX_RESOURCE_FILES) {
      setError(`Du kan ha maks ${MAX_RESOURCE_FILES} filer per mal.`);
      return;
    }

    setError("");
    setUploading(true);

    const supabase = createClient();
    const uploaded: ResourceFile[] = [];

    for (const file of selected) {
      const dot = file.name.lastIndexOf(".");
      const base = dot > 0 ? file.name.slice(0, dot) : file.name;
      const extension = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : "";

      if (!ALLOWED_RESOURCE_EXTENSIONS.includes(extension)) {
        setError(
          `«${file.name}» har en filtype som ikke er tillatt. Tillatt: ${ALLOWED_RESOURCE_EXTENSIONS.join(", ")}.`,
        );
        continue;
      }
      if (file.size > MAX_RESOURCE_FILE_BYTES) {
        setError(`«${file.name}» er større enn 25 MB.`);
        continue;
      }

      const path = `${crypto.randomUUID()}/${slugify(base) || "fil"}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(RESOURCE_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError(`Opplasting av «${file.name}» feilet: ${uploadError.message}`);
        continue;
      }

      const { data } = supabase.storage.from(RESOURCE_BUCKET).getPublicUrl(path);
      uploaded.push({
        name: file.name,
        path,
        url: data.publicUrl,
        size: file.size,
        type: file.type || extension,
      });
    }

    setFiles((current) => [...current, ...uploaded]);
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-sm font-medium">Vedlegg</label>
      <input type="hidden" name="files" value={JSON.stringify(files)} />

      {files.length > 0 && (
        <ul className="mt-2 divide-y divide-black/10 rounded-md border border-black/10">
          {files.map((file) => (
            <li
              key={file.path}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">
                {file.name}{" "}
                <span className="text-black/40">({formatFileSize(file.size)})</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  setFiles((current) => current.filter((item) => item.path !== file.path))
                }
                className="shrink-0 text-red-600 hover:text-red-800"
              >
                Fjern
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mt-2 w-full rounded-md border border-dashed border-black/20 px-3 py-5 text-sm text-black/50 hover:border-black/40 disabled:opacity-50"
      >
        {uploading ? "Laster opp…" : "Klikk for å legge til filer"}
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_RESOURCE_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
        onChange={handleFilesChange}
        className="hidden"
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-black/50">
        Filene vises som nedlastinger på siden. Maks {MAX_RESOURCE_FILES} filer,
        25 MB hver. Husk å lagre etter at du har lagt til eller fjernet filer.
      </p>
    </div>
  );
}
