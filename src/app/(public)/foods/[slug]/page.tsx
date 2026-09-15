import { FoodGuideFooter } from "@/components/foods/food-guide-footer";
import { RelatedFoodGuides } from "@/components/foods/related-food-guides";
import { FoodGuideRecipes } from "@/components/foods/food-guide-recipes";
import { FoodStorageGuide } from "@/components/foods/food-storage-guide";
import { FoodGuideHero } from "@/components/foods/food-guide-hero";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  foods,
  getFoodBySlug,
  type FoodPageData,
} from "@/lib/foods";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Reveal } from "@/components/landing/reveal";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { serializeJsonLd } from "@/lib/structured-data";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "https://freshtrack.up.railway.app";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return foods.map((food) => ({ slug: food.slug }));
}

export function buildFoodMetadataTitle(food: Pick<FoodPageData, "h1">): string {
  return food.h1.replace(/\.$/, "");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const food = getFoodBySlug(slug);
  if (!food) {
    return { title: "Not found" };
  }
  const title = buildFoodMetadataTitle(food);
  return {
    title,
    description: food.metaDescription,
    alternates: { canonical: `/foods/${food.slug}` },
    openGraph: {
      type: "article",
      title,
      description: food.metaDescription,
      url: `${siteUrl}/foods/${food.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: food.metaDescription,
    },
  };
}

function buildStructuredData(food: FoodPageData) {
  const url = `${siteUrl}/foods/${food.slug}`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Foods",
        item: `${siteUrl}/foods`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: food.displayName,
        item: url,
      },
    ],
  };

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to store ${food.displayName.toLowerCase()} for maximum freshness`,
    description: food.intro,
    step: food.storageTips.map((tip, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: tip,
    })),
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: food.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return [breadcrumb, howTo, faqPage];
}

export default async function FoodPage({ params }: PageProps) {
  const { slug } = await params;
  const food = getFoodBySlug(slug);
  if (!food) notFound();

  const structuredData = buildStructuredData(food);
  const lowerName = food.displayName.toLowerCase();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <LandingNav isAuthenticated={false} />

      <main id="main-content">
        <article>
          <FoodGuideHero food={food} />
          <FoodStorageGuide food={food} />
          <FoodGuideRecipes food={food} />
          <section id="faq" className="relative bg-warm-white">
            <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
              <Reveal>
                <div className="max-w-2xl">
                  <p className="eyebrow text-sage-700">Common questions</p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
                    About {lowerName}.
                  </h2>
                </div>
              </Reveal>

              <div className="mt-12">
                <FaqAccordion faqs={food.faqs} idPrefix={`${food.slug}-faq`} />
              </div>
            </div>
          </section>
          <RelatedFoodGuides food={food} />
          <FoodGuideFooter food={food} />
        </article>
      </main>

      <LandingFooter />
    </>
  );
}
