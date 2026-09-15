"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { MotionConfig, motion } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  BarChart3,
  Leaf,
  LogOut,
  Eraser,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Fab } from "./fab";
import { FooterLegal } from "./footer-legal";
import { InstallPrompt } from "./install-prompt";
import { AnalyticsTracker } from "./analytics-tracker";
import {
  notifyPantryUpdated,
} from "@/lib/pantry-events";
import { fetchJson } from "@/lib/api-client";
import { PantryUndoToast } from "@/components/pantry/pantry-undo-toast";

const navItems = [
  { href: "/app", label: "Home", icon: LayoutDashboard },
  { href: "/pantry", label: "Pantry", icon: UtensilsCrossed },
  { href: "/recipes", label: "Recipes", icon: ChefHat },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  function handleSignOut() {
    setSigningOut(true);
    void signOut({ callbackUrl: "/login" });
  }

  async function handleEraseHistory() {
    await fetchJson("/api/account/history", { method: "DELETE" });
    notifyPantryUpdated();
    router.refresh();
  }

  const eraseHistoryDescription =
    "This permanently clears your Stats history — your used, wasted, and saved totals and trends — and removes your consumed and wasted item records. Your active pantry and sign-in are kept. This can't be undone.";

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-cream">
      <AnalyticsTracker isPublicPage={false} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-warm-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-sage-700 focus:shadow-warm-lg"
      >
        Skip to main content
      </a>

      <aside
        className="fixed left-0 top-0 z-40 hidden h-full w-[72px] xl:w-[220px] flex-col items-center xl:items-stretch border-r border-warm-100 bg-warm-white py-6 md:flex transition-[width] duration-300 ease-out"
        aria-label="Primary"
      >
        <Link href="/app" className="mb-8 group flex items-center justify-center xl:justify-start xl:px-5 xl:gap-3">
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
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
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

        <ConfirmDialog
          trigger={
            <button
              type="button"
              aria-label="Erase history"
              className="mx-2 mt-4 flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-stone-400 transition-colors duration-200 hover:bg-terracotta-50 hover:text-terracotta-600 xl:mx-3 xl:justify-start xl:gap-3 xl:px-3 xl:py-2.5 cursor-pointer"
            >
              <Eraser className="h-5 w-5" />
              <span className="hidden text-sm font-medium xl:inline">Erase history</span>
            </button>
          }
          title="Erase account history?"
          description={eraseHistoryDescription}
          confirmLabel="Erase history"
          pendingLabel="Erasing…"
          onConfirm={handleEraseHistory}
        />

        <button
          type="button"
          aria-label={signingOut ? "Signing out" : "Sign out"}
          onClick={handleSignOut}
          disabled={signingOut}
          className="mx-2 mt-1 flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-stone-400 transition-colors duration-200 hover:bg-warm-50 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-60 xl:mx-3 xl:justify-start xl:gap-3 xl:px-3 xl:py-2.5 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden text-sm font-medium xl:inline">
            {signingOut ? "Signing out" : "Sign out"}
          </span>
        </button>
      </aside>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-warm-100 bg-warm-white pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Primary"
      >
        <div className="flex h-16 items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-2 py-1"
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

      <InstallPrompt />

      <Fab
        onItemAdded={() => {
          notifyPantryUpdated();
          router.refresh();
        }}
      />

      <main
        id="main-content"
        className="md:ml-[72px] xl:ml-[220px] transition-[margin-left] duration-300 ease-out"
      >
        <div className="mx-auto max-w-5xl xl:max-w-none px-4 py-6 pb-24 sm:px-6 md:px-8 xl:px-12 2xl:px-20 md:pb-8">
          {children}
          <section
            className="mt-10 rounded-xl border border-warm-100 bg-warm-white p-4 shadow-warm-sm md:hidden"
            aria-labelledby="mobile-account-actions"
          >
            <h2
              id="mobile-account-actions"
              className="text-sm font-semibold text-stone-900"
            >
              Account actions
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ConfirmDialog
                trigger={
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-terracotta-100 px-3 text-sm font-medium text-terracotta-700 hover:bg-terracotta-50"
                  >
                    <Eraser className="h-4 w-4" aria-hidden="true" />
                    Erase history
                  </button>
                }
                title="Erase account history?"
                description={eraseHistoryDescription}
                confirmLabel="Erase history"
                pendingLabel="Erasing…"
                onConfirm={handleEraseHistory}
              />
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-warm-200 px-3 text-sm font-medium text-stone-700 hover:bg-warm-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {signingOut ? "Signing out" : "Sign out"}
              </button>
            </div>
          </section>
          <FooterLegal className="mt-10 border-t border-warm-100 px-0 pb-0 md:px-0" />
        </div>
      </main>
    </div>
    </MotionConfig>
  );
}
