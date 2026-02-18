"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PixelBar } from "@/app/components/PixelBar";

const MILESTONE_CONFIGS = {
  30: {
    title: "AGE 30 CHECKPOINT",
    subtitle: "A DECADE OF DECISIONS",
    icon: "🌟",
    bgGlow: "#ffb000",
    message: "You've survived your 20s. The foundation is set.",
  },
  50: {
    title: "AGE 50 CHECKPOINT",
    subtitle: "HALFWAY TO RETIREMENT",
    icon: "⚡",
    bgGlow: "#ff6600",
    message: "Peak earning years. What will you make of them?",
  },
  75: {
    title: "FINAL CHAPTER",
    subtitle: "THE LEDGER CLOSES",
    icon: "🏆",
    bgGlow: "#00ff41",
    message: "A life fully lived. The numbers don't lie.",
  },
};

function MilestoneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("id") as Id<"games"> | null;
  const age = parseInt(searchParams.get("age") || "30");

  const game = useQuery(api.games.getGame, gameId ? { gameId } : "skip");
  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  const config = MILESTONE_CONFIGS[age as keyof typeof MILESTONE_CONFIGS] || MILESTONE_CONFIGS[30];

  const narrative =
    age === 30
      ? game?.milestoneNarrative30
      : age === 50
      ? game?.milestoneNarrative50
      : game?.milestoneNarrative75;

  // Typewriter effect for narrative
  useEffect(() => {
    if (!narrative) return;
    setDisplayedText("");
    setTextIndex(0);
    const interval = setInterval(() => {
      setTextIndex((prev) => {
        if (prev >= narrative.length) {
          clearInterval(interval);
          return prev;
        }
        setDisplayedText(narrative.slice(0, prev + 1));
        return prev + 1;
      });
    }, 15);
    return () => clearInterval(interval);
  }, [narrative]);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="font-pixel text-[#00ff41] text-xs cursor-blink">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="crt min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${config.bgGlow} 0%, transparent 60%)`,
        }}
      />

      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-6xl mb-4">{config.icon}</div>
          <div className="font-pixel text-2xl mb-2" style={{ color: config.bgGlow }}>
            {config.title}
          </div>
          <div className="font-terminal text-[#00ff41] text-2xl opacity-70">
            {config.subtitle}
          </div>
          <div className="font-terminal text-[#ffb000] text-xl mt-2">
            {config.message}
          </div>
        </div>

        {/* Stats snapshot */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "NET WORTH", value: `$${game.netWorth.toLocaleString()}`, color: game.netWorth >= 0 ? "#ffb000" : "#ff0044" },
            { label: "LIFETIME INCOME", value: `$${game.lifetimeIncome.toLocaleString()}`, color: "#00ff41" },
            { label: "CAREER", value: game.careerLevel.toUpperCase(), color: "#ffb000" },
            { label: "EDUCATION", value: game.educationLevel.toUpperCase(), color: "#00ff41" },
            { label: "RELATIONSHIP", value: game.relationshipStatus.toUpperCase(), color: "#ff88cc" },
            { label: "DEPENDENTS", value: game.dependents.toString(), color: "#ffb000" },
          ].map(({ label, value, color }) => (
            <div key={label} className="pixel-panel p-3 text-center">
              <div className="font-pixel text-xs text-[#00ff41] opacity-60 mb-1">{label}</div>
              <div className="font-terminal text-xl" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Happiness & Health bars */}
        <div className="pixel-panel p-4 space-y-3">
          <PixelBar label="HAPPINESS" value={game.happiness} color="auto" />
          <PixelBar label="HEALTH" value={game.health} color="auto" />
        </div>

        {/* Claude Narrative */}
        <div className="pixel-panel p-4 border-[#ffb000]">
          <div className="font-pixel text-[#ffb000] text-xs mb-3">◈ LIFE CHRONICLE</div>
          {narrative ? (
            <div className="font-terminal text-[#00ff41] text-xl leading-relaxed">
              {displayedText}
              {textIndex < narrative.length && (
                <span className="opacity-60 animate-pulse">█</span>
              )}
            </div>
          ) : (
            <div className="font-terminal text-[#00ff41] opacity-50 text-xl">
              Generating your life story...
              <span className="animate-pulse"> █</span>
            </div>
          )}
        </div>

        {/* Continue button */}
        {narrative && textIndex >= narrative.length && (
          <div className="text-center">
            <button
              className="pixel-btn pixel-btn-amber text-lg px-8 py-3"
              onClick={() => router.push(`/game?id=${gameId}`)}
            >
              ▶ CONTINUE YOUR JOURNEY →
            </button>
          </div>
        )}
        {narrative && textIndex < narrative.length && (
          <div className="text-center">
            <button
              className="pixel-btn text-sm px-4 py-2"
              onClick={() => setTextIndex(narrative.length)}
            >
              SKIP INTRO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MilestonePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="font-pixel text-[#00ff41] text-xs cursor-blink">LOADING...</div>
      </div>
    }>
      <MilestoneContent />
    </Suspense>
  );
}
