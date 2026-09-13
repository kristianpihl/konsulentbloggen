import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
