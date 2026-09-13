import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="font-semibold">
            Adminpanel
          </Link>
          <div className="flex items-center gap-4 text-sm text-black/60">
            <Link href="/" className="hover:text-black">
              Se siden ↗
            </Link>
            {user && (
              <>
                <span className="hidden sm:inline">{user.email}</span>
                <form action={logout}>
                  <button type="submit" className="hover:text-black">
                    Logg ut
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
