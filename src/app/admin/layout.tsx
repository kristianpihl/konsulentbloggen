import { AdminSidebar } from "@/components/admin/sidebar";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Ikke innlogget (f.eks. /admin/login) — vis uten sidepanel.
    return <div className="min-h-screen bg-neutral-50">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar userEmail={user.email ?? null} logoutAction={logout} />
      <main className="flex-1 px-8 py-10">{children}</main>
    </div>
  );
}
