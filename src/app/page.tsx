import type { Metadata } from "next";
import { auth } from "@/auth";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingProblem } from "@/components/landing/landing-problem";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
  title: "FreshTrack. Stop throwing out groceries. Save money. Waste less food.",
  description:
    "A free pantry tracker that shows what’s about to expire, suggests recipes to use it up, and tells you how much you’ve saved. Built for busy households.",
  alternates: { canonical: "/" },
};

export default async function LandingPage() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);

  return (
    <>
      <LandingNav isAuthenticated={isAuthenticated} />
      <main id="main-content">
        <LandingHero isAuthenticated={isAuthenticated} />
        <LandingProblem />
        <LandingFeatures />
        <LandingFaq />
        <LandingCta isAuthenticated={isAuthenticated} />
      </main>
      <LandingFooter />
    </>
  );
}
