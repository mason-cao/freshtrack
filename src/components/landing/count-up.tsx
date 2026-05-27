"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface CountUpProps {
  value: number;
  startValue?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  format?: "comma" | "none";
}

interface CountUpFrameOptions {
  elapsedMs: number;
  durationMs: number;
  startValue?: number;
  value: number;
}

export function formatCountUpValue(value: number, format: "comma" | "none") {
  return format === "comma" ? value.toLocaleString("en-US") : String(value);
}

export function getCountUpFrameValue({
  elapsedMs,
  durationMs,
  startValue = 0,
  value,
}: CountUpFrameOptions) {
  if (durationMs <= 0) return value;

  const progress = Math.min(Math.max(elapsedMs / durationMs, 0), 1);
  const eased = 1 - Math.pow(1 - progress, 4);
  return Math.round(startValue + (value - startValue) * eased);
}

export function CountUp({
  value,
  startValue = 0,
  prefix = "",
  suffix = "",
  duration = 1.6,
  format = "comma",
}: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const hasAnimated = useRef(false);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    if (!inView || hasAnimated.current) return;

    hasAnimated.current = true;
    setDisplay(startValue);

    let frame = 0;
    const start = performance.now();
    const durationMs = duration * 1000;

    function tick(now: number) {
      const nextDisplay = getCountUpFrameValue({
        elapsedMs: now - start,
        durationMs,
        startValue,
        value,
      });
      setDisplay(nextDisplay);

      if (nextDisplay < value) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, inView, reduceMotion, startValue, value]);

  const text = formatCountUpValue(display, format);

  return (
    <span ref={ref} className="num tabular-nums">
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
