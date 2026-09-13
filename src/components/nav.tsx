import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Nav() {
  return (
    <header className="border-b border-black/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <nav className="flex gap-6 text-sm text-black/70">
          <Link href="/blog" className="hover:text-black">
            Blogg
          </Link>
          <Link href="/om" className="hover:text-black">
            Om meg
          </Link>
        </nav>
      </div>
    </header>
  );
}
