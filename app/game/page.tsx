"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PixelBar } from "@/app/components/PixelBar";
import { AnimatedMoney, AnimatedStat } from "@/app/components/AnimatedStat";

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const CAREER_LEVELS: Record<string, string> = {
  none:"UNEMPLOYED", intern:"INTERN", junior:"JUNIOR", mid:"MID-LEVEL",
  senior:"SENIOR", manager:"MANAGER", director:"DIRECTOR",
  executive:"EXECUTIVE", business_owner:"OWNER",
};

// ─────────────────────────────────────────────────────────
// Extracurricular data (mirrors convex/games.ts)
// ─────────────────────────────────────────────────────────
const EXTRACURRICULARS = [
  { id:"toastmasters",       name:"Toastmasters",              cost:45,  recurring:true,  emoji:"🎤", gains:"publicSpeaking +3, comm +2",    timeLabel:"Monthly" },
  { id:"improv",             name:"Improv Comedy",             cost:150, recurring:true,  emoji:"🎭", gains:"comm +3, creativity +2, fear -15", timeLabel:"Monthly" },
  { id:"coding_bootcamp",    name:"Coding Bootcamp",           cost:200, recurring:true,  emoji:"💻", gains:"technicalSkill +5",              timeLabel:"Monthly, 6mo" },
  { id:"investment_club",    name:"Investment Club",           cost:50,  recurring:true,  emoji:"📊", gains:"financialLiteracy +3",           timeLabel:"Monthly" },
  { id:"writing_workshop",   name:"Writing Workshop",          cost:100, recurring:true,  emoji:"✍️", gains:"writing +3, creativity +2",     timeLabel:"Monthly" },
  { id:"networking_events",  name:"Networking Events",         cost:75,  recurring:true,  emoji:"🤝", gains:"networking +3, comm +2",         timeLabel:"Monthly" },
  { id:"martial_arts",       name:"Martial Arts",              cost:120, recurring:true,  emoji:"🥋", gains:"health +3, fear -10, lead +2",   timeLabel:"Monthly" },
  { id:"book_club",          name:"Book Club",                 cost:0,   recurring:true,  emoji:"📚", gains:"financialLiteracy +2, creativity +1", timeLabel:"Monthly, free" },
  { id:"yoga",               name:"Yoga / Meditation",         cost:40,  recurring:true,  emoji:"🧘", gains:"emotional +2, happiness +3",    timeLabel:"Monthly" },
  { id:"chess_club",         name:"Chess Club",                cost:0,   recurring:true,  emoji:"♟️", gains:"financialLiteracy +2",           timeLabel:"Monthly, free" },
  { id:"language_learning",  name:"Language Learning",         cost:0,   recurring:true,  emoji:"🌍", gains:"networking +1",                  timeLabel:"Monthly, free" },
  { id:"hypnosis",           name:"Hypnosis Cert.",            cost:400, recurring:false, emoji:"🌀", gains:"sales +8, emotional +5",         timeLabel:"One-time" },
  { id:"sales_training",     name:"Sales Training",            cost:500, recurring:false, emoji:"📣", gains:"sales +10, negotiation +3",       timeLabel:"One-time" },
  { id:"leadership_seminar", name:"Leadership Seminar",        cost:600, recurring:false, emoji:"🏆", gains:"leadership +7, emotional +3",    timeLabel:"One-time" },
];

// ─────────────────────────────────────────────────────────
// Decisions (original list)
// ─────────────────────────────────────────────────────────
const DECISIONS = [
  { id:"request_raise",     label:"REQUEST RAISE",        icon:"💰", category:"career",    minCareer:"junior", desc:"Ask for a 10% salary increase. 60% success rate." },
  { id:"apply_job_mid",     label:"APPLY: MID-LEVEL",     icon:"📋", category:"career",    minAge:24,          desc:"Apply for mid-level. +$2k/mo" },
  { id:"apply_job_senior",  label:"APPLY: SENIOR",        icon:"📋", category:"career",    minAge:28,          desc:"Apply for senior. +$4.5k/mo" },
  { id:"start_side_hustle", label:"SIDE HUSTLE",          icon:"🛠️", category:"career",    desc:"Start a side project for +$500/mo." },
  { id:"enroll_trade",      label:"TRADE SCHOOL",         icon:"🔧", category:"education", maxEducation:"hs_diploma", desc:"2 years, boosts income ceiling." },
  { id:"enroll_bachelor",   label:"GET BACHELOR'S",       icon:"🎓", category:"education", maxEducation:"hs_diploma", desc:"4-year bachelor program." },
  { id:"enroll_master",     label:"GET MASTER'S",         icon:"🎓", category:"education", minEducation:"bachelor",   desc:"Master's degree. 2 years, big income boost." },
  { id:"buy_house_small",   label:"BUY STARTER HOME",    icon:"🏠", category:"housing",   minCash:50000,  desc:"$250k home. 20% down required." },
  { id:"buy_house_medium",  label:"BUY MID HOME",        icon:"🏡", category:"housing",   minCash:100000, desc:"$450k home. 20% down required." },
  { id:"invest_1k",         label:"INVEST $1,000",        icon:"📈", category:"invest",    minCash:1000,   desc:"Move $1,000 to stock portfolio." },
  { id:"invest_5k",         label:"INVEST $5,000",        icon:"📈", category:"invest",    minCash:5000,   desc:"Move $5,000 to stock portfolio." },
  { id:"invest_10k",        label:"INVEST $10,000",       icon:"📈", category:"invest",    minCash:10000,  desc:"Move $10,000 to stock portfolio." },
  { id:"retire_500",        label:"RETIRE +$500",         icon:"🏦", category:"invest",    minCash:500,    desc:"Add $500 to retirement account." },
  { id:"retire_2k",         label:"RETIRE +$2,000",       icon:"🏦", category:"invest",    minCash:2000,   desc:"Add $2,000 to retirement account." },
  { id:"pay_student_1k",    label:"PAY STUDENT $1k",     icon:"📚", category:"debt",      minCash:1000,   desc:"Extra $1,000 student loan payment." },
  { id:"pay_student_5k",    label:"PAY STUDENT $5k",     icon:"📚", category:"debt",      minCash:5000,   desc:"Extra $5,000 student loan payment." },
  { id:"pay_cc",            label:"PAY CREDIT CARD",     icon:"💳", category:"debt",      minCash:500,    desc:"Pay off credit card balance." },
  { id:"lifestyle_frugal",  label:"GO FRUGAL",            icon:"💸", category:"lifestyle", desc:"Cut spending to 85%. Less fun, more savings." },
  { id:"lifestyle_normal",  label:"NORMAL SPENDING",      icon:"⚖️", category:"lifestyle", desc:"Standard cost of living." },
  { id:"lifestyle_lavish",  label:"LIVE IT UP",           icon:"🎉", category:"lifestyle", desc:"Spend 130%. Happiness up, savings down." },
];

// ─────────────────────────────────────────────────────────
// Skill labels
// ─────────────────────────────────────────────────────────
const SKILL_LABELS: Record<string, string> = {
  communicationSkill: "COMM", publicSpeaking: "PUBLIC SPEAKING", sales: "SALES",
  technicalSkill: "TECHNICAL", financialLiteracy: "FIN. LITERACY", leadership: "LEADERSHIP",
  writing: "WRITING", negotiation: "NEGOTIATION", networking: "NETWORKING",
  creativity: "CREATIVITY", emotionalIntelligence: "EMOTIONAL IQ", marketingSkill: "MARKETING",
};

