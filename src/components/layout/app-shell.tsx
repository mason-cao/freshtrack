"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  BarChart3,
  Leaf,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Fab } from "./fab";
import { FooterLegal } from "./footer-legal";
import { InstallPrompt } from "./install-prompt";
import {
  notifyPantryUpdated,
  subscribeToPantryActions,
  type PantryActionOutcome,
} from "@/lib/pantry-events";
import { fetchJson } from "@/lib/api-client";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/pantry", label: "Pantry", icon: UtensilsCrossed },
  { href: "/recipes", label: "Recipes", icon: ChefHat },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPage = pathname === "/login" || pathname === "/privacy" || pathname === "/terms";

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-cream">
        {children}
        <FooterLegal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-warm-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-sage-700 focus:shadow-warm-lg"
      >
        Skip to main content
      </a>
      {/* Desktop Side Rail */}
      <aside
        className="fixed left-0 top-0 z-40 hidden h-full w-[72px] xl:w-[220px] flex-col items-center xl:items-stretch border-r border-warm-100 bg-warm-white py-6 md:flex transition-[width] duration-300 ease-out"
        aria-label="Primary"
      >
        <Link href="/" className="mb-8 group flex items-center justify-center xl:justify-start xl:px-5 xl:gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 12 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Leaf className="h-7 w-7 text-sage-500" />
          </motion.div>
          <span className="hidden xl:inline text-lg font-bold text-stone-900 tracking-tight">
            FreshTrack
          </span>
        </Link>

        <nav className="flex flex-1 flex-col items-center xl:items-stretch gap-2 xl:gap-1 xl:px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col xl:flex-row items-center gap-1 xl:gap-3 py-2 px-1 xl:px-3 xl:py-2.5"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-sage-50"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="relative z-10"
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive ? "text-sage-600" : "text-stone-400"
                    )}
                  />
                </motion.div>
                <span
                  className={cn(
                    "relative z-10 text-[10px] xl:text-sm font-medium transition-colors duration-200",
                    isActive ? "text-sage-700" : "text-stone-400"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-warm-100 bg-warm-white pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Primary"
      >
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1 min-w-[64px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-active"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full bg-sage-500"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive ? "text-sage-600" : "text-stone-400"
                    )}
                  />
                </motion.div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    isActive ? "text-sage-700" : "text-stone-400"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <PantryUndoToast
        onRestored={() => {
          notifyPantryUpdated();
          router.refresh();
        }}
      />

      {/* FAB */}
      <InstallPrompt />

      <Fab
        onItemAdded={() => {
          notifyPantryUpdated();
          router.refresh();
        }}
      />

      {/* Main Content */}
      <main
        id="main-content"
        className="md:ml-[72px] xl:ml-[220px] transition-[margin-left] duration-300 ease-out"
      >
        <div className="mx-auto max-w-5xl xl:max-w-none px-4 py-6 pb-24 sm:px-6 md:px-8 xl:px-12 2xl:px-20 md:pb-8">
          {children}
          <FooterLegal className="mt-10 border-t border-warm-100 px-0 pb-0 md:px-0" />
        </div>
      </main>
    </div>
  );
}

function PantryUndoToast({ onRestored }: { onRestored: () => void }) {
  const [outcome, setOutcome] = useState<PantryActionOutcome | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToPantryActions((nextOutcome) => {
      setOutcome(nextOutcome);
      setRestoring(false);
      setError(null);
    });
  }, []);

  useEffect(() => {
    if (!outcome) return;
    const timeout = window.setTimeout(() => {
      setOutcome(null);
      setError(null);
    }, 8000);
    return () => window.clearTimeout(timeout);
  }, [outcome]);

  async function handleUndo() {
    if (!outcome || restoring) return;

    setRestoring(true);
    setError(null);
    try {
      await fetchJson(`/api/items/${outcome.itemId}/restore`, { method: "POST" });
      setOutcome(null);
      onRestored();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to restore item.");
    } finally {
      setRestoring(false);
    }
  }

  const actionLabel = outcome?.action === "consume" ? "used" : "wasted";

  return (
    <AnimatePresence>
      {outcome && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed bottom-20 left-4 right-4 z-50 rounded-xl border border-warm-100 bg-warm-white p-3 shadow-warm-lg md:bottom-6 md:left-auto md:right-6 md:w-[360px]"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-sage-50 p-2 text-sage-600">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-900">
                Marked {outcome.itemName} {actionLabel}
              </p>
              <p className="mt-0.5 text-xs text-stone-500">
                Undo will restore it to your active pantry.
              </p>
              {error && <p className="mt-1 text-xs text-terracotta-600">{error}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={restoring}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-sage-200 bg-sage-50 px-3 text-xs font-semibold text-sage-700 transition-colors duration-200 hover:bg-sage-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {restoring ? "Restoring" : "Undo"}
              </button>
              <button
                type="button"
                onClick={() => setOutcome(null)}
                aria-label="Dismiss pantry update"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors duration-200 hover:bg-warm-50 hover:text-stone-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
