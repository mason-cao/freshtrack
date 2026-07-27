import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Activity,
  Eye,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { auth } from "@/auth";
import { AnalyticsRefreshButton } from "@/components/admin/analytics-refresh-button";
import { Badge } from "@/components/ui/badge";
import { getAdminAnalyticsSnapshot } from "@/db/admin-analytics";
import {
  isAnalyticsAdminDevBypassEnabled,
  isAnalyticsAdminEmail,
} from "@/lib/admin-analytics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Site analytics",
};

const numberFormatter = new Intl.NumberFormat("en-US");
const dayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

function formatDay(day: string): string {
  return dayFormatter.format(new Date(`${day}T00:00:00.000Z`));
}

function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

function formatLastSeen(
  lastSeenAt: string | null,
  generatedAt: string,
  activeWindowMinutes: number
): { label: string; active: boolean } {
  if (!lastSeenAt) return { label: "No activity yet", active: false };

  const lastSeen = new Date(lastSeenAt).getTime();
  const generated = new Date(generatedAt).getTime();
  if (!Number.isFinite(lastSeen) || !Number.isFinite(generated)) {
    return { label: "Unknown", active: false };
  }

  const elapsedMinutes = Math.max(
    0,
    Math.floor((generated - lastSeen) / (60 * 1_000))
  );
  if (elapsedMinutes <= activeWindowMinutes) {
    return { label: "Active now", active: true };
  }
  if (elapsedMinutes < 60) {
    return { label: `${elapsedMinutes} min ago`, active: false };
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return { label: `${elapsedHours} hr ago`, active: false };
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) {
    return {
      label: `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`,
      active: false,
    };
  }

  return { label: dateFormatter.format(new Date(lastSeenAt)), active: false };
}

interface MetricProps {
  label: string;
  value: number;
  detail: string;
  icon: typeof Activity;
}

