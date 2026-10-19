import ReactMarkdown from "react-markdown";
import { CategoryIcon } from "@/components/category-icons";
import { ChevronDownIcon } from "@/components/icons";
import { parseAboutContent } from "@/lib/about";
import { siteConfig } from "@/lib/site-config";
import type { StaticPage } from "@/types/page";

const PROSE =
  "prose prose-neutral max-w-none prose-headings:font-semibold prose-a:text-black prose-a:underline";

export function AboutPage({ page }: { page: StaticPage }) {
  const { intro, sections, extras } = parseAboutContent(page.content);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div className="lg:sticky lg:top-8 lg:self-start">
          {page.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- bilde-URL kommer fra Supabase Storage, varierer per prosjekt
            <img
              src={page.cover_image_url}
              alt={siteConfig.name}
              className="mx-auto aspect-[4/5] w-full max-w-sm rounded-2xl border border-black/10 object-cover lg:max-w-none"
            />
          ) : (
            <div className="aspect-[4/5] w-full rounded-2xl border border-black/10 bg-neutral-100" />
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {siteConfig.name}
          </h1>

          {intro && (
            <div className={`${PROSE} mt-6 prose-lg prose-p:leading-relaxed`}>
              <ReactMarkdown>{intro}</ReactMarkdown>
            </div>
          )}

          <h2 className="mt-12 text-xs font-semibold uppercase tracking-wider text-black/55">
            Kompetanse
          </h2>
          <div className="mt-4 space-y-3">
            {sections.map((section) => (
              <details
                key={section.title}
                name="kompetanse"
                className="group rounded-2xl border border-black/15 bg-white open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-3 text-lg font-bold tracking-tight">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black text-white">
                      <CategoryIcon category={section.title} className="h-[18px] w-[18px]" />
                    </span>
                    {section.title}
                  </span>
                  <ChevronDownIcon className="h-5 w-5 shrink-0 text-black/50 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-black/10 px-5 pb-5 pt-4">
                  {section.body ? (
                    <div className={PROSE}>
                      <ReactMarkdown>{section.body}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-black/50">Teksten kommer.</p>
                  )}
                </div>
              </details>
            ))}
          </div>

          {extras.map((extra) => (
            <section key={extra.title} className="mt-12">
              <h2 className="text-2xl font-semibold tracking-tight">{extra.title}</h2>
              <div className={`${PROSE} mt-4`}>
                <ReactMarkdown>{extra.body}</ReactMarkdown>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
