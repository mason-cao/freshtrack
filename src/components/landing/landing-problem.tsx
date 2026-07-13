import { Reveal } from "./reveal";
import { CountUp } from "./count-up";

interface Stat {
  value: number;
  startValue?: number;
  prefix?: string;
  suffix?: string;
  formatted: string; // fallback for reduced-motion / SEO crawlers
  label: string;
  note: string;
}

const stats: Stat[] = [
  {
    value: 40,
    startValue: 30,
    prefix: "30–",
    suffix: "%",
    formatted: "30–40%",
    label: "of the U.S. food supply goes uneaten",
    note: "USDA",
  },
  {
    value: 2913,
    prefix: "$",
    formatted: "$2,913",
    label: "estimated annual cost for a household of four",
    note: "U.S. EPA, 2025",
  },
  {
    value: 58,
    suffix: "%",
    formatted: "58%",
    label: "of fugitive methane from U.S. landfills comes from food waste",
    note: "U.S. EPA",
  },
];

export function LandingProblem() {
  return (
    <section id="problem" className="relative bg-cream">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <Reveal>
          <p className="eyebrow text-sage-700">The problem</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
            A household of four can lose about{" "}
            <span className="text-sage-600">
              <CountUp value={2913} prefix="$" duration={1.8} />
            </span>{" "}
            in food each year.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Mostly produce in the back of the fridge. Mostly things you meant to use.
            Mostly because nobody can remember what&apos;s actually in the kitchen.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="hairline mt-12" aria-hidden />
        </Reveal>

        <dl className="mt-10 grid gap-y-10 gap-x-12 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <Reveal key={stat.formatted} delay={0.2 + i * 0.08}>
              <div className="flex flex-col">
                <dt className="num text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
                  <CountUp
                    value={stat.value}
                    startValue={stat.startValue}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    duration={1.6}
                  />
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-stone-600">
                  {stat.label}
                  <span className="mt-1 block text-xs text-stone-400">{stat.note}</span>
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
