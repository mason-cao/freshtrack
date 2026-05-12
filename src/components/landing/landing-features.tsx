import type { ReactNode } from "react";
import { Reveal } from "./reveal";
import { PreviewDashboard } from "./preview-dashboard";
import { PreviewRecipes } from "./preview-recipes";
import { PreviewStats } from "./preview-stats";

interface FeatureBlockProps {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  preview: ReactNode;
  imageSide: "left" | "right";
}

function FeatureBlock({
  eyebrow,
  title,
  body,
  bullets,
  preview,
  imageSide,
}: FeatureBlockProps) {
  const previewOrder = imageSide === "left" ? "lg:order-1" : "lg:order-2";
  const copyOrder = imageSide === "left" ? "lg:order-2" : "lg:order-1";

  return (
    <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal className={`max-w-xl ${copyOrder}`}>
        <p className="eyebrow text-sage-700">{eyebrow}</p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
          {title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">{body}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-sm text-stone-700">
              <span
                className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sage-500"
                aria-hidden
              />
              <span className="leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={0.1} className={previewOrder}>
        {preview}
      </Reveal>
    </article>
  );
}

export function LandingFeatures() {
  return (
    <section id="features" className="relative bg-warm-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <Reveal>
          <div className="max-w-2xl">
            <p className="eyebrow text-sage-700">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              One small loop, every week.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
              See what&apos;s expiring. Cook around it. Watch the savings stack up.
              That&apos;s the whole product.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 space-y-24 lg:mt-20 lg:space-y-32">
          <FeatureBlock
            eyebrow="01 · See"
            title="See what needs using, not a list of everything."
            body="The dashboard opens to items that are about to expire, sorted by urgency. Spinach today, yogurt tomorrow, the salmon you forgot. The rest of your pantry stays out of the way."
            bullets={[
              "Per-item freshness pills: use today, two days left, three days left.",
              "Add items in seconds while unpacking groceries.",
              "Works on phone and desktop. Installs as a home-screen app, no app store.",
            ]}
            preview={<PreviewDashboard />}
            imageSide="right"
          />

          <FeatureBlock
            eyebrow="02 · Cook"
            title="Cook around what’s expiring, not what’s trending."
            body="Recipes get matched to items expiring within five days. Concrete picks for tonight’s dinner, not abstract meal ideas. The more items a recipe uses, the higher it ranks."
            bullets={[
              "Use-it-up matching across produce, dairy, proteins, and pantry staples.",
              "Real food photography, prep and cook times, serving counts.",
              "Built-in starter recipes. Bring your own coming soon.",
            ]}
            preview={<PreviewRecipes />}
            imageSide="left"
          />

          <FeatureBlock
            eyebrow="03 · Save"
            title="Watch the money come back, week after week."
            body="Mark items used or wasted as they happen. The savings counter goes up. The waste rate goes down. No guilt-tripping, just the numbers, in the smallest honest detail."
            bullets={[
              "Money saved this month, plus a clean monthly trend.",
              "Per-category breakdown: which foods are dragging you down.",
              "Streak tracking that rewards low-waste weeks without shaming the rest.",
            ]}
            preview={<PreviewStats />}
            imageSide="right"
          />
        </div>
      </div>
    </section>
  );
}
