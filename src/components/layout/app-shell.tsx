"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  BarChart3,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/pantry", label: "Pantry", icon: UtensilsCrossed },
  { href: "/recipes", label: "Recipes", icon: ChefHat },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop Side Rail */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-[72px] flex-col items-center border-r border-warm-100 bg-warm-white py-6 md:flex">
        <Link href="/" className="mb-8 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 12 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Leaf className="h-7 w-7 text-sage-500" />
          </motion.div>
        </Link>

        <nav className="flex flex-1 flex-col items-center gap-2">
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
                className="relative flex flex-col items-center gap-1 py-2 px-1"
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
                    "relative z-10 text-[10px] font-medium transition-colors duration-200",
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

      {/* Main Content */}
      <main className="md:ml-[72px]">
        <div className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}
