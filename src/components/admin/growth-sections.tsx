import { CalendarRange, Compass, Repeat, Sprout } from "lucide-react";
import type { ActivationFunnel, GrowthSnapshot } from "@/db/growth-analytics";
import {
  RETENTION_WEEK_OFFSETS,
  niceAxisMax,
  percentOf,
  retentionShade,
  type RankedCount,
  type RetentionRow,
  type WeeklyActive,
} from "@/lib/growth-analytics";

const numberFormatter = new Intl.NumberFormat("en-US");
const weekFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function formatWeek(day: string): string {
  return weekFormatter.format(new Date(`${day}T00:00:00.000Z`));
}

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${value}%`;
}

// Ordinal sage ramp (validated light→dark): deeper milestones read darker.
const MILESTONE_FILLS = ["bg-sage-300", "bg-sage-400", "bg-sage-500", "bg-sage-600", "bg-sage-700"];

// Sequential sage ramp for retention; sage-400 is skipped because neither ink
// nor white text clears 4.5:1 on it.
const RETENTION_SHADES = [
  "bg-sage-50 text-stone-900",
  "bg-sage-100 text-stone-900",
  "bg-sage-200 text-stone-900",
  "bg-sage-300 text-stone-900",
  "bg-sage-500 text-white",
  "bg-sage-600 text-white",
  "bg-sage-700 text-white",
];
const RETENTION_LEGEND = ["0%", "<15%", "15–29%", "30–44%", "45–59%", "60–79%", "80%+"];

function Card({
  id,
  icon: Icon,
  title,
  description,
  children,
  className = "",
}: {
  id: string;
  icon: typeof Sprout;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`rounded-2xl border border-warm-100 bg-warm-white p-5 shadow-warm-sm sm:p-6 ${className}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-sage-600" aria-hidden="true" />
        <h2 id={id} className="text-lg font-semibold text-stone-900">
          {title}
        </h2>
      </div>
      <p className="mt-1 max-w-[65ch] text-sm leading-6 text-stone-500">{description}</p>
      {children}
    </section>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 rounded-xl bg-warm-50 p-4 text-sm leading-6 text-stone-500">{children}</p>
  );
}

function MeterRow({
  label,
  count,
  percent,
  fill,
}: {
  label: string;
  count: string;
  percent: number | null;
  fill: string;
}) {
  return (
    <li className="py-2.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-stone-700">{label}</span>
        <span className="flex items-baseline gap-3">
          <span className="num text-stone-500">{count}</span>
          <span className="num w-11 text-right font-semibold text-stone-900">
            {formatPercent(percent)}
          </span>
        </span>
      </div>
      {/* Meter: same-ramp track, 4px rounded data end, square at the baseline. */}
      <div className="mt-2 h-3 overflow-hidden rounded-r-[4px] bg-sage-50">
        <div
          className={`h-full rounded-r-[4px] ${fill}`}
          style={{ width: `${Math.min(100, percent ?? 0)}%` }}
        />
      </div>
    </li>
  );
}

function ActivationMilestones({ funnel, cohortDays }: { funnel: ActivationFunnel; cohortDays: number }) {
  const steps = [
    { label: "Signed up", value: funnel.signedUp },
    { label: "Added an item", value: funnel.addedItem },
    { label: "Added 5+ items", value: funnel.addedFiveItems },
    { label: "Marked an item used or wasted", value: funnel.loggedOutcome },
  ];

  return (
    <Card
      id="activation-title"
      icon={Sprout}
      title="New-user milestones"
      description={`Of the people who joined in the last ${cohortDays} days, how many reached each step.`}
    >
      {funnel.signedUp === 0 ? (
        <EmptyNote>No sign-ups in the last {cohortDays} days yet.</EmptyNote>
      ) : (
        <>
          <ol className="mt-4 divide-y divide-warm-100">
            {steps.map((step, index) => (
              <MeterRow
                key={step.label}
                label={step.label}
                count={numberFormatter.format(step.value)}
                percent={percentOf(step.value, funnel.signedUp)}
                fill={MILESTONE_FILLS[index]}
              />
            ))}
          </ol>
          <div className="mt-3 border-t border-warm-200 pt-3">
            <ol>
              <MeterRow
                label="Came back on a later day in their first week"
                count={`${numberFormatter.format(funnel.returnedWeek1)} of ${numberFormatter.format(funnel.week1Eligible)}`}
                percent={percentOf(funnel.returnedWeek1, funnel.week1Eligible)}
                fill={MILESTONE_FILLS[4]}
              />
            </ol>
            <p className="text-xs leading-5 text-stone-500">
              Counts only people who joined 8+ days ago, so everyone measured has had a full week.
            </p>
          </div>
        </>
      )}
    </Card>
  );
}

