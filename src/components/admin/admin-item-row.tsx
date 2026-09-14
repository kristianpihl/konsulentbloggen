import type { ReactNode } from "react";
import Link from "next/link";
import { DeletePostButton } from "@/components/admin/delete-post-button";

// Delt rad-layout for admin-lister (innlegg og sider) — samme
// miniatyrbilde + tittel + metadata + rediger/slett-mønster begge steder.
export function AdminItemRow({
  imageUrl,
  title,
  meta,
  editHref,
  deleteAction,
  deleteConfirmMessage,
}: {
  imageUrl: string | null;
  title: string;
  meta: ReactNode;
  editHref: string;
  deleteAction: () => void | Promise<void>;
  deleteConfirmMessage?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
          <img
            src={imageUrl}
            alt=""
            className="h-12 w-14 shrink-0 rounded-md border border-black/10 object-cover"
          />
        ) : (
          <div className="h-12 w-14 shrink-0 rounded-md border border-black/10 bg-black/5" />
        )}
        <div className="min-w-0">
          <p className="truncate font-medium">{title}</p>
          <p className="mt-0.5 text-xs text-black/50">{meta}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm">
        <Link href={editHref} className="text-black/70 hover:text-black">
          Rediger
        </Link>
        <form action={deleteAction}>
          <DeletePostButton confirmMessage={deleteConfirmMessage} />
        </form>
      </div>
    </div>
  );
}
