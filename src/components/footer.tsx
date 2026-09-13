import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-black/10">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-6 py-8 text-sm text-black/60 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <div className="flex gap-4">
          <a href={`mailto:${siteConfig.email}`} className="hover:text-black">
            {siteConfig.email}
          </a>
          <a
            href={siteConfig.linkedin}
            target="_blank"
            rel="noreferrer"
            className="hover:text-black"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
