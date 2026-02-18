"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PixelBar } from "@/app/components/PixelBar";
import { AnimatedMoney, AnimatedStat } from "@/app/components/AnimatedStat";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const CAREER_LEVELS = {
  none: "UNEMPLOYED",
  intern: "INTERN",
  junior: "JUNIOR",
  mid: "MID-LEVEL",
  senior: "SENIOR",
  manager: "MANAGER",
  director: "DIRECTOR",
  executive: "EXECUTIVE",
  business_owner: "OWNER",
};

const DECISIONS = [
  // Career
  { id: "request_raise", label: "REQUEST RAISE", icon: "💰", category: "career", minCareer: "junior", desc: "Ask for a 10% salary increase. 60% success rate." },
  { id: "apply_job_mid", label: "APPLY: MID-LEVEL", icon: "📋", category: "career", minAge: 24, desc: "Apply for a mid-level position. +$2k/mo" },
  { id: "apply_job_senior", label: "APPLY: SENIOR", icon: "📋", category: "career", minAge: 28, desc: "Apply for a senior position. +$4.5k/mo" },
  { id: "start_side_hustle", label: "SIDE HUSTLE", icon: "🛠️", category: "career", desc: "Start a side project for +$500/mo income." },
  // Education
  { id: "enroll_trade", label: "TRADE SCHOOL", icon: "🔧", category: "education", maxEducation: "hs_diploma", desc: "Enroll in trade school. 2 years, boosts income ceiling." },
  { id: "enroll_bachelor", label: "GET BACHELOR'S", icon: "🎓", category: "education", maxEducation: "hs_diploma", desc: "Enroll in a 4-year bachelor program." },
  { id: "enroll_master", label: "GET MASTER'S", icon: "🎓", category: "education", minEducation: "bachelor", desc: "Master's degree. 2 years, big income boost." },
  // Housing
  { id: "buy_house_small", label: "BUY STARTER HOME", icon: "🏠", category: "housing", minCash: 50000, desc: "Buy a $250k starter home. 20% down required." },
  { id: "buy_house_medium", label: "BUY MID HOME", icon: "🏡", category: "housing", minCash: 100000, desc: "Buy a $450k home. 20% down required." },
  // Investment
  { id: "invest_1k", label: "INVEST $1,000", icon: "📈", category: "invest", minCash: 1000, desc: "Move $1,000 to stock portfolio." },
  { id: "invest_5k", label: "INVEST $5,000", icon: "📈", category: "invest", minCash: 5000, desc: "Move $5,000 to stock portfolio." },
  { id: "invest_10k", label: "INVEST $10,000", icon: "📈", category: "invest", minCash: 10000, desc: "Move $10,000 to stock portfolio." },
  { id: "retire_500", label: "RETIRE +$500", icon: "🏦", category: "invest", minCash: 500, desc: "Add $500 to retirement account." },
  { id: "retire_2k", label: "RETIRE +$2,000", icon: "🏦", category: "invest", minCash: 2000, desc: "Add $2,000 to retirement account." },
  // Debt
  { id: "pay_student_1k", label: "PAY STUDENT LOAN $1k", icon: "📚", category: "debt", minCash: 1000, desc: "Extra $1,000 student loan payment." },
  { id: "pay_student_5k", label: "PAY STUDENT LOAN $5k", icon: "📚", category: "debt", minCash: 5000, desc: "Extra $5,000 student loan payment." },
  { id: "pay_cc", label: "PAY CREDIT CARD", icon: "💳", category: "debt", minCash: 500, desc: "Pay off credit card debt balance." },
  // Lifestyle
  { id: "lifestyle_frugal", label: "GO FRUGAL", icon: "💸", category: "lifestyle", desc: "Cut spending to 85%. Less fun, more savings." },
  { id: "lifestyle_normal", label: "NORMAL SPENDING", icon: "⚖️", category: "lifestyle", desc: "Standard cost of living. 100% expenses." },
  { id: "lifestyle_lavish", label: "LIVE IT UP", icon: "🎉", category: "lifestyle", desc: "Spend 130%. Happiness +, savings -." },
];

