"use client";

interface PixelBarProps {
  value: number; // 0-100
  color?: "green" | "amber" | "red" | "auto";
  label?: string;
  showValue?: boolean;
  height?: number;
}

export function PixelBar({
  value,
  color = "auto",
  label,
  showValue = true,
  height = 16,
}: PixelBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  let barColor = color;
  if (color === "auto") {
    barColor = clampedValue >= 60 ? "green" : clampedValue >= 30 ? "amber" : "red";
  }

  const colorClass = {
    green: "pixel-bar-fill",
    amber: "pixel-bar-fill pixel-bar-fill-amber",
    red: "pixel-bar-fill pixel-bar-fill-red",
  }[barColor as "green" | "amber" | "red"] || "pixel-bar-fill";

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between font-terminal text-sm mb-1">
          <span className="text-[#00ff41] opacity-70">{label}</span>
          {showValue && (
            <span className="text-[#ffb000]">{Math.round(clampedValue)}/100</span>
          )}
        </div>
      )}
      <div
        className="pixel-bar-container"
        style={{ height: `${height}px` }}
      >
        <div
          className={colorClass}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
