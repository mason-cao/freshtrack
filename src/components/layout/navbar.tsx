"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Package, ChefHat, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/pantry", label: "Pantry", icon: Package },
  { href: "/recipes", label: "Recipes", icon: ChefHat },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <Leaf className="h-5 w-5 text-emerald-600" />
          <span className="font-semibold text-gray-900">FreshTrack</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
