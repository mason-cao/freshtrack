"use client";

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  format?: "comma" | "none";
}

export function CountUp({
  value,
  prefix = "",
  suffix = "",
  format = "comma",
}: CountUpProps) {
  const text = format === "comma" ? value.toLocaleString("en-US") : String(value);

  return (
    <span className="num tabular-nums">
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
