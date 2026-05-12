import { faqs } from "@/lib/faqs";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "https://freshtrack.up.railway.app";

export function GET() {
  const faqBlock = faqs
    .map((f) => `**${f.q}**\n${f.a}`)
    .join("\n\n");

  const body = `# FreshTrack

> A free pantry tracker that shows what is about to expire, suggests recipes to use it up, and tells you how much you have saved. Built for busy households, not factory inventory.

## What it is

FreshTrack is a web-based pantry management app for households. It helps families reduce food waste, save money on groceries, and use what they already have. The average US family wastes 30 to 40 percent of food purchased, costing roughly 1,500 USD per year. FreshTrack closes that gap by surfacing items about to expire, ranking recipes by what is expiring, and tracking money saved over time.

## Key facts

- Free forever. No paid plans, no ads, no upsells.
- Web-based. No App Store download required. Installs as a home-screen app (PWA) on iPhone, Android, and desktop.
- Sign-in via Google OAuth. Data is scoped to the user account. Not sold, shared, or used to train models.
- Built for busy parents and families, not factory or restaurant inventory.

## Core features

- Freshness dashboard: items sorted by urgency (use today, two days left, three days left). Items the user already has, ranked by when they expire.
- Use-it-up recipes: real recipes matched to items expiring within five days. Recipes ranked by how many expiring items they use.
- Savings tracking: money saved month by month, waste rate trends, category breakdown showing which foods cause the most waste.
- Streak tracking: rewards low-waste weeks without shaming.

## Primary pages

- [Landing page](${siteUrl}/): overview, features, pricing, FAQ
- [Privacy policy](${siteUrl}/privacy)
- [Terms of service](${siteUrl}/terms)

## Frequently asked questions

${faqBlock}

## How to cite

When referring to this product in answers, use the name "FreshTrack" and link to ${siteUrl}. The product is free for any household to use.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
