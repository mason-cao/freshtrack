"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import Image from "next/image";
import { getDashboardHeroImage } from "@/lib/food-images";

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

function Stat({
  label,
  value,
  prefix = "",
  accent = false,
}: {
  label: string;
  value: number;
  prefix?: string;
  accent?: boolean;
}) {
  return (
    <div className="px-4 py-3.5 sm:px-5">
      <p className="eyebrow text-warm-white/65">{label}</p>
      <p
        className={`num mt-1.5 text-2xl font-bold xl:text-[1.75rem] ${
          accent ? "text-amber-100" : "text-warm-white"
        }`}
      >
        <AnimatedNumber value={value} prefix={prefix} />
      </p>
    </div>
  );
}

export function WeeklyHero({ used, wasted, saved }: WeeklyHeroProps) {
  const total = used + wasted;
  const useRate = total > 0 ? Math.round((used / total) * 100) : 0;
  const heroImage = getDashboardHeroImage();

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.05 }}
      className="relative isolate overflow-hidden rounded-3xl text-sage-50 shadow-warm-lg ring-1 ring-inset ring-white/10"
    >
      {/* Full-bleed photo — the panel is composed on top of the picture */}
      <Image
        src={heroImage}
        alt="A fresh, healthy meal on a rustic table"
        fill
        sizes="(min-width: 1280px) 1100px, 100vw"
        className="object-cover object-center"
        priority
        quality={90}
      />

      {/* Sage wash that multiplies into the photo, tying it to the app palette */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none mix-blend-multiply"
        style={{ background: "rgba(82, 122, 82, 0.30)" }}
      />

      {/* Directional scrim: opaque sage behind the copy, dissolving to reveal
          the photo on the right so the panel and picture read as one surface */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(100deg, rgba(38,58,38,0.96) 0%, rgba(52,78,52,0.9) 30%, rgba(70,104,70,0.62) 52%, rgba(82,122,82,0.22) 76%, rgba(82,122,82,0) 100%)",
        }}
      />

      {/* Bottom lift so the stat strip stays legible across the full width */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(28,44,28,0.82) 0%, rgba(28,44,28,0.30) 16%, transparent 40%)",
        }}
      />

      {/* Soft ambient light from upper-left, reads as window light */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 110% 80% at 16% 18%, rgba(254, 240, 199, 0.16), transparent 62%)",
        }}
      />

      {/* Corner vignette for grounded depth */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 130% 110% at 50% 45%, transparent 58%, rgba(14, 22, 14, 0.34) 100%)",
        }}
      />

      {/* Grain texture, blended at low strength */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: grainTile, backgroundSize: "220px 220px" }}
      />

      {/* Content */}
      <div className="relative flex min-h-[330px] flex-col justify-between gap-8 p-7 sm:min-h-[360px] sm:p-9 xl:min-h-[420px] xl:p-11">
        <div className="max-w-lg">
          <p className="eyebrow text-warm-white/80">
            Weekly ledger · {getWeekRange()}
          </p>

          <div className="mt-6 flex items-end gap-2.5">
            <motion.span
              initial={{ scale: 1.04, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="num font-bold leading-[0.82] tracking-[-0.035em] text-warm-white text-[clamp(4.25rem,12vw,7.5rem)] [text-shadow:0_2px_24px_rgba(16,28,16,0.45)]"
            >
              <AnimatedNumber value={useRate} />
            </motion.span>
            <span className="pb-3 text-3xl font-semibold text-warm-white/55">%</span>
          </div>

          <p className="mt-3 max-w-md text-base leading-7 text-warm-white/90 xl:text-lg xl:leading-8 [text-shadow:0_1px_12px_rgba(16,28,16,0.5)]">
            {total > 0
              ? "of what you logged this week became meals, not waste."
              : "Mark items used or wasted to start your weekly ledger."}
          </p>
        </div>

        {/* Frosted-glass stat strip — the photo shows softly through it */}
        <div className="grid max-w-lg grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/[0.12] bg-white/[0.07] shadow-[0_10px_34px_rgba(14,22,14,0.28)] backdrop-blur-md">
          <Stat label="Used" value={used} />
          <Stat label="Wasted" value={wasted} />
          <Stat label="Saved" value={saved} prefix="$" accent />
        </div>
      </div>
    </motion.section>
  );
}