function Metric({ label, value, detail, icon: Icon }: MetricProps) {
  return (
    <div className="bg-warm-white p-5 sm:p-6">
      <dt className="flex items-center gap-2 text-sm font-medium text-stone-500">
        <Icon className="h-4 w-4 text-sage-600" aria-hidden="true" />
        {label}
      </dt>
      <dd className="num mt-3 text-3xl font-semibold tracking-tight text-stone-900">
        {numberFormatter.format(value)}
      </dd>
      <p className="mt-1 text-xs leading-5 text-stone-500">{detail}</p>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const devBypassEnabled = isAnalyticsAdminDevBypassEnabled();
  const session = devBypassEnabled ? null : await auth();
  if (!devBypassEnabled && !isAnalyticsAdminEmail(session?.user?.email)) {
    notFound();
  }

  const snapshot = await getAdminAnalyticsSnapshot();
  const historyNewestFirst = [...snapshot.history].reverse();
  const listedAccountCount = snapshot.accounts.length;

  return (
    <div className="space-y-6 xl:space-y-8">
      <header className="flex flex-col gap-4 border-b border-warm-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-sage-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <p className="eyebrow">Private admin view</p>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Site analytics
          </h1>
          <p className="mt-2 max-w-[65ch] text-sm leading-6 text-stone-500">
            A compact read on who is here, how visits are trending, and who has
            registered.
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-xs text-stone-500">
            Updated {dateTimeFormatter.format(new Date(snapshot.generatedAt))}
          </p>
          <AnalyticsRefreshButton />
        </div>
      </header>

      <dl className="grid gap-px overflow-hidden rounded-2xl border border-warm-100 bg-warm-100 shadow-warm-sm sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Active visitors"
          value={snapshot.activeVisitors}
          detail={`Seen in the last ${snapshot.activeWindowMinutes} minutes`}
          icon={Activity}
        />
        <Metric
          label="Active members"
          value={snapshot.activeMembers}
          detail="Signed-in users in the active window"
          icon={UserCheck}
        />
        <Metric
          label="Registered users"
          value={snapshot.totalUsers}
          detail={`${numberFormatter.format(snapshot.newUsersLast30Days)} joined in 30 days`}
          icon={Users}
        />
        <Metric
          label="Page views, 30 days"
          value={snapshot.pageViewsLast30Days}
          detail={`${numberFormatter.format(snapshot.uniqueVisitorsLast30Days)} unique visitors`}
          icon={Eye}
        />
      </dl>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <section
          className="overflow-hidden rounded-2xl border border-warm-100 bg-warm-white shadow-warm-sm"
          aria-labelledby="activity-history-title"
        >
          <div className="flex items-start justify-between gap-4 border-b border-warm-100 px-5 py-5 sm:px-6">
            <div>
              <h2
                id="activity-history-title"
                className="text-lg font-semibold text-stone-900"
              >
                Daily activity
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                The latest {snapshot.historyDays} days, shown in UTC.
              </p>
            </div>
            <div className="text-right">
              <p className="num text-lg font-semibold text-stone-900">
                {numberFormatter.format(snapshot.totalStoredPageViews)}
              </p>
              <p className="text-xs text-stone-500">stored page views</p>
            </div>
          </div>

          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Daily page views, unique visitors, and registrations
              </caption>
              <thead className="sticky top-0 z-10 bg-warm-white text-xs uppercase tracking-[0.12em] text-stone-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold sm:px-6">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Views
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Visitors
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold sm:px-6">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {historyNewestFirst.map((day) => (
                  <tr key={day.day} className="hover:bg-warm-50/60">
                    <th
                      scope="row"
                      className="whitespace-nowrap px-5 py-3 font-medium text-stone-900 sm:px-6"
                    >
                      {formatDay(day.day)}
                    </th>
                    <td className="num px-4 py-3 text-right text-stone-700">
                      {numberFormatter.format(day.pageViews)}
                    </td>
                    <td className="num px-4 py-3 text-right text-stone-700">
                      {numberFormatter.format(day.visitors)}
                    </td>
                    <td className="num px-5 py-3 text-right text-stone-700 sm:px-6">
                      {numberFormatter.format(day.registrations)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="rounded-2xl border border-warm-100 bg-warm-white p-5 shadow-warm-sm sm:p-6"
          aria-labelledby="top-pages-title"
        >
          <h2 id="top-pages-title" className="text-lg font-semibold text-stone-900">
            Top pages
          </h2>
          <p className="mt-1 text-sm text-stone-500">Most visited in 30 days.</p>

          {snapshot.topPages.length > 0 ? (
            <ol className="mt-5 divide-y divide-warm-100">
              {snapshot.topPages.map((page, index) => (
                <li key={page.path} className="flex items-center gap-3 py-3 first:pt-0">
                  <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-50 text-xs font-semibold text-sage-700">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-900" title={page.path}>
                      {page.path}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {numberFormatter.format(page.visitors)} unique visitor
                      {page.visitors === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="num shrink-0 text-sm font-semibold text-stone-700">
                    {numberFormatter.format(page.pageViews)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-5 rounded-xl bg-warm-50 p-4 text-sm leading-6 text-stone-500">
              No page views yet. New visits will appear here automatically.
            </div>
          )}
        </section>
      </div>

      <section
        className="overflow-hidden rounded-2xl border border-warm-100 bg-warm-white shadow-warm-sm"
        aria-labelledby="registered-accounts-title"
      >
        <div className="flex flex-col gap-3 border-b border-warm-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-sage-600" aria-hidden="true" />
              <h2
                id="registered-accounts-title"
                className="text-lg font-semibold text-stone-900"
              >
                Registered accounts
              </h2>
            </div>
            <p className="mt-1 text-sm text-stone-500">
              Names and emails are visible only to configured analytics admins.
            </p>
          </div>
          <Badge variant="secondary">
            {numberFormatter.format(snapshot.totalUsers)} total
          </Badge>
        </div>

        {listedAccountCount > 0 ? (
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Registered user emails, join dates, and last activity
              </caption>
              <thead className="sticky top-0 z-10 bg-warm-white text-xs uppercase tracking-[0.12em] text-stone-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold sm:px-6">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Joined
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold sm:px-6">
                    Last seen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {snapshot.accounts.map((account) => {
                  const lastSeen = formatLastSeen(
                    account.lastSeenAt,
                    snapshot.generatedAt,
                    snapshot.activeWindowMinutes
                  );

                  return (
                    <tr key={account.id} className="hover:bg-warm-50/60">
                      <th
                        scope="row"
                        className="px-5 py-3 font-medium text-stone-900 sm:px-6"
                      >
                        {account.email}
                      </th>
                      <td className="px-4 py-3 text-stone-700">
                        {account.name || "No name"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-stone-700">
                        {formatDate(account.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-stone-700 sm:px-6">
                        {lastSeen.active ? (
                          <Badge>{lastSeen.label}</Badge>
                        ) : (
                          lastSeen.label
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center sm:px-6">
            <Users className="mx-auto h-6 w-6 text-stone-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-stone-900">
              No registered users yet
            </p>
            <p className="mt-1 text-sm text-stone-500">
              New Google sign-ins will appear here.
            </p>
          </div>
        )}

        {snapshot.totalUsers > snapshot.accountListLimit && (
          <p className="border-t border-warm-100 px-5 py-3 text-xs text-stone-500 sm:px-6">
            Showing the newest {snapshot.accountListLimit} accounts.
          </p>
        )}
      </section>
    </div>
  );
}
