"use client";

import { useEffect, useState } from "react";
import { getDaysUntilExpiry, getExpiryLabel, freshnessColor, getFreshnessStatus } from "@/lib/freshness";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ItemActions } from "@/components/pantry/item-actions";
import { Package, ChefHat, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Item {
  id: number;
  name: string;
  categoryIcon: string | null;
  categoryName: string | null;
  quantity: number;
  unit: string;
  expirationDate: string;
}

interface Stats {
  totals: {
    consumed: number;
    wasted: number;
    wasteRate: number;
    moneySaved: number;
    wastedCost: number;
  };
}

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  function loadData() {
    Promise.all([
      fetch("/api/items").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
    ]).then(([itemsData, statsData]) => {
      setItems(itemsData);
      setStats(statsData);
      setLoading(false);
    });
  }

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  // Only items expiring today or tomorrow
  const expiringSoon = items.filter((i) => {
    const days = getDaysUntilExpiry(i.expirationDate);
    return days >= 0 && days <= 1;
  });

  return (
    <div className="animate-fade-in space-y-10">
      {/* Hero summary */}
      <div className="pt-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Good {getGreeting()}
        </h1>
        <p className="mt-2 text-gray-500">
          {items.length === 0
            ? "Your pantry is empty. Add some items to start tracking."
            : `You're tracking ${items.length} item${items.length !== 1 ? "s" : ""}. `}
          {expiringSoon.length > 0 && (
            <span className="text-amber-700 font-medium">
              {expiringSoon.length} item{expiringSoon.length !== 1 ? "s" : ""} expiring today or tomorrow.
            </span>
          )}
          {expiringSoon.length === 0 && items.length > 0 && (
            <span className="text-emerald-700 font-medium">Nothing expires today or tomorrow.</span>
          )}
        </p>
      </div>

      {/* Key metrics — 3 compact numbers */}
      {stats && (
        <div className="flex gap-8 border-b pb-6">
          <Metric label="Active items" value={items.length} />
          <Metric
            label="Waste rate"
            value={`${stats.totals.wasteRate}%`}
            muted={stats.totals.wasteRate <= 30}
            warn={stats.totals.wasteRate > 30}
          />
          <Metric
            label="Food saved"
            value={formatCurrency(stats.totals.moneySaved)}
          />
        </div>
      )}

      {/* Expiring today or tomorrow */}
      {expiringSoon.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Expiring Soon
            </h2>
            <Link
              href="/pantry"
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {expiringSoon.map((item) => {
              const status = getFreshnessStatus(item.expirationDate);
              const colors = freshnessColor(status);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 bg-white"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${colors.dot}`} />
                    <span className="font-medium text-gray-900 truncate">{item.name}</span>
                    <span className="text-sm text-gray-400 shrink-0">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <Badge className={`${colors.badge} text-xs`}>
                      {getExpiryLabel(item.expirationDate)}
                    </Badge>
                    <ItemActions itemId={item.id} itemName={item.name} onAction={loadData} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick links */}
      <section className="flex gap-3">
        <Link href="/pantry" className="flex-1">
          <div className="rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:border-emerald-200 hover:bg-emerald-50/30">
            <Package className="h-5 w-5 text-gray-400 mb-2" />
            <p className="font-medium text-gray-900 text-sm">Pantry</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage all {items.length} items
            </p>
          </div>
        </Link>
        <Link href="/recipes" className="flex-1">
          <div className="rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:border-emerald-200 hover:bg-emerald-50/30">
            <ChefHat className="h-5 w-5 text-gray-400 mb-2" />
            <p className="font-medium text-gray-900 text-sm">Recipes</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Use up expiring items
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  muted,
  warn,
}: {
  label: string;
  value: string | number;
  muted?: boolean;
  warn?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p
        className={`text-2xl font-semibold mt-0.5 ${
          warn ? "text-red-600" : muted ? "text-gray-400" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
