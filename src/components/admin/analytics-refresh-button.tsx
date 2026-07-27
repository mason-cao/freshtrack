"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalyticsRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(() => router.refresh());
      }}
    >
      <RefreshCw
        className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      {isPending ? "Refreshing" : "Refresh"}
    </Button>
  );
}
