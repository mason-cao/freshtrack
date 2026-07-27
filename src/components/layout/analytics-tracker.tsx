"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  ANALYTICS_HEARTBEAT_INTERVAL_MS,
  isAnalyticsTrackingPath,
  trackAnalyticsEvent,
  trackPageView,
} from "@/lib/analytics-client";

const SIGNED_IN_EVENT_KEY = "freshtrack:analytics:signed-in-sent";

export function AnalyticsTracker({ isPublicPage }: { isPublicPage: boolean }) {
  const pathname = usePathname();
  const shouldTrackPath = isAnalyticsTrackingPath(pathname);

  useEffect(() => {
    if (!shouldTrackPath) return;
    trackPageView();
  }, [pathname, shouldTrackPath]);

  useEffect(() => {
    if (!shouldTrackPath) return;

    function sendHeartbeat() {
      if (document.visibilityState === "visible") {
        trackAnalyticsEvent("active_ping");
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    }

    sendHeartbeat();
    const interval = window.setInterval(
      sendHeartbeat,
      ANALYTICS_HEARTBEAT_INTERVAL_MS
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [shouldTrackPath]);

  useEffect(() => {
    if (isPublicPage || !shouldTrackPath) return;

    try {
      if (window.localStorage.getItem(SIGNED_IN_EVENT_KEY) === "true") return;
      window.localStorage.setItem(SIGNED_IN_EVENT_KEY, "true");
    } catch {
      return;
    }

    trackAnalyticsEvent("signed_in");
  }, [isPublicPage, shouldTrackPath]);

  useEffect(() => {
    if (!shouldTrackPath) return;

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
  }, [shouldTrackPath]);

  return null;
}
