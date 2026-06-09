import { faqs } from "@/lib/faqs";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { headers } from "next/headers";
import { Reveal } from "./reveal";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

export async function LandingFaq() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <section id="faq" className="relative bg-cream">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <Reveal>
          <div className="max-w-2xl">
            <p className="eyebrow text-sage-700">Common questions</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              What busy families ask first.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
              The honest answers, before you sign in.
            </p>
          </div>
        </Reveal>

        <div className="mt-12">
          <FaqAccordion faqs={faqs} idPrefix="landing-faq" />
        </div>
      </div>
    </section>
  );
}
