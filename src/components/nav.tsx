import Link from "next/link";
import { MailIcon, SearchIcon } from "@/components/icons";
import { getPagesForNav } from "@/lib/pages";
import { siteConfig } from "@/lib/site-config";

export async function Nav() {
  const pages = await getPagesForNav();

  return (
    <header className="border-b border-black/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-6 text-sm text-black/70">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/${page.slug}`}
              className="hover:text-black"
            >
              {page.title}
            </Link>
          ))}
          <Link
            href="/sok"
            aria-label="Søk"
            className="hover:text-black"
          >
            <SearchIcon />
          </Link>
          <Link
            href="/nyhetsbrev"
            aria-label="Nyhetsbrev"
            className="hover:text-black"
          >
            <MailIcon />
          </Link>
          <Link href="/admin" className="text-black/40 hover:text-black">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
