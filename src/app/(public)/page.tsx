import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingProblem } from "@/components/landing/landing-problem";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingGuides } from "@/components/landing/landing-guides";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { serializeJsonLd } from "@/lib/structured-data";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "https://freshtrack.up.railway.app";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FreshTrack",
    url: siteUrl,
    logo: `${siteUrl}/icon-512.png`,
    description:
      "FreshTrack helps busy households reduce food waste, save money, and use what they already have.",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FreshTrack",
    url: siteUrl,
    inLanguage: "en-US",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FreshTrack",
    applicationCategory: "LifestyleApplication",
    applicationSubCategory: "Kitchen & Food Management",
    operatingSystem: "Web, iOS (PWA), Android (PWA)",
    url: siteUrl,
    description:
      "FreshTrack is a free pantry tracker that shows what is about to go bad, suggests recipes to use it up, and tracks estimated savings.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Track pantry items with per-item freshness dates",
      "Look up supported groceries after scanning a barcode",
      "Recipe suggestions matched to ingredients about to expire",
      "Searchable recipe catalog ranked by expiring ingredients",
      "Estimated money saved and waste-rate tracking",
      "Installable home-screen web app",
    ],
    isAccessibleForFree: true,
  },
];

export const metadata: Metadata = {
  title: "FreshTrack. Stop throwing out groceries. Save money. Waste less food.",
  description:
    "A free pantry tracker that shows what’s about to expire, suggests recipes to use it up, and tells you how much you’ve saved. Built for busy households.",
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <LandingNav isAuthenticated={false} />
      <main id="main-content">
        <LandingHero isAuthenticated={false} />
        <LandingProblem />
        <LandingFeatures />
        <LandingFaq />
        <LandingGuides />
        <LandingCta isAuthenticated={false} />
      </main>
      <LandingFooter />
    </>
  );
}
