"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Leaf, ArrowRight } from "lucide-react";

interface LandingNavProps {
  isAuthenticated: boolean;
}

export function LandingNav({ isAuthenticated }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ctaHref = isAuthenticated ? "/app" : "/login";
  const ctaLabel = isAuthenticated ? "Open your kitchen" : "Sign in";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-out ${
        scrolled
          ? "border-b border-warm-100 bg-cream/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-lg px-1 py-1 text-stone-900"
        >
          <motion.span
            whileHover={reduceMotion ? undefined : { rotate: 12, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sage-500 text-warm-white shadow-warm-sm"
          >
            <Leaf className="h-4 w-4" />
          </motion.span>
          <span className="text-base font-bold tracking-tight">FreshTrack</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-stone-600 md:flex">
          <a href="#problem" className="transition-colors hover:text-stone-900">
            Why it matters
          </a>
          <a href="#features" className="transition-colors hover:text-stone-900">
            How it works
          </a>
          <Link href="/foods" className="transition-colors hover:text-stone-900">
            Guides
          </Link>
          <a href="#faq" className="transition-colors hover:text-stone-900">
            FAQ
          </a>
          <a href="#free" className="transition-colors hover:text-stone-900">
            Pricing
          </a>
        </nav>

        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1.5 rounded-lg bg-sage-500 px-4 py-2 text-sm font-semibold text-warm-white shadow-warm-sm transition-colors duration-200 hover:bg-sage-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}
