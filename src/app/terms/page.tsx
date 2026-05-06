import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, FileText, Leaf, Mail, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "FreshTrack terms of service.",
};

const updatedAt = "May 6, 2026";

const sections = [
  {
    icon: FileText,
    title: "Using FreshTrack",
    body: [
      "FreshTrack is a pantry tracking app for personal household use. You are responsible for the items, dates, and notes you enter.",
      "FreshTrack may change, pause, or remove features as the product evolves.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "No Warranty",
    body: [
      "FreshTrack is provided as is, without warranties of any kind.",
      "Expiration dates, recipe suggestions, and savings estimates are informational. Use your own judgment before eating, cooking, or discarding food.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Accounts And Data",
    body: [
      "FreshTrack uses Google sign-in. Do not use another person's Google account or attempt to access another user's pantry data.",
      "FreshTrack may delete inactive accounts and associated pantry data after 12 months without sign-in activity.",
    ],
  },
  {
    icon: Mail,
    title: "Contact",
    body: [
      "For questions about these terms or requests related to your account, email masoncao7@gmail.com.",
      "FreshTrack may update these terms. Continued use after an update means you accept the current terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="bg-cream px-4 py-10 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-sage-700">
          <Leaf className="h-4 w-4" />
          FreshTrack
        </Link>

        <header className="mt-8 rounded-2xl border border-warm-100 bg-warm-white p-6 shadow-warm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-sage-700">
            Last updated {updatedAt}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
            These terms cover the public FreshTrack app, Google sign-in, and personal pantry tracking.
          </p>
        </header>

        <div className="mt-5 space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.title}
                className="rounded-xl border border-warm-100 bg-warm-white p-5 shadow-warm-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-sage-50 p-2 text-sage-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-stone-900">{section.title}</h2>
                    <div className="mt-2 space-y-2 text-sm leading-6 text-stone-600">
                      {section.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </article>
    </main>
  );
}