const STACK_DESCRIPTIONS: Record<string, string> = {
  "Startup Founder":   "Technical + Entrepreneur + Marketing — +25% biz revenue",
  "Corporate Climber": "Leadership + Comm + Networking — +20% career income",
  "Media Machine":     "Writing + Marketing + Comm — +30% content biz revenue",
  "Deal Closer":       "Sales + Negotiation + Comm — +15% all income",
  "Renaissance Person":"5+ skills above 50 — +10% happiness at end",
  "The Polymath":      "7+ skills above 60 — 2.0x income multiplier (RARE)",
};

// ─────────────────────────────────────────────────────────
// Decision eligibility check
// ─────────────────────────────────────────────────────────
function checkDecisionEligible(decision: typeof DECISIONS[number], game: any) {
  const careerOrder = ["none","intern","junior","mid","senior","manager","director","executive","business_owner"];
  const eduOrder    = ["none","hs_diploma","trade","associate","bachelor","master","phd","md","jd"];
  let eligible = true, reason = "";
  if ((decision as any).minAge    && game.currentAge < (decision as any).minAge)    { eligible = false; reason = `Need age ${(decision as any).minAge}+`; }
  if ((decision as any).minCash   && game.cash < (decision as any).minCash)          { eligible = false; reason = `Need $${((decision as any).minCash as number).toLocaleString()}`; }
  if ((decision as any).minCareer && careerOrder.indexOf(game.careerLevel) < careerOrder.indexOf((decision as any).minCareer)) { eligible = false; reason = `Need ${(decision as any).minCareer}`; }
  if ((decision as any).maxEducation && eduOrder.indexOf(game.educationLevel) > eduOrder.indexOf((decision as any).maxEducation)) { eligible = false; reason = "Already completed"; }
  if ((decision as any).minEducation && eduOrder.indexOf(game.educationLevel) < eduOrder.indexOf((decision as any).minEducation)) { eligible = false; reason = `Need ${(decision as any).minEducation}`; }
  if (decision.category === "housing" && game.realEstateValue > 0) { eligible = false; reason = "Already own property"; }
  if ((decision.id === "pay_student_1k" || decision.id === "pay_student_5k") && game.studentLoanDebt === 0) { eligible = false; reason = "No student loans"; }
  if (decision.id === "pay_cc" && game.creditCardDebt === 0) { eligible = false; reason = "No CC debt"; }
  return { eligible, reason };
}

