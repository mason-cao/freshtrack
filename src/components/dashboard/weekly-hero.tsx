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

export function WeeklyHero({ used, wasted, saved }: WeeklyHeroProps) {
  const total = used + wasted;
  const useRate = total > 0 ? Math.round((used / total) * 100) : 0;
  const heroImage = getDashboardHeroImage();

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.05 }}
      className="relative isolate overflow-hidden rounded-3xl text-sage-50 shadow-warm-lg"
    >
      {/* Base — brighter sage range so the panel reads vivid, not murky */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-sage-400 via-sage-500 to-sage-700"
      />

      {/* Soft ambient light from upper-left, broad and unsaturated so it
          reads as window light, not a yellow patch */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 115% 85% at 18% 22%, rgba(254, 240, 199, 0.14), transparent 65%)",
        }}
      />

      {/* Subtle corner vignette for grounded depth */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 130% 105% at 50% 45%, transparent 60%, rgba(16, 25, 16, 0.28) 100%)",
        }}
      />

      {/* Grain texture, blended at low strength */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: grainTile,
          backgroundSize: "220px 220px",
        }}
      />

      <div className="relative grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative p-6 sm:p-8 xl:p-10">
          <p className="eyebrow text-warm-white/75">
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
            <span className="pb-3 text-3xl font-semibold text-warm-white/55">
              %
            </span>
          </div>

          <p className="mt-3 max-w-md text-base leading-7 text-warm-white/85 xl:text-lg xl:leading-8">
            {total > 0
              ? "of what you logged this week became meals, not waste."
              : "Mark items used or wasted to start your weekly ledger."}
          </p>

          <div className="mt-9 grid grid-cols-3 divide-x divide-warm-white/15 border-t border-warm-white/15 pt-5">
            <div className="pr-3 sm:pr-4">
              <p className="eyebrow text-warm-white/65">Used</p>
              <p className="num mt-1.5 text-2xl font-bold text-warm-white xl:text-3xl">
                <AnimatedNumber value={used} />
              </p>
            </div>
            <div className="px-3 sm:px-4">
              <p className="eyebrow text-warm-white/65">Wasted</p>
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
            alt="A fresh, healthy meal on a rustic table"
            fill
            sizes="(min-width: 1280px) 45vw, (min-width: 1024px) 50vw, 0px"
            className="object-cover"
            priority
            quality={90}
          />
          {/* Sage tint over the photo to unify it with the panel
              without losing detail. Multiply respects shadows, overlay
              brightens highlights — the combo blends without muddying. */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-multiply"
            style={{ background: "rgba(82, 122, 82, 0.18)" }}
          />
          {/* Left-edge seam fade — uses the actual sage tones at this
              part of the gradient (sage-500 → sage-600) so the photo
              feels grown from the panel, not pasted on. */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[55%]"
            style={{
              background:
                "linear-gradient(to right, rgba(82, 122, 82, 0.88) 0%, rgba(82, 122, 82, 0.45) 38%, rgba(82, 122, 82, 0.14) 72%, transparent 100%)",
            }}
          />
          {/* Soft top-and-bottom photo darkening for editorial mood */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(31, 48, 31, 0.18) 0%, transparent 25%, transparent 75%, rgba(31, 48, 31, 0.22) 100%)",
            }}
          />
        </div>
      </div>
    </motion.section>
  );
}
