import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SiteAnalytics } from "@/components/site-analytics";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteAnalytics />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