// ─────────────────────────────────────────────────────────
// DecisionButton
// ─────────────────────────────────────────────────────────
function DecisionButton({ decision, game, onDecision }: { decision: typeof DECISIONS[number]; game: any; onDecision: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const { eligible, reason } = checkDecisionEligible(decision, game);
  return (
    <div className="relative">
      <button
        className={`w-full text-left p-2 border font-terminal text-base transition-all ${
          eligible ? "border-[#00ff41] text-[#00ff41] hover:bg-[#001a08] hover:border-[#ffb000] hover:text-[#ffb000] cursor-pointer"
                   : "border-[#00ff41] border-opacity-20 text-[#00ff41] text-opacity-30 cursor-not-allowed"
        }`}
        onClick={() => eligible && onDecision(decision.id)}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        disabled={!eligible}>
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

// ─────────────────────────────────────────────────────────
// Stack Achievement Flash
// ─────────────────────────────────────────────────────────
function StackAchievement({ stackName, onDismiss }: { stackName: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="pixel-panel p-8 text-center border-[#ffb000] shadow-[0_0_60px_rgba(255,176,0,0.6)] max-w-md pointer-events-auto event-slide-in">
        <div className="font-pixel text-[#ffb000] text-xs mb-2">SKILL STACK UNLOCKED 🏆</div>
        <div className="font-pixel text-[#00ff41] text-xl mb-3 glow-green">{stackName}</div>
        <div className="font-terminal text-[#ffb000] opacity-80 text-sm mb-4">
          {STACK_DESCRIPTIONS[stackName] || "Rare achievement unlocked!"}
        </div>
        <button className="pixel-btn pixel-btn-amber text-xs" onClick={onDismiss}>DISMISS</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Dating Card (organic meeting)
// ─────────────────────────────────────────────────────────
function OrganicMeetingCard({ partner, gameId, onAction }: { partner: any; gameId: Id<"games">; onAction: () => void }) {
  const initiateConversation = useMutation(api.games.initiateConversation);
  const startDating           = useMutation(api.games.startDating);
  const dismiss               = useMutation(api.games.dismissOrganic);
  const [stage, setStage]     = useState<"intro" | "talking" | "result">("intro");
  const [success, setSuccess] = useState(false);

  const handleTalk = async () => {
    const res = await initiateConversation({ gameId, partnerIndex: 0 });
    setSuccess(!!res?.succeeded);
    setStage("result");
  };
  const handleDate = async () => {
    await startDating({ gameId, partnerIndex: 0 });
    onAction();
  };
  const handleDismiss = async () => {
    await dismiss({ gameId });
    onAction();
  };

  return (
    <div className="pixel-panel p-3 border-[#00ff41] mt-3">
      <div className="font-pixel text-[#ffb000] text-xs mb-2">⚡ SPONTANEOUS MEETING</div>
      <div className="font-terminal text-[#00ff41] text-base mb-1">
        You meet <span className="text-[#ffb000]">{partner.name}</span>
      </div>
      <div className="font-terminal text-sm opacity-70 space-y-0.5">
        <div>Career: {partner.career} · ${partner.monthlyIncome.toLocaleString()}/mo</div>
        <div>Traits: {partner.traits?.join(", ")}</div>
        <div>Compatibility: <span style={{ color: partner.compatibilityScore >= 70 ? "#00ff41" : partner.compatibilityScore >= 40 ? "#ffb000" : "#ff0044" }}>{partner.compatibilityScore}/100</span></div>
      </div>
      <div className="mt-3 space-y-1">
        {stage === "intro" && (
          <div className="flex gap-2">
            <button className="flex-1 pixel-btn text-xs py-1" onClick={handleTalk}>💬 START TALKING</button>
            <button className="pixel-btn text-xs py-1 opacity-50" onClick={handleDismiss}>✕</button>
          </div>
        )}
        {stage === "result" && success && (
          <div>
            <div className="font-terminal text-[#00ff41] text-sm mb-2">✓ Great conversation! {partner.name} is interested.</div>
            <div className="flex gap-2">
              <button className="flex-1 pixel-btn pixel-btn-amber text-xs py-1" onClick={handleDate}>❤️ ASK OUT</button>
              <button className="pixel-btn text-xs py-1 opacity-50" onClick={handleDismiss}>PASS</button>
            </div>
          </div>
        )}
        {stage === "result" && !success && (
          <div>
            <div className="font-terminal text-[#ff0044] text-sm mb-2">Didn't quite connect. Fear of rejection -2 though.</div>
            <button className="w-full pixel-btn text-xs py-1 opacity-50" onClick={handleDismiss}>OK</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Dating App Matches Panel
// ─────────────────────────────────────────────────────────
function DatingMatchesPanel({ matches, gameId, onClose }: { matches: any[]; gameId: Id<"games">; onClose: () => void }) {
  const startDating   = useMutation(api.games.startDating);
  const dismiss       = useMutation(api.games.dismissOrganic);

  const handleDate = async (i: number) => {
    await startDating({ gameId, partnerIndex: i });
    onClose();
  };

  return (
    <div className="pixel-panel p-3 mt-3 border-[#ffb000]">
      <div className="flex justify-between items-center mb-3">
        <div className="font-pixel text-[#ffb000] text-xs">💘 YOUR MATCHES ({matches.length})</div>
        <button className="font-terminal text-xs opacity-50 hover:opacity-100" onClick={() => { dismiss({ gameId }); onClose(); }}>✕ CLOSE</button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {matches.map((m, i) => (
          <div key={i} className="border border-[#00ff41] border-opacity-30 p-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-terminal text-[#ffb000] text-base">{m.name}</div>
                <div className="font-terminal text-xs opacity-60">{m.career} · ${m.monthlyIncome.toLocaleString()}/mo</div>
                <div className="font-terminal text-xs opacity-60">Traits: {m.traits?.join(", ")}</div>
                <div className="font-terminal text-xs mt-1">
                  Compat: <span style={{ color: m.compatibilityScore >= 70 ? "#00ff41" : m.compatibilityScore >= 40 ? "#ffb000" : "#ff0044" }}>{m.compatibilityScore}/100</span>
                  {" · "}Attract: {m.attractiveness}/10
                </div>
              </div>
              <button className="pixel-btn pixel-btn-amber text-xs ml-2 py-1 px-2 shrink-0" onClick={() => handleDate(i)}>
                ❤️ DATE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Game Component
// ─────────────────────────────────────────────────────────
function GameContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const gameId      = searchParams.get("id") as Id<"games"> | null;

  // Cast to any: Convex generated types may lag the updated schema.ts.
  // All new fields (activeDatingApp, iq, skills, habits, etc.) are present at runtime.
  const game                   = useQuery(api.games.getGame, gameId ? { gameId } : "skip") as any;
  const endMonth               = useMutation(api.games.endMonth);
  const makeDecision           = useMutation(api.games.makeDecision);
  const resolveEvent           = useMutation(api.games.resolveEvent);
  const endGame                = useMutation(api.games.endGame);
  const seedEvents             = useMutation(api.seedEvents.seedEventTemplates);
  const seedData               = useMutation(api.seedData.seedAll);
  const getMilestone           = useAction(api.claude.getMilestoneSummary);
  const setMilestoneNarrative  = useMutation(api.games.setMilestoneNarrative);
  const doExtracurricular      = useMutation(api.games.doExtracurricular);
  const setHealthHabit         = useMutation(api.games.setHealthHabit);
  const activateDatingApp      = useMutation(api.games.activateDatingApp);
  const generateDatingMatches  = useMutation(api.games.generateDatingMatches);
  const breakUp                = useMutation(api.games.breakUp);
  const proposeMarriage        = useMutation(api.games.proposeMarriage);
  const makeBusinessDecision   = useMutation(api.businessDecisions.makeBusinessDecision);
  const hireEmployee           = useMutation(api.businessDecisions.hireEmployee);
  const fireEmployee           = useMutation(api.businessDecisions.fireEmployee);

  const [seeded,           setSeeded]           = useState(false);
  const [processing,       setProcessing]       = useState(false);
  const [lastOutcome,      setLastOutcome]      = useState<string | null>(null);
  const [activeCategory,   setActiveCategory]   = useState("career");
  const [notification,     setNotification]     = useState<{ text: string; type: string } | null>(null);
  const [skillsExpanded,   setSkillsExpanded]   = useState(false);
  const [showMatches,      setShowMatches]      = useState(false);
  const [newStack,         setNewStack]         = useState<string | null>(null);
  const [lifeExpColor,     setLifeExpColor]     = useState("#00ff41");
  const [bizSubTab,        setBizSubTab]        = useState<"decisions" | "team" | "pipeline">("decisions");
  const [diyMode,          setDiyMode]          = useState<Record<string, boolean>>({});
  const [fireConfirm,      setFireConfirm]      = useState<number | null>(null);

  // Seed on mount
  useEffect(() => {
    if (!seeded) {
      Promise.all([seedEvents({}), seedData({})]).finally(() => setSeeded(true));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const notify = (text: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Redirect on pending event
  useEffect(() => {
    if (game?.pendingEventData && gameId) router.push(`/event?id=${gameId}`);
  }, [game?.pendingEventData, gameId, router]);

  // Milestone check
  useEffect(() => {
    if (!game || !gameId) return;
    const age = game.currentAge;
    if (age >= 30 && !game.milestone30Done) fetchMilestone(30);
    else if (age >= 50 && !game.milestone50Done) fetchMilestone(50);
  }, [game?.currentAge]); // eslint-disable-line react-hooks/exhaustive-deps

  // Game over
  useEffect(() => {
    if (game?.gameStatus === "complete" && gameId) {
      if (!game.finalScore) { endGame({ gameId }).then(() => router.push(`/retirement?id=${gameId}`)); }
      else router.push(`/retirement?id=${gameId}`);
    }
  }, [game?.gameStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Life expectancy color
  useEffect(() => {
    if (!game) return;
    const le = game.projectedLifeExpectancy ?? 78;
    setLifeExpColor(le >= 80 ? "#00ff41" : le >= 72 ? "#ffb000" : "#ff0044");
  }, [game?.projectedLifeExpectancy, game?.health]);

  const fetchMilestone = async (age: number) => {
    if (!game || !gameId) return;
    try {
      const narrative = await getMilestone({
        gameId: gameId.toString(), age, displayName: game.displayName,
        startingPoint: game.startingPoint, parentalIncomeTier: game.parentalIncomeTier,
        currentCash: game.cash, netWorth: game.netWorth, monthlyIncome: game.monthlyIncome,
        lifetimeIncome: game.lifetimeIncome, happiness: game.happiness, health: game.health,
        careerLevel: game.careerLevel, educationLevel: game.educationLevel,
        relationshipStatus: game.relationshipStatus, dependents: game.dependents,
        jobTitle: game.jobTitle || "Unemployed", industry: game.industry || "N/A",
        totalDebt: game.totalDebt, studentLoanDebt: game.studentLoanDebt,
        mortgageDebt: game.mortgageDebt, investmentPortfolio: game.investmentPortfolio,
        retirementAccount: game.retirementAccount, realEstateValue: game.realEstateValue,
        recentEvents: game.eventLog.slice(-3).map((e: any) => e.title),
      });
      await setMilestoneNarrative({ gameId, age, narrative });
      router.push(`/milestone?id=${gameId}&age=${age}`);
    } catch (e) { console.error(e); }
  };

  const handleEndMonth = async () => {
    if (!gameId || processing) return;
    setProcessing(true);
    try {
      const result = await endMonth({ gameId }) as any;
      if (result?.newlyUnlockedStack) setNewStack(result.newlyUnlockedStack);
    } catch { notify("Error advancing month", "error"); }
    finally { setProcessing(false); }
  };

  const handleDecision = async (decisionId: string) => {
    if (!gameId || processing) return;
    setProcessing(true);
    try {
      let decisionType = "";
      let decisionData: any = {};

      if (decisionId === "request_raise")      { decisionType = "request_raise"; }
      else if (decisionId === "start_side_hustle") { decisionType = "start_side_hustle"; }
      else if (decisionId === "apply_job_mid")     { decisionType = "apply_job"; decisionData = { targetLevel:"mid",    jobTitle:"Mid-Level Professional", industry: game?.industry || "Technology" }; }
      else if (decisionId === "apply_job_senior")  { decisionType = "apply_job"; decisionData = { targetLevel:"senior", jobTitle:"Senior Professional",    industry: game?.industry || "Technology" }; }
      else if (decisionId === "enroll_trade")      { decisionType = "enroll_education"; decisionData = { level:"trade"    }; }
      else if (decisionId === "enroll_bachelor")   { decisionType = "enroll_education"; decisionData = { level:"bachelor" }; }
      else if (decisionId === "enroll_master")     { decisionType = "enroll_education"; decisionData = { level:"master"  }; }
      else if (decisionId === "buy_house_small")   { decisionType = "buy_house";        decisionData = { price:250000 }; }
      else if (decisionId === "buy_house_medium")  { decisionType = "buy_house";        decisionData = { price:450000 }; }
      else if (decisionId === "invest_1k")         { decisionType = "invest_stocks";    decisionData = { amount:1000  }; }
      else if (decisionId === "invest_5k")         { decisionType = "invest_stocks";    decisionData = { amount:5000  }; }
      else if (decisionId === "invest_10k")        { decisionType = "invest_stocks";    decisionData = { amount:10000 }; }
      else if (decisionId === "retire_500")        { decisionType = "invest_retirement"; decisionData = { amount:500  }; }
      else if (decisionId === "retire_2k")         { decisionType = "invest_retirement"; decisionData = { amount:2000 }; }
      else if (decisionId === "pay_student_1k")    { decisionType = "pay_debt"; decisionData = { amount:1000, debtType:"student"      }; }
      else if (decisionId === "pay_student_5k")    { decisionType = "pay_debt"; decisionData = { amount:5000, debtType:"student"      }; }
      else if (decisionId === "pay_cc")            { decisionType = "pay_debt"; decisionData = { amount: game?.creditCardDebt || 0, debtType:"credit_card" }; }
      else if (decisionId === "lifestyle_frugal")  { decisionType = "set_lifestyle"; decisionData = { multiplier:0.85 }; }
      else if (decisionId === "lifestyle_normal")  { decisionType = "set_lifestyle"; decisionData = { multiplier:1.0  }; }
      else if (decisionId === "lifestyle_lavish")  { decisionType = "set_lifestyle"; decisionData = { multiplier:1.3  }; }

      if (decisionType) {
        const result = await makeDecision({ gameId, decisionType, decisionData });
        if (result?.outcome) { notify(result.outcome, "success"); setLastOutcome(result.outcome); }
      }
    } catch { notify("Decision failed", "error"); }
    finally { setProcessing(false); }
  };

  const handleExtracurricular = async (activityId: string) => {
    if (!gameId || processing) return;
    setProcessing(true);
    try {
      const result = await doExtracurricular({ gameId, activityId }) as any;
      if (result?.status === "ok") { notify(result.message, "success"); setLastOutcome(result.message); }
      else { notify(result?.message || "Activity failed", "error"); }
    } catch { notify("Activity failed", "error"); }
    finally { setProcessing(false); }
  };

  const handleSetHabit = async (habitType: any, value: string) => {
    if (!gameId) return;
    await setHealthHabit({ gameId, habitType, value });
    notify(`Updated ${habitType.replace("Habit","").replace(/([A-Z])/g," $1")} habit`, "success");
  };

  const handleActivateDatingApp = async () => {
    if (!gameId) return;
    const res = await activateDatingApp({ gameId }) as any;
    notify(res?.message || "Dating app activated", "success");
  };

  const handleGenerateMatches = async () => {
    if (!gameId) return;
    await generateDatingMatches({ gameId });
    setShowMatches(true);
  };

  const handleBusinessDecision = async (decisionId: string, usedHire: boolean) => {
    if (!gameId || processing) return;
    setProcessing(true);
    try {
      const res = await makeBusinessDecision({ gameId, decisionId, usedHire }) as any;
      if (res?.status === "ok") {
        notify(res.rippleDescription ?? "Decision executed!", "success");
        setLastOutcome(res.rippleDescription ?? "Decision executed!");
      } else {
        notify(res?.message ?? "Decision failed", "error");
      }
    } catch { notify("Business decision failed", "error"); }
    finally { setProcessing(false); }
  };

  const handleHireEmployee = async (candidateIndex: number) => {
    if (!gameId || processing) return;
    setProcessing(true);
    try {
      const res = await hireEmployee({ gameId, candidateIndex }) as any;
      if (res?.status === "ok") notify(res.message ?? "Hired!", "success");
      else notify(res?.message ?? "Hire failed", "error");
    } catch { notify("Hire failed", "error"); }
    finally { setProcessing(false); }
  };

  const handleFireEmployee = async (employeeIndex: number) => {
    if (!gameId || processing) return;
    setProcessing(true);
    setFireConfirm(null);
    try {
      const res = await fireEmployee({ gameId, employeeIndex }) as any;
      if (res?.status === "ok") notify(res.message ?? "Employee let go", "info");
      else notify(res?.message ?? "Fire failed", "error");
    } catch { notify("Fire failed", "error"); }
    finally { setProcessing(false); }
  };

  if (!gameId) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="font-pixel text-[#ff0044] text-xs">NO GAME ID PROVIDED</div>
    </div>
  );
  if (!game) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="font-pixel text-[#00ff41] text-xs cursor-blink">LOADING GAME...</div>
    </div>
  );

  const monthLabel   = MONTHS[(game.currentMonth - 1) % 12] || "JAN";
  const categories   = ["career","education","housing","invest","debt","lifestyle","grow","health","business"];
  const filteredDecs = DECISIONS.filter(d => d.category === activeCategory);
  const startAge     = game.startingPoint === "high_school" ? 16 : game.startingPoint === "college" ? 18 : 22;
  const ageProgress  = ((game.currentAge - startAge) / (75 - startAge)) * 100;
  const nwColor      = game.netWorth >= 0 ? "#ffb000" : "#ff0044";

  // Skills array for the panel
  const skillEntries = Object.entries(SKILL_LABELS).map(([key, label]) => ({
    key, label, value: (game as any)[key] ?? 10,
  }));
  const above60 = skillEntries.filter(s => s.value >= 60).length;

  // Life expectancy display
  const lifeExp = game.projectedLifeExpectancy ?? 78;

  // Dating state
  const hasOrganic = (game.pendingMatches?.length ?? 0) > 0 && !game.currentPartner && game.relationshipStatus === "single";
  const hasMatches = (game.pendingMatches?.length ?? 0) > 0 && showMatches;

  return (
    <div className="crt min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Stack achievement overlay */}
      {newStack && <StackAchievement stackName={newStack} onDismiss={() => setNewStack(null)} />}

      {/* Notification toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 pixel-panel p-3 font-terminal text-lg event-slide-in ${
          notification.type === "success" ? "text-[#00ff41] border-[#00ff41]"
          : notification.type === "error" ? "text-[#ff0044] border-[#ff0044]"
          : "text-[#ffb000] border-[#ffb000]"}`}>
          {notification.text}
        </div>
      )}

      {/* ── TOP BAR ───────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border-b-2 border-[#00ff41] p-2 flex items-center gap-4 flex-wrap">
        <div className="font-pixel text-[#00ff41] text-xs glow-green">LIFE LEDGER</div>
        <div className="flex-1 flex items-center gap-4 flex-wrap justify-center">
          {[
            { label:"AGE",      value: <AnimatedStat value={game.currentAge} color="#ffb000" /> },
            { label:"MONTH",    value: <span className="font-terminal text-[#00ff41] text-2xl">{monthLabel}</span> },
            { label:"CASH",     value: <AnimatedMoney value={game.cash} /> },
            { label:"NET WORTH",value: <span className="font-terminal text-2xl" style={{color:nwColor}}><AnimatedMoney value={game.netWorth} /></span> },
            { label:"INCOME/MO",value: <AnimatedMoney value={game.monthlyIncome} /> },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="font-pixel text-[#00ff41] text-xs opacity-60">{label}</div>
              <div>{value}</div>
            </div>
          ))}
          {/* Skill stack indicator */}
          {(game.skillStackMultiplier ?? 1) > 1 && (
            <div className="text-center">
              <div className="font-pixel text-xs opacity-60" style={{color:"#ffb000"}}>SKILL STACK</div>
              <div className="font-pixel text-sm" style={{color:"#ffb000"}}>
                {(game.skillStackMultiplier ?? 1).toFixed(2)}x
                {game.activeSkillStack && <span className="ml-1 text-xs opacity-70">— {game.activeSkillStack}</span>}
              </div>
            </div>
          )}
        </div>
        <div className="font-terminal text-[#00ff41] opacity-60 text-sm">{game.displayName}</div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 p-2 min-h-0">

        {/* LEFT: Stats Panel */}
        <div className="pixel-panel p-3 lg:w-60 shrink-0 space-y-3 overflow-y-auto">
          <div className="font-pixel text-[#ffb000] text-xs mb-2">CHARACTER STATS</div>

          <PixelBar label="HAPPINESS" value={game.happiness} color="auto" />
          <PixelBar label="HEALTH"    value={game.health}    color="auto" />

          {/* Life Expectancy */}
          <div className="flex justify-between items-center font-terminal text-sm">
            <span className="opacity-60">LIFE EXPECT.</span>
            <span style={{color: lifeExpColor}}>~{lifeExp} yrs</span>
          </div>

          {/* Biological attrs */}
          <div className="border-t border-[#00ff41] border-opacity-20 pt-2 space-y-1">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60">DNA / ATTRIBUTES</div>
            {[
              { label:"IQ",       value: game.iq,             suffix:"" },
              { label:"ATHLETIC", value: game.athleticGenetics, suffix:"" },
              { label:"HEIGHT",   value: null,                 display: game.heightInches ? `${Math.floor(game.heightInches/12)}'${game.heightInches%12}"` : "?" },
            ].map(({ label, value, suffix, display }) => (
              <div key={label} className="flex justify-between font-terminal text-sm">
                <span className="opacity-60">{label}</span>
                <span className="text-[#ffb000]">{display ?? `${value}${suffix}`}</span>
              </div>
            ))}
          </div>

          {/* Finances */}
          <div className="border-t border-[#00ff41] border-opacity-20 pt-2 space-y-1">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60">FINANCES</div>
            {[
              { label:"INCOME",    value: game.monthlyIncome },
              { label:"EXPENSES",  value: game.monthlyExpenses },
              { label:"CASH FLOW", value: game.monthlyIncome - game.monthlyExpenses },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between font-terminal text-sm">
                <span className="opacity-60">{label}</span>
                <span style={{color: value >= 0 ? "#ffb000" : "#ff0044"}}>
                  {value < 0 ? "-" : ""}${Math.abs(value).toLocaleString()}/mo
                </span>
              </div>
            ))}
          </div>

          {/* Assets */}
          <div className="border-t border-[#00ff41] border-opacity-20 pt-2 space-y-1">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60">ASSETS</div>
            {[
              { label:"STOCKS",  value: game.investmentPortfolio },
              { label:"REAL EST.", value: game.realEstateValue },
              { label:"RETIRE",  value: game.retirementAccount },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between font-terminal text-sm">
                <span className="opacity-60">{label}</span>
                <span className="text-[#00ff41]">${value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Debts */}
          {game.totalDebt > 0 && (
            <div className="border-t border-[#00ff41] border-opacity-20 pt-2 space-y-1">
              <div className="font-pixel text-[#00ff41] text-xs opacity-60">DEBTS</div>
              {[
                { label:"STUDENT",  value: game.studentLoanDebt },
                { label:"MORTGAGE", value: game.mortgageDebt    },
                { label:"CREDIT",   value: game.creditCardDebt  },
              ].filter(d => d.value > 0).map(({ label, value }) => (
                <div key={label} className="flex justify-between font-terminal text-sm">
                  <span className="opacity-60">{label}</span>
                  <span className="text-[#ff0044]">-${value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Life */}
          <div className="border-t border-[#00ff41] border-opacity-20 pt-2 space-y-1">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60">LIFE</div>
            <div className="font-terminal text-sm space-y-1">
              {[
                { label:"CAREER",  value: CAREER_LEVELS[game.careerLevel] || "NONE" },
                { label:"EDU",     value: game.educationLevel?.toUpperCase() },
                { label:"STATUS",  value: game.relationshipStatus?.toUpperCase() },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="opacity-60">{label}</span>
                  <span className="text-[#ffb000] text-xs">{value}</span>
                </div>
              ))}
              {(game.dependents ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="opacity-60">KIDS</span>
                  <span className="text-[#ffb000]">{game.dependents}</span>
                </div>
              )}
            </div>
          </div>

          {/* Health habits summary */}
          <div className="border-t border-[#00ff41] border-opacity-20 pt-2">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60 mb-1">HABITS</div>
            <div className="font-terminal text-xs space-y-0.5 opacity-70">
              <div>🏋️ {game.exerciseHabit ?? "moderate"}</div>
              <div>🥗 {game.dietHabit ?? "average"}</div>
              <div>💤 {game.sleepHabit ?? "6hrs"}</div>
              <div>🧠 stress: {game.stressManagement ?? "none"}</div>
            </div>
          </div>

          {/* Skill Stack summary */}
          <div className="border-t border-[#00ff41] border-opacity-20 pt-2">
            <button
              onClick={() => setSkillsExpanded(!skillsExpanded)}
              className="w-full text-left font-pixel text-[#00ff41] text-xs opacity-60 hover:opacity-100 flex justify-between items-center">
              <span>SKILLS ({above60} ≥60)</span>
              <span>{skillsExpanded ? "▲" : "▼"}</span>
            </button>

            {/* Collapsed: just multiplier */}
            {!skillsExpanded && (game.skillStackMultiplier ?? 1) > 1 && (
              <div className="font-pixel text-xs mt-1" style={{color:"#ffb000"}}>
                STACK: {(game.skillStackMultiplier ?? 1).toFixed(2)}x
                {game.activeSkillStack && <div className="opacity-70">{game.activeSkillStack} 🏆</div>}
              </div>
            )}

            {/* Expanded: full skill bars */}
            {skillsExpanded && (
              <div className="mt-2 space-y-1">
                {game.activeSkillStack && (
                  <div className="font-pixel text-xs mb-2 p-1 border border-[#ffb000] border-opacity-40" style={{color:"#ffb000"}}>
                    🏆 {game.activeSkillStack}<br/>
                    <span className="opacity-60 text-xs font-terminal">{STACK_DESCRIPTIONS[game.activeSkillStack]}</span>
                  </div>
                )}
                {skillEntries.map(({ key, label, value }) => (
                  <div key={key}>
                    <div className="flex justify-between font-terminal text-xs mb-0.5">
                      <span className="opacity-60">{label}</span>
                      <span style={{color: value >= 60 ? "#00ff41" : value >= 30 ? "#ffb000" : "#ff0044"}}>{value}</span>
                    </div>
                    <PixelBar value={value} color="auto" showValue={false} height={6} />
                  </div>
                ))}
                <div className="font-terminal text-xs mt-2 opacity-60">
                  Stack: <span style={{color:"#ffb000"}}>{(game.skillStackMultiplier ?? 1).toFixed(2)}x multiplier</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#00ff41] border-opacity-20 pt-2">
            <div className="font-terminal text-[#00ff41] opacity-60 text-xs">LIFETIME INCOME</div>
            <div className="font-terminal text-[#ffb000] text-sm">${game.lifetimeIncome.toLocaleString()}</div>
          </div>
        </div>

        {/* CENTER: Decision Panel */}
        <div className="pixel-panel p-3 flex-1 flex flex-col min-h-0">
          <div className="font-pixel text-[#ffb000] text-xs mb-3">DECISIONS</div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1 mb-3">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`font-pixel text-xs px-2 py-1 border transition-all ${
                  activeCategory === cat
                    ? cat === "business"
                      ? "bg-[#ff6600] text-black border-[#ff6600]"
                      : "bg-[#00ff41] text-black border-[#00ff41]"
                    : cat === "business"
                      ? "bg-transparent text-[#ff6600] border-[#ff6600] opacity-60 hover:opacity-100"
                      : cat === "grow"
                        ? "bg-transparent text-[#ffb000] border-[#ffb000] opacity-60 hover:opacity-100"
                        : "bg-transparent text-[#00ff41] border-[#00ff41] opacity-60 hover:opacity-100"
                }`}>
                {cat === "grow" ? "GROW ✦" : cat === "health" ? "HEALTH +" : cat === "business" ? "🏢 BIZ" : cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* ── GROW tab ─────────────────────────────── */}
          {activeCategory === "grow" && (
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              <div className="font-terminal text-[#ffb000] opacity-70 text-sm mb-2">
                Pick 1 activity per month. Invest in yourself = compound returns on skills.
              </div>
              {EXTRACURRICULARS.map(act => (
                <div key={act.id} className="border border-[#00ff41] border-opacity-30 p-2 hover:border-opacity-60 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-terminal text-[#ffb000] text-base">
                        {act.emoji} {act.name}
                      </div>
                      <div className="font-terminal text-[#00ff41] opacity-60 text-xs mt-0.5">
                        {act.gains}
                      </div>
                      <div className="flex gap-3 mt-1 font-terminal text-xs opacity-50">
                        <span>{act.timeLabel}</span>
                        <span style={{color: act.cost === 0 ? "#00ff41" : "#ffb000"}}>
                          {act.cost === 0 ? "FREE" : `$${act.cost}`}
                        </span>
                      </div>
                    </div>
                    <button
                      className={`pixel-btn text-xs py-1 px-2 shrink-0 ${game.cash < act.cost ? "pixel-btn-disabled" : "pixel-btn-amber"}`}
                      onClick={() => handleExtracurricular(act.id)}
                      disabled={game.cash < act.cost || processing}>
                      {game.cash < act.cost ? "$$" : "DO IT"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── HEALTH habits tab ─────────────────────── */}
          {activeCategory === "health" && (
            <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
              <div className="font-terminal text-[#ffb000] opacity-70 text-sm">
                Lifestyle settings persist each month. Costs are deducted automatically.
              </div>

              {/* Exercise */}
              <div className="pixel-panel p-3">
                <div className="font-pixel text-xs text-[#00ff41] mb-2">🏋️ EXERCISE HABIT</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id:"none",     label:"NONE",     sub:"+0 health",      cost:"free" },
                    { id:"moderate", label:"MODERATE",  sub:"+0.1/mo health", cost:"free" },
                    { id:"gym",      label:"GYM",      sub:"+0.3/mo health", cost:"$80/mo" },
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => handleSetHabit("exerciseHabit", opt.id)}
                      className={`pixel-panel p-2 text-center cursor-pointer text-sm ${(game.exerciseHabit ?? "moderate") === opt.id ? "border-[#ffb000]" : ""}`}>
                      <div className="font-pixel text-xs" style={{color: (game.exerciseHabit ?? "moderate") === opt.id ? "#ffb000" : "#00ff41"}}>{opt.label}</div>
                      <div className="font-terminal text-xs opacity-60 mt-1">{opt.sub}</div>
                      <div className="font-terminal text-xs opacity-40">{opt.cost}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Diet */}
              <div className="pixel-panel p-3">
                <div className="font-pixel text-xs text-[#00ff41] mb-2">🥗 DIET</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id:"healthy", label:"HEALTHY", sub:"+0.2/mo health, +2 life", cost:"$80/mo" },
                    { id:"average", label:"AVERAGE",  sub:"neutral",                cost:"free" },
                    { id:"poor",    label:"POOR",     sub:"-0.3/mo health, -3 life", cost:"save $80" },
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => handleSetHabit("dietHabit", opt.id)}
                      className={`pixel-panel p-2 text-center cursor-pointer text-sm ${(game.dietHabit ?? "average") === opt.id ? "border-[#ffb000]" : ""}`}>
                      <div className="font-pixel text-xs" style={{color: (game.dietHabit ?? "average") === opt.id ? "#ffb000" : "#00ff41"}}>{opt.label}</div>
                      <div className="font-terminal text-xs opacity-60 mt-1">{opt.sub}</div>
                      <div className="font-terminal text-xs opacity-40">{opt.cost}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep */}
              <div className="pixel-panel p-3">
                <div className="font-pixel text-xs text-[#00ff41] mb-2">💤 SLEEP</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id:"8hrs", label:"8 HRS",  sub:"+0.1 health, +0.5 happy", cost:"free" },
                    { id:"6hrs", label:"6 HRS",  sub:"neutral",                  cost:"free" },
                    { id:"5hrs", label:"5 HRS",  sub:"-0.3 health, -1 happy",    cost:"free" },
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => handleSetHabit("sleepHabit", opt.id)}
                      className={`pixel-panel p-2 text-center cursor-pointer text-sm ${(game.sleepHabit ?? "6hrs") === opt.id ? "border-[#ffb000]" : ""}`}>
                      <div className="font-pixel text-xs" style={{color: (game.sleepHabit ?? "6hrs") === opt.id ? "#ffb000" : "#00ff41"}}>{opt.label}</div>
                      <div className="font-terminal text-xs opacity-60 mt-1">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stress */}
              <div className="pixel-panel p-3">
                <div className="font-pixel text-xs text-[#00ff41] mb-2">🧠 STRESS MANAGEMENT</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id:"therapy",    label:"THERAPY",    sub:"+2 happy/mo", cost:"$200/mo" },
                    { id:"meditation", label:"MEDITATION", sub:"+1 happy/mo", cost:"free" },
                    { id:"none",       label:"NOTHING",    sub:"no benefit",  cost:"free" },
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => handleSetHabit("stressManagement", opt.id)}
                      className={`pixel-panel p-2 text-center cursor-pointer text-sm ${(game.stressManagement ?? "none") === opt.id ? "border-[#ffb000]" : ""}`}>
                      <div className="font-pixel text-xs" style={{color: (game.stressManagement ?? "none") === opt.id ? "#ffb000" : "#00ff41"}}>{opt.label}</div>
                      <div className="font-terminal text-xs opacity-60 mt-1">{opt.sub}</div>
                      <div className="font-terminal text-xs opacity-40">{opt.cost}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Life expectancy preview */}
              <div className="pixel-panel p-3">
                <div className="font-pixel text-xs text-[#00ff41] mb-2">📊 LIFE EXPECTANCY OUTLOOK</div>
                <div className="flex items-center gap-4">
                  <div className="font-terminal text-4xl" style={{color: lifeExpColor}}>~{lifeExp}</div>
                  <div className="font-terminal text-sm opacity-70">
                    years projected<br />
                    <span className="text-xs opacity-50">(adjusts monthly based on habits)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── BUSINESS tab ────────────────────────────── */}
          {activeCategory === "business" && (
            <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-2">
              {/* Guard: show message if no active business */}
              {!game.activeBusiness ? (
                <div className="font-terminal text-[#ff6600] opacity-70 text-sm p-2 border border-[#ff6600] border-opacity-30">
                  🏢 Start a business first to unlock the Business Mini-Game!
                </div>
              ) : (
                <>
                  {/* Time meter */}
                  <div className="flex items-center gap-2 p-2 border border-[#ff6600] border-opacity-30">
                    <span className="font-terminal text-xs opacity-70">⏰ TIME REMAINING:</span>
                    <span className="font-terminal text-[#ffb000] text-base font-bold">
                      {Math.max(0, 160 - (game.monthlyTimeUsed ?? 0))} hrs
                    </span>
                    <div className="flex-1 h-2 bg-[#1a1a1a] rounded overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${Math.min(100, ((game.monthlyTimeUsed ?? 0) / 160) * 100)}%`,
                          backgroundColor: (game.monthlyTimeUsed ?? 0) > 140 ? "#ff0044" : (game.monthlyTimeUsed ?? 0) > 100 ? "#ffb000" : "#00ff41",
                        }}
                      />
                    </div>
                  </div>

                  {/* Sub-tab nav */}
                  <div className="flex gap-1">
                    {(["decisions","team","pipeline"] as const).map(sub => (
                      <button key={sub} onClick={() => setBizSubTab(sub)}
                        className={`font-pixel text-xs px-2 py-1 border transition-all ${
                          bizSubTab === sub
                            ? "bg-[#ff6600] text-black border-[#ff6600]"
                            : "bg-transparent text-[#ff6600] border-[#ff6600] opacity-50 hover:opacity-100"
                        }`}>
                        {sub === "decisions" ? "DECISIONS" : sub === "team" ? "TEAM" : "PIPELINE"}
                      </button>
                    ))}
                  </div>

                  {/* DECISIONS sub-tab */}
                  {bizSubTab === "decisions" && (
                    <div className="space-y-2 overflow-y-auto">
                      {(game.pendingBusinessDecisions ?? []).length === 0 ? (
                        <div className="font-terminal text-sm opacity-50 p-2">
                          No pending decisions. Advance to the next month to get new ones.
                        </div>
                      ) : (
                        (game.pendingBusinessDecisions as any[]).map((dec: any) => {
                          const isDIY = diyMode[dec.id] !== false; // default DIY
                          const timeCost  = isDIY ? dec.timeCostDIY  : dec.timeCostHire;
                          const moneyCost = isDIY ? dec.moneyCostDIY : dec.moneyCostHire;
                          const timeLeft  = 160 - (game.monthlyTimeUsed ?? 0);
                          const canAfford = game.cash >= moneyCost;
                          const hasTime   = timeLeft >= timeCost;
                          const canDo     = canAfford && hasTime;
                          const CATEGORY_COLORS: Record<string, string> = {
                            MARKETING: "#00ff41", PRODUCT: "#ffb000", OPERATIONS: "#00aaff",
                            SALES: "#ff6600",     FINANCIAL: "#ff00ff",
                          };
                          const catColor = CATEGORY_COLORS[dec.category] ?? "#00ff41";
                          return (
                            <div key={dec.id} className="border border-[#ff6600] border-opacity-30 p-2 hover:border-opacity-60 transition-all">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div>
                                  <span className="font-terminal text-xs px-1 rounded mr-2" style={{ backgroundColor: catColor, color: "#000" }}>
                                    {dec.category}
                                  </span>
                                  <span className="font-terminal text-[#ffb000] text-sm">{dec.title}</span>
                                </div>
                              </div>
                              <div className="font-terminal text-[#00ff41] opacity-60 text-xs mb-2">{dec.description}</div>
                              {/* DIY / HIRE toggle */}
                              <div className="flex gap-1 mb-2">
                                <button
                                  onClick={() => setDiyMode(m => ({ ...m, [dec.id]: true }))}
                                  className={`font-pixel text-xs px-2 py-0.5 border transition-all ${isDIY ? "bg-[#00ff41] text-black border-[#00ff41]" : "text-[#00ff41] border-[#00ff41] opacity-50"}`}>
                                  DIY
                                </button>
                                <button
                                  onClick={() => setDiyMode(m => ({ ...m, [dec.id]: false }))}
                                  className={`font-pixel text-xs px-2 py-0.5 border transition-all ${!isDIY ? "bg-[#ffb000] text-black border-[#ffb000]" : "text-[#ffb000] border-[#ffb000] opacity-50"}`}>
                                  HIRE
                                </button>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="font-terminal text-xs opacity-60 space-x-3">
                                  <span>⏰ {timeCost}h</span>
                                  <span style={{ color: canAfford ? "#00ff41" : "#ff0044" }}>
                                    💰 ${moneyCost.toLocaleString()}
                                  </span>
                                  <span className="opacity-40">→ {dec.rippleMonths}mo ripple</span>
                                </div>
                                <button
                                  onClick={() => handleBusinessDecision(dec.id, !isDIY)}
                                  disabled={!canDo || processing}
                                  className={`font-pixel text-xs px-2 py-1 border transition-all ${
                                    canDo ? "bg-[#ff6600] text-black border-[#ff6600] hover:opacity-90" : "opacity-30 text-[#ff6600] border-[#ff6600] cursor-not-allowed"
                                  }`}>
                                  {!hasTime ? "NO TIME" : !canAfford ? "NO $$" : "EXECUTE"}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* TEAM sub-tab */}
                  {bizSubTab === "team" && (
                    <div className="space-y-3 overflow-y-auto">
                      {/* Current employees */}
                      <div>
                        <div className="font-pixel text-xs text-[#ff6600] mb-1">YOUR TEAM ({(game.businessEmployees ?? []).length})</div>
                        {(game.businessEmployees ?? []).length === 0 ? (
                          <div className="font-terminal text-xs opacity-50">No employees yet. Hire from candidates below.</div>
                        ) : (
                          (game.businessEmployees as any[]).map((emp: any, i: number) => (
                            <div key={i} className="border border-[#ff6600] border-opacity-30 p-2 mb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-terminal text-[#ffb000] text-sm">{emp.name} · <span className="opacity-60">{emp.role}</span></div>
                                  <div className="font-terminal text-xs opacity-60">
                                    Skill: {"★".repeat(emp.skillLevel)} · Reliability: {"★".repeat(emp.reliability)}
                                  </div>
                                  <div className="font-terminal text-xs" style={{ color: "#ff0044" }}>
                                    -${emp.monthlySalary.toLocaleString()}/mo · Hired age {emp.hiredAtAge}
                                  </div>
                                </div>
                                {fireConfirm === i ? (
                                  <div className="flex gap-1">
                                    <button onClick={() => handleFireEmployee(i)} className="font-pixel text-xs px-1 py-0.5 border border-[#ff0044] text-[#ff0044]">CONFIRM</button>
                                    <button onClick={() => setFireConfirm(null)} className="font-pixel text-xs px-1 py-0.5 border border-[#00ff41] opacity-50">✕</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setFireConfirm(i)} className="font-pixel text-xs px-2 py-1 border border-[#ff0044] text-[#ff0044] opacity-60 hover:opacity-100">
                                    FIRE
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {/* Candidates */}
                      <div>
                        <div className="font-pixel text-xs text-[#00ff41] mb-1">CANDIDATES</div>
                        {(game.pendingHireCandidates ?? []).length === 0 ? (
                          <div className="font-terminal text-xs opacity-50">No candidates this month. Advance months to see new ones.</div>
                        ) : (
                          (game.pendingHireCandidates as any[]).map((c: any, i: number) => (
                            <div key={i} className="border border-[#00ff41] border-opacity-30 p-2 mb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-terminal text-[#ffb000] text-sm">{c.name} · <span className="opacity-60">{c.role}</span></div>
                                  <div className="font-terminal text-xs opacity-60">
                                    Skill: {"★".repeat(c.skillLevel)} · Reliability: {"★".repeat(c.reliability)}
                                  </div>
                                  <div className="font-terminal text-xs" style={{ color: "#ff0044" }}>
                                    ${c.monthlySalary.toLocaleString()}/mo
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleHireEmployee(i)}
                                  disabled={processing || game.cash < c.monthlySalary}
                                  className={`font-pixel text-xs px-2 py-1 border transition-all ${
                                    game.cash >= c.monthlySalary ? "bg-[#00ff41] text-black border-[#00ff41]" : "opacity-30 text-[#00ff41] border-[#00ff41] cursor-not-allowed"
                                  }`}>
                                  {game.cash >= c.monthlySalary ? "HIRE" : "NO $$"}
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* PIPELINE sub-tab */}
                  {bizSubTab === "pipeline" && (
                    <div className="space-y-2 overflow-y-auto">
                      <div className="font-terminal text-xs opacity-50 mb-1">Upcoming ripple effects from past decisions:</div>
                      {(game.pendingBusinessRipples ?? []).length === 0 ? (
                        <div className="font-terminal text-xs opacity-40">No pending ripples. Execute decisions to build pipeline.</div>
                      ) : (
                        [...(game.pendingBusinessRipples as any[])].sort((a: any, b: any) =>
                          a.resolvesAtAge !== b.resolvesAtAge
                            ? a.resolvesAtAge - b.resolvesAtAge
                            : a.resolvesAtMonth - b.resolvesAtMonth
                        ).map((r: any, i: number) => {
                          const monthsAway =
                            (r.resolvesAtAge - game.currentAge) * 12 +
                            (r.resolvesAtMonth - game.currentMonth);
                          const isRevenue = r.effectType.includes("revenue") || r.effectType === "price_increase" || r.effectType === "lead_gen";
                          const isTime    = r.effectType === "time_saved";
                          const dotColor  = isRevenue ? "#00ff41" : isTime ? "#00aaff" : "#ffb000";
                          return (
                            <div key={i} className="flex gap-2 items-start p-2 border border-opacity-20" style={{ borderColor: dotColor }}>
                              <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: dotColor }} />
                              <div>
                                <div className="font-terminal text-xs opacity-60">
                                  In <span style={{ color: dotColor }}>{Math.max(1, monthsAway)} mo</span> · Age {r.resolvesAtAge}/{r.resolvesAtMonth}
                                </div>
                                <div className="font-terminal text-sm" style={{ color: dotColor }}>{r.description}</div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Standard decision tabs ─────────────────── */}
          {activeCategory !== "grow" && activeCategory !== "health" && activeCategory !== "business" && (
            <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
              {filteredDecs.map(d => (
                <DecisionButton key={d.id} decision={d} game={game} onDecision={handleDecision} />
              ))}
            </div>
          )}

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
              onClick={handleEndMonth} disabled={processing}>
              {processing ? "PROCESSING..." : `▶ END ${monthLabel} → NEXT MONTH`}
            </button>
          </div>
        </div>

        {/* RIGHT: Events + Dating Panel */}
        <div className="pixel-panel p-3 lg:w-64 shrink-0 overflow-y-auto">
          <div className="font-pixel text-[#ffb000] text-xs mb-3">LIFE FEED</div>

          {/* Current partner */}
          {game.currentPartner && (
            <div className="pixel-panel p-2 mb-3 border-[#ff6600]">
              <div className="font-pixel text-xs mb-1" style={{color:"#ff6600"}}>
                {game.relationshipStatus === "married" ? "💍 MARRIED" : "❤️ DATING"}
              </div>
              <div className="font-terminal text-[#ffb000] text-base">{game.currentPartner.name}</div>
              <div className="font-terminal text-xs opacity-60">{game.currentPartner.career}</div>
              <div className="font-terminal text-xs opacity-60">{game.currentPartner.monthsTogether} months together</div>
              {game.currentPartner.monthsTogether >= 3 && (
                <div className="font-terminal text-xs mt-1 opacity-80">
                  Compat: <span style={{color: game.currentPartner.compatibilityScore >= 70 ? "#00ff41" : "#ffb000"}}>{game.currentPartner.compatibilityScore}/100</span>
                </div>
              )}
              <div className="flex gap-1 mt-2">
                {game.currentPartner.monthsTogether >= 12 && game.relationshipStatus === "dating" && (
                  <button className="flex-1 pixel-btn pixel-btn-amber text-xs py-1"
                    onClick={() => proposeMarriage({ gameId: gameId! })}>
                    💍 PROPOSE
                  </button>
                )}
                <button className="flex-1 pixel-btn text-xs py-1 opacity-60"
                  onClick={() => breakUp({ gameId: gameId! })}>
                  ✕ BREAK UP
                </button>
              </div>
            </div>
          )}

          {/* Dating actions (single only) */}
          {!game.currentPartner && game.relationshipStatus === "single" && (
            <div className="mb-3 space-y-2">
              {!game.activeDatingApp ? (
                <button className="w-full pixel-btn text-xs py-1" onClick={handleActivateDatingApp}>
                  📱 ACTIVATE DATING APP (+$40/mo)
                </button>
              ) : (
                <button className="w-full pixel-btn pixel-btn-amber text-xs py-1" onClick={handleGenerateMatches}>
                  💘 VIEW MATCHES
                </button>
              )}
            </div>
          )}

          {/* Organic meeting card */}
          {hasOrganic && game.pendingMatches && !showMatches && (
            <OrganicMeetingCard
              partner={game.pendingMatches[0]}
              gameId={gameId!}
              onAction={() => {}}
            />
          )}

          {/* Dating app matches */}
          {hasMatches && game.pendingMatches && (
            <DatingMatchesPanel
              matches={game.pendingMatches}
              gameId={gameId!}
              onClose={() => setShowMatches(false)}
            />
          )}

          {/* Event log */}
          <div className="mt-3">
            <div className="font-pixel text-[#00ff41] text-xs opacity-60 mb-2">RECENT EVENTS</div>
            {game.eventLog.length === 0 ? (
              <div className="font-terminal text-[#00ff41] opacity-40 text-sm">
                No events yet. Advance months to see life events.
              </div>
            ) : (
              <div className="space-y-2">
                {[...game.eventLog].reverse().slice(0, 5).map((event: any, i: number) => (
                  <div key={i} className={`p-2 border border-[#00ff41] border-opacity-30 ${i === 0 ? "event-slide-in" : ""}`}>
                    <div className="font-pixel text-xs text-[#ffb000]">AGE {event.age} — {MONTHS[(event.month - 1) % 12]}</div>
                    <div className="font-terminal text-[#00ff41] text-sm mt-1">{event.title}</div>
                    <div className="font-terminal text-[#00ff41] opacity-60 text-xs mt-1 line-clamp-2">{event.body}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Decision log */}
          {game.decisionsLog.length > 0 && (
            <div className="mt-4">
              <div className="font-pixel text-[#00ff41] text-xs opacity-60 mb-2">DECISIONS</div>
              <div className="space-y-1">
                {[...game.decisionsLog].reverse().slice(0, 3).map((d: any, i: number) => (
                  <div key={i} className="font-terminal text-xs text-[#00ff41] opacity-60">▸ {d.outcome}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM: Age Progress ─────────────────────────────── */}
      <div className="bg-[#0d1117] border-t-2 border-[#00ff41] p-2">
        <div className="flex items-center gap-3">
          <div className="font-pixel text-xs text-[#00ff41] opacity-60 shrink-0">AGE {startAge}</div>
          <div className="flex-1">
            <PixelBar value={ageProgress} color="green" showValue={false} height={12} />
          </div>
          <div className="font-pixel text-xs text-[#ffb000] opacity-80 shrink-0">AGE 75</div>
          <div className="font-terminal text-[#ffb000] text-sm shrink-0">{Math.round(ageProgress)}% COMPLETE</div>
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
