"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnalyticsTracker } from "./analytics-tracker";
import { FooterLegal } from "./footer-legal";

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showFooterLegal =
    pathname === "/login" || pathname === "/privacy" || pathname === "/terms";

  return (
    <div className="min-h-screen bg-cream">
      <AnalyticsTracker isPublicPage />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-warm-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-sage-700 focus:shadow-warm-lg"
      >
        Skip to main content
      </a>
      {children}
      {showFooterLegal && <FooterLegal />}
    </div>
  );
}
