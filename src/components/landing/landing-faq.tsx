"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/lib/faqs";
import { Reveal } from "./reveal";

const EASE_OUT_QUART = [0.16, 1, 0.3, 1] as const;

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

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <section id="faq" className="relative bg-cream">
      <script
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

        <dl className="mt-12 divide-y divide-warm-100 border-y border-warm-100">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={faq.q} delay={0.05 * i}>
                <div className="py-2">
                  <dt>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      className="group flex w-full items-center justify-between gap-6 py-4 text-left transition-colors duration-200 hover:text-sage-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                    >
                      <span className="text-base font-semibold text-stone-900 group-hover:text-sage-700 sm:text-lg">
                        {faq.q}
                      </span>
                      <motion.span
                        aria-hidden
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.35, ease: EASE_OUT_QUART }}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warm-white text-sage-700 ring-1 ring-warm-100 transition-colors duration-200 group-hover:bg-sage-50 group-hover:ring-sage-100"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </button>
                  </dt>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.dd
                        id={`faq-panel-${i}`}
                        initial={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, height: 0 }
                        }
                        animate={
                          reduceMotion
                            ? { opacity: 1 }
                            : { opacity: 1, height: "auto" }
                        }
                        exit={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, height: 0 }
                        }
                        transition={{ duration: 0.4, ease: EASE_OUT_QUART }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pr-12 text-base leading-relaxed text-stone-600 sm:text-lg">
                          {faq.a}
                        </p>
                      </motion.dd>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
