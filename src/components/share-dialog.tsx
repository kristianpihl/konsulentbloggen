"use client";

import { useRef, useState } from "react";
import {
  CloseIcon,
  LinkedInIcon,
  LinkIcon,
  MailIcon,
  MoreIcon,
  ShareIcon,
  XLogoIcon,
} from "@/components/icons";
import { siteConfig } from "@/lib/site-config";

export function ShareDialog({
  title,
  excerpt,
  coverImageUrl,
}: {
  title: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  function open() {
    setUrl(window.location.href);
    setCanNativeShare(typeof navigator.share === "function");
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) close();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Utilgjengelig utklippstavle — ignorer stille.
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // Brukeren avbrøt delingen — ikke noe å gjøre.
    }
  }

  const twitterHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const emailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex flex-col items-center gap-1.5 text-black/60 hover:text-black"
      >
        <ShareIcon />
        <span className="text-xs font-medium tracking-wide">DEL</span>
      </button>

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        className="m-auto w-[92vw] max-w-sm rounded-lg border-none p-0 shadow-xl backdrop:bg-black/40"
      >
        <div className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Del</h2>
            <button
              type="button"
              onClick={close}
              aria-label="Lukk"
              className="text-black/50 hover:text-black"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-black/10">
            {coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- forhåndsvisning i modal, url er dynamisk
              <img
                src={coverImageUrl}
                alt=""
                className="h-32 w-full object-cover"
              />
            )}
            <div className="p-3">
              <p className="font-medium leading-snug">{title}</p>
              {excerpt && (
                <p className="mt-1 line-clamp-2 text-sm text-black/60">
                  {excerpt}
                </p>
              )}
              <p className="mt-2 text-xs text-black/40">{siteConfig.name}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/80"
            >
              <LinkIcon className="h-4 w-4" />
              {copied ? "Lenke kopiert!" : "Kopier lenke"}
            </button>
            <a
              href={twitterHref}
              target="_blank"
              rel="noreferrer"
              aria-label="Del på X"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/15 text-black/70 hover:bg-black/5"
            >
              <XLogoIcon className="h-4 w-4" />
            </a>
            <a
              href={linkedinHref}
              target="_blank"
              rel="noreferrer"
              aria-label="Del på LinkedIn"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/15 text-black/70 hover:bg-black/5"
            >
              <LinkedInIcon className="h-4 w-4" />
            </a>
            <a
              href={emailHref}
              aria-label="Del på e-post"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/15 text-black/70 hover:bg-black/5"
            >
              <MailIcon className="h-4 w-4" />
            </a>
            {canNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                aria-label="Flere delealternativer"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/15 text-black/70 hover:bg-black/5"
              >
                <MoreIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
