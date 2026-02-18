"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

const GRADE_COLORS: Record<string, string> = {
  "A+": "#00ff41",
  A: "#00ff41",
  "A-": "#00ff41",
  "B+": "#66ff66",
  B: "#66ff66",
  "B-": "#66ff66",
  "C+": "#ffb000",
  C: "#ffb000",
  "C-": "#ffb000",
  "D+": "#ff6600",
  D: "#ff6600",
  "D-": "#ff6600",
  F: "#ff0044",
};

const RANK_ICONS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [filterStart, setFilterStart] = useState("all");
  const [filterTier, setFilterTier] = useState("all");

  const leaderboard = useQuery(api.leaderboard.getLeaderboard, {
    startingPoint: filterStart === "all" ? undefined : filterStart,
    parentalIncomeTier: filterTier === "all" ? undefined : filterTier,
    limit: 100,
  });

  const formatMoney = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
    return `$${n}`;
  };

  return (
    <div className="crt min-h-screen bg-[#0a0a0a] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="pixel-btn text-xs py-2 px-3">← BACK</Link>
          <div className="font-pixel text-[#ffb000] text-sm glow-amber">🏆 GLOBAL LEADERBOARD</div>
        </div>

        {/* Filters */}
        <div className="pixel-panel p-4 mb-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <div className="font-pixel text-xs text-[#00ff41] opacity-60 mb-2">STARTING POINT</div>
              <div className="flex gap-2 flex-wrap">
                {["all", "high_school", "college", "post_college"].map((val) => (
                  <button
                    key={val}
                    onClick={() => setFilterStart(val)}
                    className={`font-pixel text-xs px-2 py-1 border transition-all ${
                      filterStart === val
                        ? "bg-[#ffb000] text-black border-[#ffb000]"
                        : "text-[#00ff41] border-[#00ff41] opacity-60 hover:opacity-100"
                    }`}
                  >
                    {val.replace("_", " ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="font-pixel text-xs text-[#00ff41] opacity-60 mb-2">FAMILY BACKGROUND</div>
              <div className="flex gap-2 flex-wrap">
                {["all", "low", "middle", "high"].map((val) => (
                  <button
                    key={val}
                    onClick={() => setFilterTier(val)}
                    className={`font-pixel text-xs px-2 py-1 border transition-all ${
                      filterTier === val
                        ? "bg-[#ffb000] text-black border-[#ffb000]"
                        : "text-[#00ff41] border-[#00ff41] opacity-60 hover:opacity-100"
                    }`}
                  >
                    {val.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="pixel-panel overflow-x-auto">
          {/* Table header */}
          <div className="grid grid-cols-[2rem_1fr_4rem_4rem_5rem_5rem_4rem_4rem] gap-2 p-3 border-b-2 border-[#00ff41] border-opacity-30">
            {["#", "PLAYER", "GRADE", "SCORE", "NET WORTH", "INCOME", "HAPPY", "HEALTH"].map((h) => (
              <div key={h} className="font-pixel text-xs text-[#ffb000] opacity-80">{h}</div>
            ))}
          </div>

          {/* Table rows */}
          {leaderboard === undefined ? (
            <div className="text-center p-8 font-terminal text-[#00ff41] opacity-60 text-xl">
              LOADING SCORES...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center p-8 space-y-3">
              <div className="font-pixel text-[#00ff41] text-xs">NO SCORES YET</div>
              <div className="font-terminal text-[#00ff41] opacity-60 text-xl">
                Be the first to retire and claim the #1 spot!
              </div>
              <Link href="/setup" className="pixel-btn pixel-btn-amber inline-block">
                START PLAYING →
              </Link>
            </div>
          ) : (
            leaderboard.map((entry, i) => {
              const gradeColor = GRADE_COLORS[entry.grade] || "#ffb000";
              return (
                <div
                  key={entry._id}
                  className={`grid grid-cols-[2rem_1fr_4rem_4rem_5rem_5rem_4rem_4rem] gap-2 p-2 border-b border-[#00ff41] border-opacity-10 hover:bg-[#001a08] transition-colors ${
                    i < 3 ? "border-opacity-30" : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="font-terminal text-base text-[#ffb000]">
                    {i < 3 ? RANK_ICONS[i] : `${i + 1}`}
                  </div>

                  {/* Name + details */}
                  <div>
                    <div className="font-terminal text-[#00ff41] text-base truncate">
                      {entry.displayName}
                    </div>
                    <div className="font-pixel text-xs text-[#00ff41] opacity-40">
                      {entry.startingPoint.replace("_", " ")} · {entry.parentalIncomeTier}
                    </div>
                  </div>

                  {/* Grade */}
                  <div
                    className="font-pixel text-sm text-center self-center"
                    style={{ color: gradeColor }}
                  >
                    {entry.grade}
                  </div>

                  {/* Score */}
                  <div className="font-terminal text-[#ffb000] text-base self-center">
                    {entry.finalScore}
                  </div>

                  {/* Net worth */}
                  <div
                    className="font-terminal text-base self-center"
                    style={{ color: entry.netWorth >= 0 ? "#00ff41" : "#ff0044" }}
                  >
                    {formatMoney(entry.netWorth)}
                  </div>

                  {/* Lifetime income */}
                  <div className="font-terminal text-[#00ff41] text-base self-center">
                    {formatMoney(entry.lifetimeIncome)}
                  </div>

                  {/* Happiness */}
                  <div
                    className="font-terminal text-base self-center"
                    style={{
                      color:
                        entry.happinessQuotient >= 60
                          ? "#00ff41"
                          : entry.happinessQuotient >= 40
                          ? "#ffb000"
                          : "#ff0044",
                    }}
                  >
                    {entry.happinessQuotient}%
                  </div>

                  {/* Health */}
                  <div
                    className="font-terminal text-base self-center"
                    style={{
                      color:
                        entry.healthAtEnd >= 60
                          ? "#00ff41"
                          : entry.healthAtEnd >= 40
                          ? "#ffb000"
                          : "#ff0044",
                    }}
                  >
                    {entry.healthAtEnd}%
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link href="/setup" className="pixel-btn pixel-btn-amber">
            ▶ PLAY NOW — CLAIM YOUR SPOT
          </Link>
        </div>
      </div>
    </div>
  );
}
