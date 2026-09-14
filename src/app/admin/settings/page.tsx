import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const revalidate = 0;

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="text-xl font-semibold">Fremside</h1>
      <p className="mt-1 text-sm text-black/60">
        Tilpass overordnede elementer på forsiden.
      </p>

      <div className="mt-8 max-w-md">
        <SettingsForm heroImageUrl={settings.hero_image_url} />
      </div>
    </div>
  );
}
