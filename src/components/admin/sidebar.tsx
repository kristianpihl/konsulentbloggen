"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartIcon, LogoutIcon, PagesIcon, PostsIcon } from "@/components/icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Innlegg", icon: PostsIcon },
  { href: "/admin/sider", label: "Sider", icon: PagesIcon },
  { href: "/admin/analytics", label: "Statistikk", icon: ChartIcon },
] as const;

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    // "Innlegg" skal også være aktiv for opprett/rediger-sidene, men ikke
    // for de andre menypunktene under /admin/.
    return (
      pathname === "/admin" ||
      pathname.startsWith("/admin/new") ||
      /^\/admin\/[^/]+\/edit$/.test(pathname)
    );
  }
  return pathname.startsWith(href);
}

export function AdminSidebar({
  userEmail,
  logoutAction,
}: {
  userEmail: string | null;
  logoutAction: () => void | Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-black/10 bg-white">
      <div className="border-b border-black/10 px-5 py-5">
        <Link href="/admin" className="font-semibold">
          Adminpanel
        </Link>
        {userEmail && (
          <p className="mt-1 truncate text-xs text-black/50">{userEmail}</p>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isNavItemActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-black text-white"
                  : "text-black/70 hover:bg-black/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-black/10 p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-black/70 hover:bg-black/5"
          >
            <LogoutIcon className="h-4 w-4" />
            Logg ut
          </button>
        </form>
      </div>
    </aside>
  );
}
