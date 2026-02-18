"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedStatProps {
  value: number;
  prefix?: string;
  suffix?: string;
  color?: string;
  className?: string;
  formatFn?: (v: number) => string;
}

function formatCurrency(v: number): string {
  if (v < 0) return `-$${Math.abs(v).toLocaleString()}`;
  return `$${v.toLocaleString()}`;
}

export function AnimatedStat({
  value,
  prefix = "",
  suffix = "",
  color = "#ffb000",
  className = "",
  formatFn,
}: AnimatedStatProps) {
  const [displayed, setDisplayed] = useState(value);
  const [animating, setAnimating] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value === prevValue.current) return;
    setAnimating(true);

    const start = prevValue.current;
    const end = value;
    const duration = 400;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayed(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayed(end);
        setAnimating(false);
      }
    };

    requestAnimationFrame(animate);
    prevValue.current = value;
  }, [value]);

  const formatted = formatFn
    ? formatFn(displayed)
    : `${prefix}${displayed.toLocaleString()}${suffix}`;

  return (
    <span
      className={`font-terminal transition-all ${className} ${animating ? "stat-animate" : ""}`}
      style={{ color }}
    >
      {formatted}
    </span>
  );
}

export function AnimatedMoney({ value, className = "" }: { value: number; className?: string }) {
  return (
    <AnimatedStat
      value={value}
      formatFn={formatCurrency}
      color={value >= 0 ? "#ffb000" : "#ff0044"}
      className={className}
    />
  );
}
