"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const LOGO_LINES = [
  "██╗     ██╗███████╗███████╗",
  "██║     ██║██╔════╝██╔════╝",
  "██║     ██║█████╗  █████╗  ",
  "██║     ██║██╔══╝  ██╔══╝  ",
  "███████╗██║██║     ███████╗",
  "╚══════╝╚═╝╚═╝     ╚══════╝",
  "    LEDGER  v1.0            ",
];

const GRADE_COLORS: Record<string, string> = {
  "A+": "text-[#00ff41]",
  A: "text-[#00ff41]",
  "A-": "text-[#00ff41]",
  "B+": "text-[#66ff66]",
  B: "text-[#66ff66]",
  "B-": "text-[#66ff66]",
  "C+": "text-[#ffb000]",
  C: "text-[#ffb000]",
  "C-": "text-[#ffb000]",
  "D+": "text-[#ff6600]",
  D: "text-[#ff6600]",
  "D-": "text-[#ff6600]",
  F: "text-[#ff0044]",
};

export default function TitleScreen() {
  const [blink, setBlink] = useState(true);
  const [showLogo, setShowLogo] = useState(false);
  const [logoLines, setLogoLines] = useState<string[]>([]);

  const leaderboard = useQuery(api.leaderboard.getLeaderboard, { limit: 5 });

  useEffect(() => {
    // Animate logo lines appearing
    const timer = setTimeout(() => setShowLogo(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showLogo) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < LOGO_LINES.length) {
        setLogoLines((prev) => [...prev, LOGO_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [showLogo]);

  useEffect(() => {
    const interval = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="crt min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative corners */}
      <div className="absolute top-4 left-4 text-[#00ff41] opacity-30 font-pixel text-xs">
        ╔══╗
        <br />║
        <br />║
      </div>
      <div className="absolute top-4 right-4 text-[#00ff41] opacity-30 font-pixel text-xs text-right">
        ╗══╗
        <br />║
        <br />║
      </div>
      <div className="absolute bottom-4 left-4 text-[#00ff41] opacity-30 font-pixel text-xs">
        ║
        <br />║
        <br />
        ╚══╝
      </div>
      <div className="absolute bottom-4 right-4 text-[#00ff41] opacity-30 font-pixel text-xs text-right">
        ║
        <br />║
        <br />
        ╝══╝
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl w-full">
        {/* ASCII Logo */}
        <div className="text-center">
          <pre className="font-pixel text-[#00ff41] glow-green text-xs sm:text-sm leading-tight">
            {logoLines.map((line, i) => (
              <span key={i} className="block roll-in">
                {line}
              </span>
            ))}
          </pre>
          <div className="font-terminal text-[#ffb000] text-2xl mt-2 glow-amber">
            FINANCIAL LIFE SIMULATOR
          </div>
          <div className="font-terminal text-[#00ff41] opacity-60 text-lg mt-1">
            LIVE FROM AGE 16 TO 75 · EVERY DECISION COUNTS
          </div>
        </div>

        {/* Press Start Button */}
        <div className="text-center">
          <Link href="/setup" className="pixel-btn pixel-btn-amber text-lg px-8 py-4">
            ▶ PRESS START
          </Link>
          <div
            className={`font-terminal text-[#00ff41] text-lg mt-4 transition-opacity ${
              blink ? "opacity-100" : "opacity-0"
            }`}
          >
            INSERT COIN TO PLAY
          </div>
        </div>

        {/* Instructions */}
        <div className="pixel-panel p-4 w-full max-w-lg">
          <div className="font-pixel text-[#ffb000] text-xs mb-3">
            HOW TO PLAY
          </div>
          <div className="font-terminal text-[#00ff41] text-lg space-y-1">
            <div>▸ CHOOSE YOUR STARTING POINT</div>
            <div>▸ MAKE MONTHLY FINANCIAL DECISIONS</div>
            <div>▸ SURVIVE RANDOM LIFE EVENTS</div>
            <div>▸ BUILD WEALTH FROM AGE 16 TO 75</div>
            <div>▸ SCORE BASED ON NET WORTH + HAPPINESS</div>
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="pixel-panel p-4 w-full max-w-lg">
          <div className="flex justify-between items-center mb-3">
            <div className="font-pixel text-[#ffb000] text-xs">
              TOP PLAYERS
            </div>
            <Link
              href="/leaderboard"
              className="font-terminal text-[#00ff41] text-base hover:text-[#ffb000] transition-colors"
            >
              VIEW ALL →
            </Link>
          </div>

          {leaderboard === undefined ? (
            <div className="font-terminal text-[#00ff41] opacity-60 text-lg text-center py-2">
              LOADING...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="font-terminal text-[#00ff41] opacity-60 text-lg text-center py-2">
              NO SCORES YET — BE THE FIRST!
            </div>
          ) : (
            <div className="space-y-1">
              {leaderboard.map((entry, i) => (
                <div
                  key={entry._id}
                  className="flex items-center justify-between font-terminal text-lg"
                >
                  <span className="text-[#ffb000] w-6">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                  </span>
                  <span className="text-[#00ff41] flex-1 ml-2 truncate">
                    {entry.displayName}
                  </span>
                  <span
                    className={`${GRADE_COLORS[entry.grade] || "text-[#00ff41]"} w-8 text-center font-pixel text-xs`}
                  >
                    {entry.grade}
                  </span>
                  <span className="text-[#00ff41] w-16 text-right opacity-80">
                    {entry.finalScore}pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Starting paths */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
          {[
            { label: "HIGH SCHOOL", age: "AGE 16", color: "text-[#00ff41]" },
            { label: "COLLEGE", age: "AGE 18", color: "text-[#ffb000]" },
            { label: "GRAD", age: "AGE 22", color: "text-[#ff6600]" },
          ].map((path) => (
            <div
              key={path.label}
              className="pixel-panel p-2 text-center"
            >
              <div className={`font-pixel text-xs ${path.color}`}>
                {path.label}
              </div>
              <div className="font-terminal text-[#00ff41] text-base">
                START @ {path.age}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
