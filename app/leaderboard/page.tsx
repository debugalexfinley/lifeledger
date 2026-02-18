"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

const GRADE_COLORS: Record<string, string> = {
  "A+": "#00ff41",
  "A": "#00ff41",
  "A-": "#00ff41",
  "B+": "#66ff66",
  "B": "#66ff66",
  "B-": "#66ff66",
  "C+": "#ffb000",
  "C": "#ffb000",
  "C-": "#ffb000",
  "D+": "#ff6600",
  "D": "#ff6600",
  "D-": "#ff6600",
  "F": "#ff0044",
};

const STARTING_POINT_LABELS: Record<string, string> = {
  high_school: "HS",
  college: "COL",
  post_college: "GRAD",
};

const PARENTAL_TIER_LABELS: Record<string, string> = {
  low: "WORKING",
  middle: "MIDDLE",
  high: "WEALTHY",
};

const RANK_ICONS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export default function LeaderboardPage() {
  const [startingPointFilter, setStartingPointFilter] = useState("all");
  const [parentalFilter, setParentalFilter] = useState("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const entries = useQuery(api.leaderboard.getLeaderboard, {
    startingPoint: startingPointFilter !== "all" ? startingPointFilter : undefined,
    parentalIncomeTier: parentalFilter !== "all" ? parentalFilter : undefined,
    limit: 100,
  });

  const totalEntries = entries?.length ?? 0;
  const pageEntries = entries?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) ?? [];
  const totalPages = Math.ceil(totalEntries / PAGE_SIZE);

  return (
    <div className="crt min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b-2 border-[#ffb000] bg-[#0d1117] p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-pixel text-[#ffb000] text-lg glow-amber">🏆 HIGH SCORES</div>
            <div className="font-terminal text-[#00ff41] opacity-60 text-lg">LIFELEDGER HALL OF FAME</div>
          </div>
          <Link href="/" className="pixel-btn text-xs px-4 py-2">
            ← MAIN MENU
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* Filters */}
        <div className="pixel-panel p-3 mb-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <div className="font-pixel text-xs text-[#00ff41] opacity-60 mb-2">STARTING POINT</div>
              <div className="flex gap-1">
                {["all", "high_school", "college", "post_college"].map((val) => (
                  <button
                    key={val}
                    onClick={() => { setStartingPointFilter(val); setPage(0); }}
                    className={`font-pixel text-xs px-2 py-1 border transition-all ${
                      startingPointFilter === val
                        ? "bg-[#ffb000] text-black border-[#ffb000]"
                        : "bg-transparent text-[#ffb000] border-[#ffb000] opacity-50 hover:opacity-100"
                    }`}
                  >
                    {val === "all" ? "ALL" : STARTING_POINT_LABELS[val]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="font-pixel text-xs text-[#00ff41] opacity-60 mb-2">BACKGROUND</div>
              <div className="flex gap-1">
                {["all", "low", "middle", "high"].map((val) => (
                  <button
                    key={val}
                    onClick={() => { setParentalFilter(val); setPage(0); }}
                    className={`font-pixel text-xs px-2 py-1 border transition-all ${
                      parentalFilter === val
                        ? "bg-[#00ff41] text-black border-[#00ff41]"
                        : "bg-transparent text-[#00ff41] border-[#00ff41] opacity-50 hover:opacity-100"
                    }`}
                  >
                    {val === "all" ? "ALL" : PARENTAL_TIER_LABELS[val]}
                  </button>
                ))}
              </div>
            </div>
            <div className="ml-auto font-terminal text-[#00ff41] opacity-50 text-lg">
              {totalEntries} GAMES COMPLETED
            </div>
          </div>
        </div>

        {/* Table */}
        {!entries ? (
          <div className="pixel-panel p-8 text-center">
            <div className="font-pixel text-[#00ff41] text-xs cursor-blink">LOADING LEADERBOARD...</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="pixel-panel p-8 text-center">
            <div className="text-4xl mb-3">📭</div>
            <div className="font-pixel text-[#ffb000] text-xs mb-2">NO SCORES YET</div>
            <div className="font-terminal text-[#00ff41] opacity-60 text-xl">
              Be the first to complete a game and make history!
            </div>
            <Link href="/setup" className="pixel-btn pixel-btn-amber mt-4 inline-block">
              START PLAYING →
            </Link>
          </div>
        ) : (
          <>
            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-1 px-3 py-2 font-pixel text-xs text-[#00ff41] opacity-40">
              <div className="col-span-1">#</div>
              <div className="col-span-3">NAME</div>
              <div className="col-span-1 text-center">GRADE</div>
              <div className="col-span-2 text-right">SCORE</div>
              <div className="col-span-2 text-right">NET WORTH</div>
              <div className="col-span-1 text-center">START</div>
              <div className="col-span-1 text-center">BG</div>
              <div className="col-span-1 text-right">HAPPY</div>
            </div>

            {/* Entries */}
            <div className="space-y-1">
              {pageEntries.map((entry, idx) => {
                const rank = page * PAGE_SIZE + idx + 1;
                const gradeColor = GRADE_COLORS[entry.grade] || "#ffb000";
                const isTop3 = rank <= 3;

                return (
                  <div
                    key={entry._id}
                    className={`grid grid-cols-12 gap-1 px-3 py-2 border transition-all hover:border-[#ffb000] cursor-default ${
                      isTop3
                        ? "border-opacity-60"
                        : "border-[#00ff41] border-opacity-15"
                    }`}
                    style={isTop3 ? { borderColor: gradeColor } : {}}
                  >
                    {/* Rank */}
                    <div className="col-span-1 font-terminal text-lg" style={{ color: isTop3 ? gradeColor : "#00ff41" }}>
                      {RANK_ICONS[rank] || `#${rank}`}
                    </div>

                    {/* Name */}
                    <div className="col-span-3 font-terminal text-xl overflow-hidden">
                      <span
                        className="truncate block"
                        style={{ color: isTop3 ? gradeColor : "#00ff41" }}
                      >
                        {entry.displayName}
                      </span>
                    </div>

                    {/* Grade */}
                    <div className="col-span-1 text-center">
                      <span
                        className="font-pixel text-base"
                        style={{
                          color: gradeColor,
                          textShadow: isTop3 ? `0 0 8px ${gradeColor}` : "none",
                        }}
                      >
                        {entry.grade}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="col-span-2 text-right font-terminal text-xl text-[#ffb000]">
                      {entry.finalScore}
                    </div>

                    {/* Net Worth */}
                    <div
                      className="col-span-2 text-right font-terminal text-lg"
                      style={{ color: entry.netWorth >= 0 ? "#00ff41" : "#ff0044" }}
                    >
                      {entry.netWorth < 0 ? "-" : ""}${Math.abs(entry.netWorth) >= 1_000_000
                        ? `${(entry.netWorth / 1_000_000).toFixed(1)}M`
                        : Math.abs(entry.netWorth) >= 1000
                        ? `${(entry.netWorth / 1000).toFixed(0)}K`
                        : entry.netWorth.toLocaleString()}
                    </div>

                    {/* Start */}
                    <div className="col-span-1 text-center font-terminal text-base text-[#00ff41] opacity-60">
                      {STARTING_POINT_LABELS[entry.startingPoint] || "?"}
                    </div>

                    {/* Background */}
                    <div className="col-span-1 text-center font-terminal text-base text-[#00ff41] opacity-60">
                      {PARENTAL_TIER_LABELS[entry.parentalIncomeTier]?.[0] || "?"}
                    </div>

                    {/* Happiness */}
                    <div className="col-span-1 text-right font-terminal text-base text-[#00ff41] opacity-60">
                      {entry.happinessQuotient}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  className={`pixel-btn text-xs px-3 py-2 ${page === 0 ? "pixel-btn-disabled" : ""}`}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  ← PREV
                </button>
                <span className="font-terminal text-[#00ff41] text-xl flex items-center px-3">
                  PAGE {page + 1} / {totalPages}
                </span>
                <button
                  className={`pixel-btn text-xs px-3 py-2 ${page >= totalPages - 1 ? "pixel-btn-disabled" : ""}`}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  NEXT →
                </button>
              </div>
            )}
          </>
        )}

        {/* Play CTA */}
        <div className="mt-8 text-center">
          <Link href="/setup" className="pixel-btn pixel-btn-amber px-8 py-4 text-sm">
            ▶ START NEW GAME
          </Link>
        </div>
      </div>
    </div>
  );
}
