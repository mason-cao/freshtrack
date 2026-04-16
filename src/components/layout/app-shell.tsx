"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  BarChart3,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Fab } from "./fab";
import { notifyPantryUpdated } from "@/lib/pantry-events";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/pantry", label: "Pantry", icon: UtensilsCrossed },
  { href: "/recipes", label: "Recipes", icon: ChefHat },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop Side Rail */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-[72px] xl:w-[220px] flex-col items-center xl:items-stretch border-r border-warm-100 bg-warm-white py-6 md:flex transition-[width] duration-300 ease-out">
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-warm-100 bg-warm-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden">
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

      {/* FAB */}
      <Fab
        onItemAdded={() => {
          notifyPantryUpdated();
          router.refresh();
        }}
      />

      {/* Main Content */}
      <main className="md:ml-[72px] xl:ml-[220px] transition-[margin-left] duration-300 ease-out">
        <div className="mx-auto max-w-5xl xl:max-w-none px-4 py-6 pb-24 sm:px-6 md:px-8 xl:px-12 2xl:px-20 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