function StatTile({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div>
      <dt className="text-sm text-stone-500">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">
        {numberFormatter.format(value)}
      </dd>
      <dd className="text-xs text-stone-500">{detail}</dd>
    </div>
  );
}

function weekSummary(week: WeeklyActive, isCurrent: boolean): string {
  const newUsers = week.activeUsers - week.returningUsers;
  return `Week of ${formatWeek(week.weekStart)}${isCurrent ? " (so far)" : ""}: ${week.activeUsers} active, ${week.returningUsers} returning, ${newUsers} new`;
}

function WeeklyActiveChart({ weeks }: { weeks: WeeklyActive[] }) {
  const lastFull = weeks.at(-2);
  const beforeLastFull = weeks.at(-3);
  const axisMax = niceAxisMax(Math.max(0, ...weeks.map((week) => week.activeUsers)));
  const ticks = axisMax % 2 === 0 ? [axisMax, axisMax / 2, 0] : [axisMax, 0];
  const delta = lastFull && beforeLastFull ? lastFull.activeUsers - beforeLastFull.activeUsers : 0;

  return (
    <Card
      id="weekly-active-title"
      icon={CalendarRange}
      title="Weekly active users"
      description="Signed-in people who opened the app or changed their pantry each week (Monday start, UTC)."
    >
      {lastFull && (
        <dl className="mt-5 grid grid-cols-2 gap-4">
          <StatTile
            label="Active last week"
            value={lastFull.activeUsers}
            detail={`${delta >= 0 ? "+" : "−"}${Math.abs(delta)} vs the week before`}
          />
          <StatTile
            label="Returning last week"
            value={lastFull.returningUsers}
            detail="joined before that week"
          />
        </dl>
      )}

      <div className="mt-6 flex gap-2">
        {/* Y axis: clean ticks on recessive hairlines. */}
        <div className="num flex h-40 w-6 shrink-0 flex-col justify-between text-right text-[11px] leading-none text-stone-500" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
              {tick}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-40">
            {ticks.map((tick) => (
              <div
                key={tick}
                className="absolute inset-x-0 border-t border-warm-100"
                style={{ bottom: `${(tick / axisMax) * 100}%` }}
                aria-hidden="true"
              />
            ))}
            <ol className="relative flex h-full items-end gap-[2px]" aria-label="Weekly active users, last 12 weeks">
              {weeks.map((week, index) => {
                const isCurrent = index === weeks.length - 1;
                const height = (week.activeUsers / axisMax) * 100;
                const summary = weekSummary(week, isCurrent);
                return (
                  <li
                    key={week.weekStart}
                    tabIndex={0}
                    aria-label={summary}
                    className="group relative flex h-full flex-1 cursor-default items-end justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-sage-500/40"
                  >
                    {isCurrent && week.activeUsers > 0 && (
                      <span
                        className="num absolute text-[11px] font-semibold text-stone-700"
                        style={{ bottom: `calc(${height}% + 4px)` }}
                        aria-hidden="true"
                      >
                        {week.activeUsers}
                      </span>
                    )}
                    <span
                      className={`w-full max-w-6 rounded-t-[4px] transition-colors ${
                        isCurrent ? "bg-sage-300 group-hover:bg-sage-400" : "bg-sage-500 group-hover:bg-sage-600"
                      }`}
                      style={{ height: `${height}%` }}
                      aria-hidden="true"
                    />
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full z-20 mb-2 hidden w-max max-w-48 -translate-x-1/2 rounded-lg bg-stone-900 px-2.5 py-1.5 text-xs leading-5 text-white shadow-warm-lg group-hover:block group-focus-visible:block"
                      style={{ left: "50%" }}
                    >
                      <span className="num block font-semibold">{week.activeUsers} active</span>
                      <span className="block text-white/80">
                        {week.returningUsers} returning · {week.activeUsers - week.returningUsers} new
                      </span>
                      <span className="block text-white/80">
                        Week of {formatWeek(week.weekStart)}
                        {isCurrent ? " (so far)" : ""}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="mt-2 flex gap-[2px]" aria-hidden="true">
            {weeks.map((week, index) => (
              <span
                key={week.weekStart}
                className={`flex-1 text-center text-[10px] leading-none text-stone-500 ${
                  index % 2 === (weeks.length - 1) % 2 ? "" : "invisible sm:visible"
                }`}
              >
                {formatWeek(week.weekStart).replace(" ", " ")}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-stone-500">The lighter bar is the current week so far.</p>

      <details className="mt-4 rounded-xl border border-warm-100">
        <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-stone-700">
          Show as table
        </summary>
        <div className="overflow-x-auto border-t border-warm-100">
          <table className="w-full min-w-[360px] text-left text-sm">
            <caption className="sr-only">Weekly active, returning, and new users</caption>
            <thead className="text-xs uppercase tracking-[0.12em] text-stone-500">
              <tr>
                <th scope="col" className="px-4 py-2 font-semibold">Week of</th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">Active</th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">Returning</th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">New</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {[...weeks].reverse().map((week) => (
                <tr key={week.weekStart}>
                  <th scope="row" className="px-4 py-2 font-medium text-stone-900">
                    {formatWeek(week.weekStart)}
                  </th>
                  <td className="num px-4 py-2 text-right text-stone-700">{week.activeUsers}</td>
                  <td className="num px-4 py-2 text-right text-stone-700">{week.returningUsers}</td>
                  <td className="num px-4 py-2 text-right text-stone-700">
                    {week.activeUsers - week.returningUsers}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  );
}

function RetentionTable({ rows }: { rows: RetentionRow[] }) {
  return (
    <Card
      id="retention-title"
      icon={Repeat}
      title="Retention by sign-up week"
      description="Share of each week's sign-ups who were active N weeks after joining (week 1 is days 7–13). A week stays blank until someone in that group has lived through it, and only those people are counted."
    >
      {rows.length === 0 ? (
        <EmptyNote>No sign-ups in the last 8 weeks yet.</EmptyNote>
      ) : (
        <>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-[2px] text-sm">
              <caption className="sr-only">
                Percent of each sign-up week still active in the weeks after joining
              </caption>
              <thead className="text-xs uppercase tracking-[0.12em] text-stone-500">
                <tr>
                  <th scope="col" className="px-2 py-2 text-left font-semibold">Joined</th>
                  <th scope="col" className="px-2 py-2 text-right font-semibold">People</th>
                  {RETENTION_WEEK_OFFSETS.map((offset) => (
                    <th key={offset} scope="col" className="px-2 py-2 text-center font-semibold">
                      Wk {offset}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.cohortWeek}>
                    <th scope="row" className="whitespace-nowrap px-2 py-2 text-left font-medium text-stone-900">
                      {formatWeek(row.cohortWeek)}
                    </th>
                    <td className="num px-2 py-2 text-right text-stone-700">{row.size}</td>
                    {row.weeks.map((cell, index) =>
                      cell ? (
                        <td
                          key={index}
                          className={`num h-12 min-w-14 rounded-[4px] px-2 text-center leading-tight ${
                            RETENTION_SHADES[retentionShade(cell.percent ?? 0)]
                          }`}
                        >
                          <span className="block font-semibold">{formatPercent(cell.percent)}</span>
                          <span className="block text-[11px] opacity-80">
                            {cell.retained}/{cell.eligible}
                          </span>
                        </td>
                      ) : (
                        <td key={index} className="h-12 min-w-14 text-center text-stone-400">
                          —
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-stone-500" aria-label="Retention color scale">
            {RETENTION_LEGEND.map((label, index) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <span className={`h-3 w-5 rounded-[3px] ${RETENTION_SHADES[index].split(" ")[0]}`} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function RankedBars({ title, entries }: { title: string; entries: RankedCount[] }) {
  const max = Math.max(1, ...entries.map((entry) => entry.signups));
  return (
    <div>
      <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      <ol className="mt-3 space-y-3">
        {entries.map((entry) => (
          <li key={entry.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-stone-700" title={entry.label}>
                {entry.label}
              </span>
              <span className="num shrink-0 font-semibold text-stone-900">{entry.signups}</span>
            </div>
            <div className="mt-1.5 h-2 rounded-r-[4px] bg-sage-50">
              <div
                className="h-full rounded-r-[4px] bg-sage-500"
                style={{ width: `${(entry.signups / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SignupSources({
  sources,
  landingPages,
  cohortDays,
}: {
  sources: RankedCount[];
  landingPages: RankedCount[];
  cohortDays: number;
}) {
  return (
    <Card
      id="signup-sources-title"
      icon={Compass}
      title="Where sign-ups come from"
      description={`First recorded visit for people who joined in the last ${cohortDays} days, across every browser they signed in on. Campaign tags (utm_source) win over the referring site.`}
    >
      {sources.length === 0 ? (
        <EmptyNote>No sign-ups in the last {cohortDays} days yet.</EmptyNote>
      ) : (
        <div className="mt-5 grid gap-8 sm:grid-cols-2">
          <RankedBars title="Source" entries={sources} />
          {landingPages.length > 0 && <RankedBars title="Landing page" entries={landingPages} />}
        </div>
      )}
    </Card>
  );
}

export function GrowthSections({ growth }: { growth: GrowthSnapshot }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <ActivationMilestones funnel={growth.funnel} cohortDays={growth.cohortDays} />
        <WeeklyActiveChart weeks={growth.weeklyActive} />
      </div>
      <RetentionTable rows={growth.retention} />
      <SignupSources
        sources={growth.signupSources}
        landingPages={growth.signupLandingPages}
        cohortDays={growth.cohortDays}
      />
    </div>
  );
}
