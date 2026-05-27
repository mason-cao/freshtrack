"use client";

import { useEffect, useState } from "react";
import { Download, Share, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

const DISMISS_KEY = "freshtrack:install-prompt-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && window.navigator.standalone === true)
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function hasDismissedInstallPrompt() {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "true";
  } catch {
    return true;
  }
}

function rememberInstallPromptDismissal() {
  try {
    window.localStorage.setItem(DISMISS_KEY, "true");
  } catch {
    // Browser storage can be unavailable in privacy modes.
  }
}

export function InstallPrompt() {
  const [ready, setReady] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    if (hasDismissedInstallPrompt() || isStandalone()) {
      return;
    }

    const ios = isIOS();
    setIsIOSDevice(ios);
    setReady(ios);

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setReady(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    trackAnalyticsEvent(
      choice.outcome === "accepted" ? "pwa_install_accepted" : "pwa_install_prompt_dismissed"
    );
    setInstallEvent(null);
    dismiss({ track: false });
  }

  function dismiss({ track = true }: { track?: boolean } = {}) {
    if (track) {
      trackAnalyticsEvent("pwa_install_prompt_dismissed");
    }
    rememberInstallPromptDismissal();
    setReady(false);
  }

  useEffect(() => {
    if (ready) {
      trackAnalyticsEvent("pwa_install_prompt_shown");
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <div className="fixed bottom-36 left-4 right-4 z-50 md:hidden">
      <div className="rounded-xl border border-warm-100 bg-warm-white p-3 shadow-warm-lg">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-sage-50 p-2 text-sage-700">
            <Smartphone className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-900">Install FreshTrack</p>
            <p className="mt-0.5 text-xs leading-5 text-stone-500">
              {installEvent
                ? "Keep pantry actions one tap away from your home screen."
                : "In Safari, tap Share, then Add to Home Screen."}
            </p>
            <div className="mt-3 flex items-center gap-2">
              {installEvent ? (
                <Button size="sm" onClick={handleInstall}>
                  <Download className="h-3.5 w-3.5" />
                  Install
                </Button>
              ) : isIOSDevice ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-warm-50 px-2.5 py-1.5 text-xs font-semibold text-stone-600">
                  <Share className="h-3.5 w-3.5" />
                  Share menu
                </span>
              ) : null}
              <Button size="sm" variant="ghost" onClick={() => dismiss()}>
                Not now
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dismiss()}
            aria-label="Dismiss install prompt"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors duration-200 hover:bg-warm-50 hover:text-stone-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
