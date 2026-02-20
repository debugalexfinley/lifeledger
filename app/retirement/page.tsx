"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PixelBar } from "@/app/components/PixelBar";
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

const GRADE_TITLES: Record<string, string> = {
  "A+": "LEGENDARY LIFE",
  "A": "EXCEPTIONAL LIFE",
  "A-": "OUTSTANDING LIFE",
  "B+": "GREAT LIFE",
  "B": "SOLID LIFE",
  "B-": "GOOD LIFE",
  "C+": "DECENT LIFE",
  "C": "AVERAGE LIFE",
  "C-": "BELOW AVERAGE",
  "D+": "ROUGH JOURNEY",
  "D": "HARD TIMES",
  "D-": "STRUGGLE CITY",
  "F": "GAME OVER, MAN",
};

const GRADE_EMOJIS: Record<string, string> = {
  "A+": "🏆",
  "A": "🥇",
  "A-": "⭐",
  "B+": "🎯",
  "B": "✅",
  "B-": "👍",
  "C+": "🤷",
  "C": "😐",
  "C-": "😬",
  "D+": "😅",
  "D": "😰",
  "D-": "💸",
  "F": "💀",
};

function StatRow({ label, value, color = "#ffb000" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-[#00ff41] border-opacity-10">
      <span className="font-terminal text-[#00ff41] opacity-60 text-lg">{label}</span>
      <span className="font-terminal text-xl" style={{ color }}>{value}</span>
    </div>
  );
}

function RetirementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("id") as Id<"games"> | null;

  const game = useQuery(api.games.getGame, gameId ? { gameId } : "skip");
  const getMilestone = useAction(api.claude.getMilestoneSummary);
  const setMilestoneNarrative = useMutation(api.games.setMilestoneNarrative);

  const [narrative, setNarrative] = useState<string>("");
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrativeDone, setNarrativeDone] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  // Fetch/generate narrative
  useEffect(() => {
    if (!game || narrativeLoading || narrativeDone) return;

    if (game.milestoneNarrative75) {
      setNarrative(game.milestoneNarrative75);
      setNarrativeDone(true);
      return;
    }

    // Generate narrative
    setNarrativeLoading(true);
    getMilestone({
      gameId: gameId!.toString(),
      age: 75,
      displayName: game.displayName,
      startingPoint: game.startingPoint,
      parentalIncomeTier: game.parentalIncomeTier,
      currentCash: game.cash,
      netWorth: game.netWorth,
      monthlyIncome: game.monthlyIncome,
      lifetimeIncome: game.lifetimeIncome,
      happiness: game.happiness,
      health: game.health,
      careerLevel: game.careerLevel,
      educationLevel: game.educationLevel,
      relationshipStatus: game.relationshipStatus,
      dependents: game.dependents,
      jobTitle: game.jobTitle || "Retired",
      industry: game.industry || "N/A",
      totalDebt: game.totalDebt,
      studentLoanDebt: game.studentLoanDebt,
      mortgageDebt: game.mortgageDebt,
      investmentPortfolio: game.investmentPortfolio,
      retirementAccount: game.retirementAccount,
      realEstateValue: game.realEstateValue,
      recentEvents: game.eventLog.slice(-5).map((e: { title: string }) => e.title),
    }).then(async (text) => {
      setNarrative(text);
      setNarrativeDone(true);
      setNarrativeLoading(false);
      if (gameId) {
        await setMilestoneNarrative({ gameId, age: 75, narrative: text });
      }
    }).catch(() => {
      setNarrative(`${game.displayName} reached the end of the ledger. A life defined by choice, chance, and character. The numbers are in.`);
      setNarrativeDone(true);
      setNarrativeLoading(false);
    });
  }, [game]);

  // Typewriter effect
  useEffect(() => {
    if (!narrative || textIndex >= narrative.length) return;
    const timeout = setTimeout(() => {
      setDisplayedText(narrative.slice(0, textIndex + 1));
      setTextIndex((i) => i + 1);
    }, 18);
    return () => clearTimeout(timeout);
  }, [narrative, textIndex]);

  const handleShare = () => {
    if (!game) return;
    const grade = game.finalGrade || "F";
    const nw = game.netWorth;
    const text = `I just finished Financial Pursuits! 🎮\n${game.displayName} — Grade: ${grade}\nNet Worth: $${nw.toLocaleString()}\nScore: ${game.finalScore}/100\nPlay at financialpursuits.com`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!gameId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-pixel text-[#ff0044] text-xs">NO GAME ID</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="font-pixel text-[#00ff41] text-xs cursor-blink">LOADING FINAL RESULTS...</div>
      </div>
    );
  }

  const grade = game.finalGrade || "F";
  const gradeColor = GRADE_COLORS[grade] || "#ffb000";
  const gradeTitle = GRADE_TITLES[grade] || "A LIFE LIVED";
  const gradeEmoji = GRADE_EMOJIS[grade] || "🏁";

  const startAge = game.startingPoint === "high_school" ? 16 : game.startingPoint === "college" ? 18 : 22;
  const yearsPlayed = 75 - startAge;

  return (
    <div className="crt min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 20%, ${gradeColor} 0%, transparent 60%)`,
        }}
      />

      {/* Header banner */}
      <div
        className="border-b-2 p-4 text-center"
        style={{ borderColor: gradeColor, background: `${gradeColor}11` }}
      >
        <div className="text-5xl mb-2">{gradeEmoji}</div>
        <div className="font-pixel text-xs mb-1" style={{ color: `${gradeColor}99` }}>
          GAME COMPLETE — {yearsPlayed} YEARS PLAYED
        </div>
        <div className="font-pixel text-2xl mb-1" style={{ color: gradeColor }}>
          {gradeTitle}
        </div>
        <div className="font-terminal text-[#00ff41] text-2xl opacity-70">
          {game.displayName} — Age 75
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Grade + Score */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className="pixel-panel p-6 text-center col-span-1"
            style={{ borderColor: gradeColor }}
          >
            <div className="font-pixel text-xs text-[#00ff41] opacity-60 mb-2">FINAL GRADE</div>
            <div
              className="font-pixel text-7xl"
              style={{
                color: gradeColor,
                textShadow: `0 0 20px ${gradeColor}88, 0 0 40px ${gradeColor}44`,
              }}
            >
              {grade}
            </div>
          </div>
          <div className="pixel-panel p-4 text-center col-span-1">
            <div className="font-pixel text-xs text-[#00ff41] opacity-60 mb-2">LIFE SCORE</div>
            <div className="font-pixel text-4xl text-[#ffb000]">{game.finalScore ?? "--"}</div>
            <div className="font-terminal text-[#00ff41] opacity-50 text-lg mt-1">out of 100</div>
            <button
              className="mt-2 font-pixel text-xs text-[#00ff41] opacity-50 hover:opacity-100 underline"
              onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
            >
              {showScoreBreakdown ? "hide" : "how?"}
            </button>
            {showScoreBreakdown && (
              <div className="mt-2 text-left space-y-1 font-terminal text-base text-[#00ff41]">
                <div className="opacity-60">Net Worth (40%): impacts wealth score</div>
                <div className="opacity-60">Lifetime Income (20%): total earnings</div>
                <div className="opacity-60">Avg Happiness (30%): wellbeing</div>
                <div className="opacity-60">Final Health (10%): vitality at 75</div>
              </div>
            )}
          </div>
          <div className="pixel-panel p-4 text-center col-span-1">
            <div className="font-pixel text-xs text-[#00ff41] opacity-60 mb-2">NET WORTH</div>
            <div
              className="font-pixel text-3xl"
              style={{ color: game.netWorth >= 0 ? "#ffb000" : "#ff0044" }}
            >
              {game.netWorth < 0 ? "-" : ""}${Math.abs(game.netWorth).toLocaleString()}
            </div>
            <div className="font-terminal text-[#00ff41] opacity-50 text-lg mt-1">at retirement</div>
          </div>
        </div>

        {/* Full Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Financials */}
          <div className="pixel-panel p-4">
            <div className="font-pixel text-[#ffb000] text-xs mb-3">💰 FINANCIAL LEDGER</div>
            <div className="space-y-1">
              <StatRow label="Lifetime Income" value={`$${game.lifetimeIncome.toLocaleString()}`} color="#00ff41" />
              <StatRow label="Cash" value={`$${game.cash.toLocaleString()}`} />
              <StatRow label="Investments" value={`$${game.investmentPortfolio.toLocaleString()}`} />
              <StatRow label="Real Estate" value={`$${game.realEstateValue.toLocaleString()}`} />
              <StatRow label="Retirement" value={`$${game.retirementAccount.toLocaleString()}`} />
              <StatRow label="Total Debt" value={`$${game.totalDebt.toLocaleString()}`} color={game.totalDebt > 0 ? "#ff0044" : "#00ff41"} />
              <StatRow label="Student Loans" value={`$${game.studentLoanDebt.toLocaleString()}`} color={game.studentLoanDebt > 0 ? "#ff0044" : "#00ff41"} />
              <StatRow label="Mortgage" value={`$${game.mortgageDebt.toLocaleString()}`} color={game.mortgageDebt > 0 ? "#ff6600" : "#00ff41"} />
            </div>
          </div>

          {/* Life Stats */}
          <div className="pixel-panel p-4">
            <div className="font-pixel text-[#ffb000] text-xs mb-3">👤 LIFE STATS</div>
            <div className="space-y-2 mb-3">
              <PixelBar label="FINAL HAPPINESS" value={game.happiness} color="auto" />
              <PixelBar label="FINAL HEALTH" value={game.health} color="auto" />
            </div>
            <div className="space-y-1">
              <StatRow label="Career Level" value={game.careerLevel.toUpperCase()} />
              <StatRow label="Job Title" value={game.jobTitle || "Retired"} color="#00ff41" />
              <StatRow label="Education" value={game.educationLevel.toUpperCase()} />
              <StatRow label="Relationship" value={game.relationshipStatus.toUpperCase()} />
              <StatRow label="Children" value={game.dependents.toString()} />
              <StatRow label="Starting Point" value={game.startingPoint.replace(/_/g, " ").toUpperCase()} />
              <StatRow label="Background" value={game.parentalIncomeTier.toUpperCase() + " INCOME"} />
            </div>
          </div>
        </div>

        {/* Business History */}
        {game.businessHistory && game.businessHistory.length > 0 && (
          <div className="pixel-panel p-4">
            <div className="font-pixel text-[#ffb000] text-xs mb-3">🏢 BUSINESS HISTORY</div>
            <div className="space-y-2">
              {game.businessHistory.map((biz: { businessTypeName: string; monthsActive: number; peakRevenue: number; outcome: string }, i: number) => (
                <div key={i} className="flex items-center gap-3 font-terminal text-lg border-b border-[#00ff41] border-opacity-10 pb-2">
                  <span className="text-[#ffb000]">{biz.businessTypeName}</span>
                  <span className="text-[#00ff41] opacity-50">•</span>
                  <span className="text-[#00ff41] opacity-60">{biz.monthsActive} months</span>
                  <span className="text-[#00ff41] opacity-50">•</span>
                  <span style={{ color: biz.outcome === "success" ? "#00ff41" : "#ff0044" }}>
                    {biz.outcome.toUpperCase()}
                  </span>
                  <span className="ml-auto text-[#ffb000]">Peak: ${biz.peakRevenue.toLocaleString()}/mo</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Highlights */}
        {game.eventLog && game.eventLog.length > 0 && (
          <div className="pixel-panel p-4">
            <div className="font-pixel text-[#ffb000] text-xs mb-3">📜 KEY LIFE EVENTS</div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {game.eventLog.slice(-10).reverse().map((ev: { age: number; title: string; body: string }, i: number) => (
                <div key={i} className="flex items-start gap-2 font-terminal text-base border-b border-[#00ff41] border-opacity-10 pb-1">
                  <span className="text-[#ffb000] shrink-0">AGE {ev.age}:</span>
                  <span className="text-[#00ff41]">{ev.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claude Narrative */}
        <div className="pixel-panel p-4" style={{ borderColor: gradeColor }}>
          <div className="font-pixel text-xs mb-3" style={{ color: gradeColor }}>
            ◈ THE FINAL CHRONICLE
          </div>
          {narrativeLoading && !narrative && (
            <div className="font-terminal text-[#00ff41] opacity-50 text-xl">
              Composing your life story...
              <span className="animate-pulse"> █</span>
            </div>
          )}
          {narrative && (
            <div className="font-terminal text-[#00ff41] text-xl leading-relaxed">
              {displayedText}
              {textIndex < narrative.length && (
                <span className="opacity-60 animate-pulse">█</span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            className="pixel-btn pixel-btn-amber py-4 text-center"
            onClick={handleShare}
          >
            {copied ? "✓ COPIED!" : "📋 SHARE RESULTS"}
          </button>
          <Link
            href="/leaderboard"
            className="pixel-btn py-4 text-center block"
          >
            🏆 HIGH SCORES
          </Link>
          <Link
            href="/"
            className="pixel-btn pixel-btn-red py-4 text-center block"
          >
            ↩ PLAY AGAIN
          </Link>
        </div>

        {/* Encouragement based on grade */}
        <div className="text-center font-terminal text-[#00ff41] opacity-40 text-xl pb-8">
          {grade.startsWith("A") && "Fortune favors the prepared. Legendary run."}
          {grade.startsWith("B") && "Solid foundations. Most can only dream of this."}
          {grade.startsWith("C") && "You survived. More than most can say."}
          {grade.startsWith("D") && "The struggle was real. Try again?"}
          {grade === "F" && "Adversity builds character. Maybe."}
        </div>
      </div>
    </div>
  );
}

export default function RetirementPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
          <div className="font-pixel text-[#00ff41] text-xs cursor-blink">
            CALCULATING YOUR LIFE SCORE...
          </div>
        </div>
      }
    >
      <RetirementContent />
    </Suspense>
  );
}
