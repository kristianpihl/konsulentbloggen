"use client";

import { useActionState } from "react";
import { CoverImageField } from "@/components/admin/cover-image-field";
import {
  updateSiteSettings,
  type SettingsFormState,
} from "@/app/admin/settings/actions";

export function SettingsForm({
  heroImageUrl,
}: {
  heroImageUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(
    updateSiteSettings,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <CoverImageField
        initialUrl={heroImageUrl}
        name="hero_image_url"
        label="Hovedbilde"
        helpText="Vises som et stort banner øverst på forsiden. Anbefalt bredt format (f.eks. 1600×600). Maks 5 MB."
      />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Lagret.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50"
      >
        {pending ? "Lagrer…" : "Lagre"}
      </button>
    </form>
  );
}