function DecisionButton({
  decision,
  game,
  onDecision,
}: {
  decision: (typeof DECISIONS)[number];
  game: any;
  onDecision: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  // Check eligibility
  const age = game.currentAge;
  const cash = game.cash;
  const career = game.careerLevel;
  const education = game.educationLevel;

  const careerOrder = ["none", "intern", "junior", "mid", "senior", "manager", "director", "executive", "business_owner"];
  const eduOrder = ["none", "hs_diploma", "trade", "associate", "bachelor", "master", "phd", "md", "jd"];

  let eligible = true;
  let reason = "";

  if (decision.minAge && age < decision.minAge) { eligible = false; reason = `Need age ${decision.minAge}+`; }
  if (decision.minCash && cash < decision.minCash) { eligible = false; reason = `Need $${decision.minCash.toLocaleString()}`; }
  if (decision.minCareer && careerOrder.indexOf(career) < careerOrder.indexOf(decision.minCareer)) {
    eligible = false; reason = `Need ${decision.minCareer} level`;
  }
  if (decision.maxEducation && eduOrder.indexOf(education) > eduOrder.indexOf(decision.maxEducation)) {
    eligible = false; reason = "Already completed";
  }
  if (decision.minEducation && eduOrder.indexOf(education) < eduOrder.indexOf(decision.minEducation)) {
    eligible = false; reason = `Need ${decision.minEducation} degree`;
  }
  // Housing: can't buy if already own
  if (decision.category === "housing" && game.realEstateValue > 0) {
    eligible = false; reason = "Already own property";
  }
  // Debt: only show if has relevant debt
  if (decision.id === "pay_student_1k" || decision.id === "pay_student_5k") {
    if (game.studentLoanDebt === 0) { eligible = false; reason = "No student loans"; }
  }
  if (decision.id === "pay_cc") {
    if (game.creditCardDebt === 0) { eligible = false; reason = "No CC debt"; }
  }

  return (
    <div className="relative">
      <button
        className={`w-full text-left p-2 border font-terminal text-base transition-all ${
          eligible
            ? "border-[#00ff41] text-[#00ff41] hover:bg-[#001a08] hover:border-[#ffb000] hover:text-[#ffb000] cursor-pointer"
            : "border-[#00ff41] border-opacity-20 text-[#00ff41] text-opacity-30 cursor-not-allowed"
        }`}
        onClick={() => eligible && onDecision(decision.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={!eligible}
      >
        <span className="mr-2">{decision.icon}</span>
        <span className={eligible ? "" : "opacity-30"}>{decision.label}</span>
        {!eligible && <span className="ml-2 text-xs opacity-50">({reason})</span>}
      </button>
      {hovered && eligible && (
        <div className="absolute left-full top-0 ml-2 z-50 w-48 pixel-panel p-2 font-terminal text-sm text-[#00ff41] opacity-90">
          {decision.desc}
        </div>
      )}
    </div>
  );
}

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("id") as Id<"games"> | null;

  const game = useQuery(api.games.getGame, gameId ? { gameId } : "skip");
  const endMonth = useMutation(api.games.endMonth);
  const makeDecision = useMutation(api.games.makeDecision);
  const resolveEvent = useMutation(api.games.resolveEvent);
  const endGame = useMutation(api.games.endGame);
  const seedEvents = useMutation(api.seedEvents.seedEventTemplates);
  const getMilestone = useAction(api.claude.getMilestoneSummary);
  const setMilestoneNarrative = useMutation(api.games.setMilestoneNarrative);

  const [seeded, setSeeded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("career");
  const [notification, setNotification] = useState<{ text: string; type: string } | null>(null);

  // Seed events on first load
  useEffect(() => {
    if (!seeded) {
      seedEvents({}).then(() => setSeeded(true)).catch(() => setSeeded(true));
    }
  }, []);

  // Show notification helper
  const notify = (text: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle pending event redirect
  useEffect(() => {
    if (game?.pendingEventData && gameId) {
      router.push(`/event?id=${gameId}`);
    }
  }, [game?.pendingEventData]);

  // Handle milestone
  useEffect(() => {
    if (!game || !gameId) return;
    const age = game.currentAge;
    if (age >= 30 && !game.milestone30Done) {
      fetchMilestone(30);
    } else if (age >= 50 && !game.milestone50Done) {
      fetchMilestone(50);
    }
  }, [game?.currentAge]);

  // Handle game over
  useEffect(() => {
    if (game?.gameStatus === "complete" && gameId) {
      if (!game.finalScore) {
        endGame({ gameId }).then(() => {
          router.push(`/retirement?id=${gameId}`);
        });
      } else {
        router.push(`/retirement?id=${gameId}`);
      }
    }
  }, [game?.gameStatus]);

  const fetchMilestone = async (age: number) => {
    if (!game || !gameId) return;
    try {
      const narrative = await getMilestone({
        gameId: gameId.toString(),
        age,
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
        jobTitle: game.jobTitle || "Unemployed",
        industry: game.industry || "N/A",
        totalDebt: game.totalDebt,
        studentLoanDebt: game.studentLoanDebt,
        mortgageDebt: game.mortgageDebt,
        investmentPortfolio: game.investmentPortfolio,
        retirementAccount: game.retirementAccount,
        realEstateValue: game.realEstateValue,
        recentEvents: game.eventLog.slice(-3).map((e: any) => e.title),
      });
      await setMilestoneNarrative({ gameId, age, narrative });
      router.push(`/milestone?id=${gameId}&age=${age}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEndMonth = async () => {
    if (!gameId || processing) return;
    setProcessing(true);
    try {
      const result = await endMonth({ gameId });
      if (result?.checkMilestone) {
        // Milestone check handled by useEffect
      }
    } catch (e) {
      notify("Error advancing month", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleDecision = async (decisionId: string) => {
    if (!gameId || processing) return;
    setProcessing(true);

    try {
      let decisionType = "";
      let decisionData: any = {};

      if (decisionId === "request_raise") { decisionType = "request_raise"; }
      else if (decisionId === "start_side_hustle") { decisionType = "start_side_hustle"; }
      else if (decisionId === "apply_job_mid") {
        decisionType = "apply_job";
        decisionData = { targetLevel: "mid", jobTitle: "Mid-Level Professional", industry: game?.industry || "Technology" };
      } else if (decisionId === "apply_job_senior") {
        decisionType = "apply_job";
        decisionData = { targetLevel: "senior", jobTitle: "Senior Professional", industry: game?.industry || "Technology" };
      } else if (decisionId === "enroll_trade") {
        decisionType = "enroll_education";
        decisionData = { level: "trade" };
      } else if (decisionId === "enroll_bachelor") {
        decisionType = "enroll_education";
        decisionData = { level: "bachelor" };
      } else if (decisionId === "enroll_master") {
        decisionType = "enroll_education";
        decisionData = { level: "master" };
      } else if (decisionId === "buy_house_small") {
        decisionType = "buy_house";
        decisionData = { price: 250000 };
      } else if (decisionId === "buy_house_medium") {
        decisionType = "buy_house";
        decisionData = { price: 450000 };
      } else if (decisionId === "invest_1k") {
        decisionType = "invest_stocks"; decisionData = { amount: 1000 };
      } else if (decisionId === "invest_5k") {
        decisionType = "invest_stocks"; decisionData = { amount: 5000 };
      } else if (decisionId === "invest_10k") {
        decisionType = "invest_stocks"; decisionData = { amount: 10000 };
      } else if (decisionId === "retire_500") {
        decisionType = "invest_retirement"; decisionData = { amount: 500 };
      } else if (decisionId === "retire_2k") {
        decisionType = "invest_retirement"; decisionData = { amount: 2000 };
      } else if (decisionId === "pay_student_1k") {
        decisionType = "pay_debt"; decisionData = { amount: 1000, debtType: "student" };
      } else if (decisionId === "pay_student_5k") {
        decisionType = "pay_debt"; decisionData = { amount: 5000, debtType: "student" };
      } else if (decisionId === "pay_cc") {
        decisionType = "pay_debt";
        decisionData = { amount: game?.creditCardDebt || 0, debtType: "credit_card" };
      } else if (decisionId === "lifestyle_frugal") {
        decisionType = "set_lifestyle"; decisionData = { multiplier: 0.85 };
      } else if (decisionId === "lifestyle_normal") {
        decisionType = "set_lifestyle"; decisionData = { multiplier: 1.0 };
      } else if (decisionId === "lifestyle_lavish") {
        decisionType = "set_lifestyle"; decisionData = { multiplier: 1.3 };
      }

      if (decisionType) {
        const result = await makeDecision({ gameId, decisionType, decisionData });
        if (result?.outcome) {
          notify(result.outcome, "success");
          setLastOutcome(result.outcome);
        }
      }
    } catch (e) {
      notify("Decision failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (!gameId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-pixel text-[#ff0044] text-xs">NO GAME ID PROVIDED</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-pixel text-[#00ff41] text-xs cursor-blink">LOADING GAME...</div>
      </div>
    );
  }

  const monthLabel = MONTHS[game.currentMonth - 1] || "JAN";
  const categories = ["career", "education", "housing", "invest", "debt", "lifestyle"];

  // Filter decisions by category
  const filteredDecisions = DECISIONS.filter((d) => d.category === activeCategory);

  // Age progress (from starting age to 75)
  const startAge = game.startingPoint === "high_school" ? 16 : game.startingPoint === "college" ? 18 : 22;
  const ageProgress = ((game.currentAge - startAge) / (75 - startAge)) * 100;

  // Net worth color
  const nwColor = game.netWorth >= 0 ? "#ffb000" : "#ff0044";

  return (
    <div className="crt min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Notification toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 pixel-panel p-3 font-terminal text-lg event-slide-in ${
            notification.type === "success"
              ? "text-[#00ff41] border-[#00ff41]"
              : notification.type === "error"
              ? "text-[#ff0044] border-[#ff0044]"
              : "text-[#ffb000] border-[#ffb000]"
          }`}
        >
          {notification.text}
        </div>
      )}

      {/* ── TOP BAR ─────────────────────────────────── */}
      <div className="bg-[#0d1117] border-b-2 border-[#00ff41] p-2 flex items-center gap-4 flex-wrap">
        <div className="font-pixel text-[#00ff41] text-xs glow-green">LIFE LEDGER</div>
        <div className="flex-1 flex items-center gap-6 flex-wrap justify-center">
          <div className="text-center">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60">AGE</div>
            <div className="font-terminal text-[#ffb000] text-2xl glow-amber">
              <AnimatedStat value={game.currentAge} color="#ffb000" />
            </div>
          </div>
          <div className="text-center">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60">MONTH</div>
            <div className="font-terminal text-[#00ff41] text-2xl">{monthLabel}</div>
          </div>
          <div className="text-center">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60">CASH</div>
            <div className="font-terminal text-2xl">
              <AnimatedMoney value={game.cash} />
            </div>
          </div>
          <div className="text-center">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60">NET WORTH</div>
            <div className="font-terminal text-2xl" style={{ color: nwColor }}>
              <AnimatedMoney value={game.netWorth} />
            </div>
          </div>
          <div className="text-center">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60">INCOME/MO</div>
            <div className="font-terminal text-2xl text-[#00ff41]">
              <AnimatedMoney value={game.monthlyIncome} />
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="font-terminal text-[#00ff41] opacity-60 text-sm">
            {game.displayName}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 p-2 min-h-0">
        {/* LEFT: Stats Panel */}
        <div className="pixel-panel p-3 lg:w-56 shrink-0 space-y-3 overflow-y-auto">
          <div className="font-pixel text-[#ffb000] text-xs mb-2">CHARACTER STATS</div>

          {/* Happiness */}
          <PixelBar label="HAPPINESS" value={game.happiness} color="auto" />

          {/* Health */}
          <PixelBar label="HEALTH" value={game.health} color="auto" />

          <div className="border-t border-[#00ff41] border-opacity-20 pt-2 space-y-1">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60">FINANCES</div>
            {[
              { label: "INCOME", value: game.monthlyIncome, prefix: "$", suffix: "/mo" },
              { label: "EXPENSES", value: game.monthlyExpenses, prefix: "$", suffix: "/mo" },
              { label: "CASH FLOW", value: game.monthlyIncome - game.monthlyExpenses, prefix: "$", suffix: "/mo" },
            ].map(({ label, value, prefix, suffix }) => (
              <div key={label} className="flex justify-between font-terminal text-base">
                <span className="opacity-60">{label}</span>
                <span style={{ color: value >= 0 ? "#ffb000" : "#ff0044" }}>
                  {value < 0 ? "-" : ""}{prefix}{Math.abs(value).toLocaleString()}{suffix}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#00ff41] border-opacity-20 pt-2 space-y-1">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60">ASSETS</div>
            {[
              { label: "STOCKS", value: game.investmentPortfolio },
              { label: "REAL EST.", value: game.realEstateValue },
              { label: "RETIRE", value: game.retirementAccount },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between font-terminal text-base">
                <span className="opacity-60">{label}</span>
                <span className="text-[#00ff41]">${value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#00ff41] border-opacity-20 pt-2 space-y-1">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60">DEBTS</div>
            {[
              { label: "STUDENT", value: game.studentLoanDebt },
              { label: "MORTGAGE", value: game.mortgageDebt },
              { label: "CREDIT", value: game.creditCardDebt },
            ].filter(d => d.value > 0).map(({ label, value }) => (
              <div key={label} className="flex justify-between font-terminal text-base">
                <span className="opacity-60">{label}</span>
                <span className="text-[#ff0044]">-${value.toLocaleString()}</span>
              </div>
            ))}
            {game.totalDebt === 0 && <div className="font-terminal text-[#00ff41] opacity-60 text-sm">DEBT FREE! 🎉</div>}
          </div>

          <div className="border-t border-[#00ff41] border-opacity-20 pt-2 space-y-1">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60">LIFE</div>
            <div className="font-terminal text-base space-y-1">
              <div className="flex justify-between">
                <span className="opacity-60">CAREER</span>
                <span className="text-[#ffb000]">{CAREER_LEVELS[game.careerLevel as keyof typeof CAREER_LEVELS] || "NONE"}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">EDU</span>
                <span className="text-[#ffb000] text-sm">{game.educationLevel.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">STATUS</span>
                <span className="text-[#ffb000] text-sm">{game.relationshipStatus.toUpperCase()}</span>
              </div>
              {game.dependents > 0 && (
                <div className="flex justify-between">
                  <span className="opacity-60">KIDS</span>
                  <span className="text-[#ffb000]">{game.dependents}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-[#00ff41] border-opacity-20 pt-2">
            <div className="font-terminal text-[#00ff41] opacity-60 text-sm">LIFETIME INCOME</div>
            <div className="font-terminal text-[#ffb000] text-base">${game.lifetimeIncome.toLocaleString()}</div>
          </div>
        </div>

        {/* CENTER: Decision Panel */}
        <div className="pixel-panel p-3 flex-1 flex flex-col min-h-0">
          <div className="font-pixel text-[#ffb000] text-xs mb-3">DECISIONS</div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1 mb-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-pixel text-xs px-2 py-1 border transition-all ${
                  activeCategory === cat
                    ? "bg-[#00ff41] text-black border-[#00ff41]"
                    : "bg-transparent text-[#00ff41] border-[#00ff41] opacity-60 hover:opacity-100"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Decisions list */}
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {filteredDecisions.map((decision) => (
              <DecisionButton
                key={decision.id}
                decision={decision}
                game={game}
                onDecision={handleDecision}
              />
            ))}
          </div>

          {/* Last outcome */}
          {lastOutcome && (
            <div className="mt-3 p-2 border border-[#ffb000] border-opacity-40">
              <div className="font-terminal text-[#ffb000] text-sm">▸ {lastOutcome}</div>
            </div>
          )}

          {/* End Month button */}
          <div className="mt-3">
            <button
              className={`w-full pixel-btn pixel-btn-amber text-center py-3 text-sm ${processing ? "pixel-btn-disabled" : ""}`}
              onClick={handleEndMonth}
              disabled={processing}
            >
              {processing ? "PROCESSING..." : `▶ END ${monthLabel} → NEXT MONTH`}
            </button>
          </div>
        </div>

        {/* RIGHT: Event Feed */}
        <div className="pixel-panel p-3 lg:w-56 shrink-0 overflow-y-auto">
          <div className="font-pixel text-[#ffb000] text-xs mb-3">RECENT EVENTS</div>

          {game.eventLog.length === 0 ? (
            <div className="font-terminal text-[#00ff41] opacity-40 text-sm">
              No events yet. Start playing to see life events here.
            </div>
          ) : (
            <div className="space-y-2">
              {[...game.eventLog].reverse().slice(0, 5).map((event: any, i: number) => (
                <div
                  key={i}
                  className={`p-2 border border-[#00ff41] border-opacity-30 ${i === 0 ? "event-slide-in" : ""}`}
                >
                  <div className="font-pixel text-xs text-[#ffb000]">
                    AGE {event.age} — {MONTHS[(event.month - 1) % 12]}
                  </div>
                  <div className="font-terminal text-[#00ff41] text-sm mt-1">{event.title}</div>
                  <div className="font-terminal text-[#00ff41] opacity-60 text-xs mt-1 line-clamp-2">{event.body}</div>
                </div>
              ))}
            </div>
          )}

          {/* Decision Log */}
          {game.decisionsLog.length > 0 && (
            <div className="mt-4">
              <div className="font-pixel text-[#00ff41] text-xs opacity-60 mb-2">DECISIONS</div>
              <div className="space-y-1">
                {[...game.decisionsLog].reverse().slice(0, 3).map((d: any, i: number) => (
                  <div key={i} className="font-terminal text-xs text-[#00ff41] opacity-60">
                    ▸ {d.outcome}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM: Age Progress ──────────────────────── */}
      <div className="bg-[#0d1117] border-t-2 border-[#00ff41] p-2">
        <div className="flex items-center gap-3">
          <div className="font-pixel text-xs text-[#00ff41] opacity-60 shrink-0">
            AGE {startAge}
          </div>
          <div className="flex-1">
            <PixelBar value={ageProgress} color="green" showValue={false} height={12} />
          </div>
          <div className="font-pixel text-xs text-[#ffb000] opacity-80 shrink-0">
            AGE 75
          </div>
          <div className="font-terminal text-[#ffb000] text-sm shrink-0">
            {Math.round(ageProgress)}% COMPLETE
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="font-pixel text-[#00ff41] text-xs cursor-blink">LOADING...</div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
