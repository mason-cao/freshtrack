"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackAnalyticsEvent, trackPageView } from "@/lib/analytics-client";

const SIGNED_IN_EVENT_KEY = "freshtrack:analytics:signed-in-sent";

export function AnalyticsTracker({ isPublicPage }: { isPublicPage: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  useEffect(() => {
    if (isPublicPage) return;

    try {
      if (window.localStorage.getItem(SIGNED_IN_EVENT_KEY) === "true") return;
      window.localStorage.setItem(SIGNED_IN_EVENT_KEY, "true");
    } catch {
      return;
    }

    trackAnalyticsEvent("signed_in");
  }, [isPublicPage]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const signInTarget = target.closest(
        "[data-analytics-event='sign_in_clicked'], a[href='/login'], a[href^='/login?']"
      );
      if (signInTarget) {
        trackAnalyticsEvent("sign_in_clicked");
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
