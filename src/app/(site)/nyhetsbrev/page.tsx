import type { Metadata } from "next";
import { MailIcon } from "@/components/icons";
import { NewsletterForm } from "@/components/newsletter-form";

export const metadata: Metadata = {
  title: "Nyhetsbrev",
};

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-md">
        <MailIcon className="h-6 w-6 text-black/40" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Nyhetsbrev
        </h1>
        <p className="mt-2 text-black/60">
          Få en e-post når jeg publiserer nye artikler, maler eller verktøy.
        </p>

        <NewsletterForm />
      </div>
    </div>
  );
}
