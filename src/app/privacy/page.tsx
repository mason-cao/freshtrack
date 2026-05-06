import type { Metadata } from "next";
import Link from "next/link";
import { Database, Leaf, Mail, ShieldCheck, Trash2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "FreshTrack privacy policy for account and pantry data.",
};

const updatedAt = "May 6, 2026";

const sections = [
  {
    icon: ShieldCheck,
    title: "What FreshTrack Collects",
    body: [
      "When you sign in with Google, FreshTrack receives your name, email address, and profile image URL from Google.",
      "FreshTrack also stores the pantry items, recipe records, and used or wasted item history that you add while using the app.",
    ],
  },
  {
    icon: Database,
    title: "Where Data Is Stored",
    body: [
      "FreshTrack stores account and pantry data in Turso. The app runs on Vercel.",
      "FreshTrack uses Google only for authentication. It does not request access to Gmail, Drive, Calendar, or other Google data.",
    ],
  },
  {
    icon: Trash2,
    title: "Sharing And Deletion",
    body: [
      "FreshTrack does not sell your data. It does not share your pantry data with advertisers or data brokers.",
      "To request account or pantry data deletion, email masoncao7@gmail.com from the Google account you used to sign in.",
    ],
  },
  {
    icon: Mail,
    title: "Contact",
    body: [
      "For privacy questions, deletion requests, or data access questions, email masoncao7@gmail.com.",
      "This policy may be updated as FreshTrack changes. The date above shows the latest version.",
    ],
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
            FreshTrack keeps account data and pantry data only for running the product. The goal is simple: keep your pantry list tied to your Google sign-in.
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
