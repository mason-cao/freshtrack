"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ExpiringAlertProps {
  urgentCount: number;
  warningCount: number;
}

export function ExpiringAlert({ urgentCount, warningCount }: ExpiringAlertProps) {
  if (urgentCount === 0 && warningCount === 0) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-800">Attention Needed</h3>
          <p className="mt-1 text-sm text-red-700">
            {urgentCount > 0 && (
              <span className="font-medium">
                {urgentCount} item{urgentCount !== 1 ? "s" : ""} expiring within 2 days
              </span>
            )}
            {urgentCount > 0 && warningCount > 0 && " and "}
            {warningCount > 0 && (
              <span>
                {warningCount} item{warningCount !== 1 ? "s" : ""} expiring within 5 days
              </span>
            )}
          </p>
          <Link
            href="/pantry"
            className="mt-2 inline-block text-sm font-medium text-red-800 underline underline-offset-2 hover:text-red-900"
          >
            View in pantry
          </Link>
        </div>
      </div>
    </div>
  );
}
