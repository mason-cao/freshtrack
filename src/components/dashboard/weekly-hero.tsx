"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import Image from "next/image";
import { getHeroImage } from "@/lib/food-images";

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${prefix}${Math.round(v)}`);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [count, value]);

  return <motion.span>{rounded}</motion.span>;
}

interface WeeklyHeroProps {
  used: number;
  wasted: number;
  saved: number;
}

function getWeekRange(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(weekStart)} – ${fmt(weekEnd)}`;
}

// Inline SVG turbulence, base64-ish encoded. Higher contrast than the
// body-level grain so it reads through the deep sage panel.
const grainTile =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='2' stitchTiles='stitch' seed='9'/><feColorMatrix values='0 0 0 0 0.95 0 0 0 0 0.92 0 0 0 0 0.78 0 0 0 0.7 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")";

export function WeeklyHero({ used, wasted, saved }: WeeklyHeroProps) {
  const total = used + wasted;
  const useRate = total > 0 ? Math.round((used / total) * 100) : 0;
  const heroImage = getHeroImage("seasonal produce", "Produce");

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.05 }}
      className="relative isolate overflow-hidden rounded-3xl text-sage-50 shadow-warm-lg"
    >
      {/* Layer 1: base sage gradient — adds depth across the diagonal */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-sage-600 via-sage-700 to-sage-800"
      />

      {/* Layer 2: warm "window light" radial in upper-left, gives the
          display number an implied light source */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 14% 18%, rgba(252, 211, 77, 0.18), rgba(217, 119, 6, 0.04) 40%, transparent 70%)",
        }}
      />

      {/* Layer 3: amber-cream glow specifically behind the display number */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="absolute pointer-events-none"
        style={{
          left: "8%",
          top: "30%",
          width: "320px",
          height: "320px",
          background:
            "radial-gradient(circle, rgba(253, 230, 138, 0.22), transparent 65%)",
          filter: "blur(6px)",
        }}
      />

      {/* Layer 4: vignette toward the bottom corners for grounded depth */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 140% 110% at 50% 35%, transparent 55%, rgba(16, 25, 16, 0.45) 100%)",
        }}
      />

      {/* Layer 5: grain texture, blended for tactile depth */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.09] mix-blend-overlay"
        style={{
          backgroundImage: grainTile,
          backgroundSize: "220px 220px",
        }}
      />

      <div className="relative grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative p-6 sm:p-8 xl:p-10">
          <p className="eyebrow text-amber-100/70">
            Weekly ledger · {getWeekRange()}
          </p>

          <div className="mt-7 flex items-end gap-2">
            <motion.span
              initial={{ scale: 1.04, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="num font-bold leading-[0.85] tracking-[-0.03em] text-warm-white text-[clamp(4rem,11vw,7rem)]"
            >
              <AnimatedNumber value={useRate} />
            </motion.span>
            <span className="pb-3 text-3xl font-semibold text-amber-200/80">
              %
            </span>
          </div>

          <p className="mt-3 max-w-md text-base leading-7 text-sage-100/85 xl:text-lg xl:leading-8">
            {total > 0
              ? "of what you logged this week became meals, not waste."
              : "Mark items used or wasted to start your weekly ledger."}
          </p>

          <div className="mt-9 grid grid-cols-3 divide-x divide-sage-500/30 border-t border-sage-500/30 pt-5">
            <div className="pr-3 sm:pr-4">
              <p className="eyebrow text-sage-200/70">Used</p>
              <p className="num mt-1.5 text-2xl font-bold text-warm-white xl:text-3xl">
                <AnimatedNumber value={used} />
              </p>
            </div>
            <div className="px-3 sm:px-4">
              <p className="eyebrow text-sage-200/70">Wasted</p>
              <p className="num mt-1.5 text-2xl font-bold text-warm-white xl:text-3xl">
                <AnimatedNumber value={wasted} />
              </p>
            </div>
            <div className="pl-3 sm:pl-4">
              <p className="eyebrow text-amber-200/90">Saved</p>
              <p className="num mt-1.5 text-2xl font-bold text-amber-100 xl:text-3xl">
                <AnimatedNumber value={saved} prefix="$" />
              </p>
            </div>
          </div>
        </div>

        <div className="relative hidden h-full min-h-[360px] lg:block">
          <Image
            src={heroImage}
            alt="Fresh produce on a counter"
            fill
            sizes="(min-width: 1280px) 45vw, (min-width: 1024px) 50vw, 0px"
            className="object-cover"
            priority
            quality={90}
          />
          {/* Seam fade — keep the left edge merged with the sage panel,
              but let the right ~55% of the photo breathe at full strength */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[55%]"
            style={{
              background:
                "linear-gradient(to right, rgba(46, 71, 46, 0.95) 0%, rgba(46, 71, 46, 0.55) 35%, rgba(46, 71, 46, 0.18) 70%, transparent 100%)",
            }}
          />
          {/* Soft top-and-bottom photo darkening for editorial mood */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(31, 48, 31, 0.18) 0%, transparent 30%, transparent 70%, rgba(31, 48, 31, 0.28) 100%)",
            }}
          />
        </div>
      </div>
    </motion.section>
  );
}
