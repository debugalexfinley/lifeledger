"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// ─────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────
const STARTING_POINTS = [
  {
    id: "high_school", label: "HIGH SCHOOL", ageLabel: "START AT AGE 16", icon: "🎒",
    description: "The full experience. No degree, no job, but maximum potential. 59 years to build.",
    stats: { cash: "$500", income: "$0/mo", debt: "$0", start_bonus: "HARD MODE" },
    color: "#00ff41",
  },
  {
    id: "college", label: "COLLEGE", ageLabel: "START AT AGE 18", icon: "📚",
    description: "Enrolled with part-time work. Degree incoming but student debt looms. 57 years to build.",
    stats: { cash: "$2k-20k", income: "$500/mo", debt: "$0-20k", start_bonus: "NORMAL" },
    color: "#ffb000",
  },
  {
    id: "post_college", label: "POST-GRAD", ageLabel: "START AT AGE 22", icon: "🎓",
    description: "Bachelor's in hand, entry-level job lined up. 53 years of life ahead.",
    stats: { cash: "$1k-5k", income: "$3.5k/mo", debt: "$5k-45k", start_bonus: "EASY MODE" },
    color: "#ff6600",
  },
];

const PERSONALITIES = [
  { id: "risk_taker",   label: "RISK TAKER",   icon: "🎲", desc: "High risk = high reward. +20% investment gains, -30% crash protection" },
  { id: "balanced",     label: "BALANCED",      icon: "⚖️", desc: "The steady path. Moderate gains, moderate risks. Good all-arounder." },
  { id: "conservative", label: "CONSERVATIVE",  icon: "🛡️", desc: "Slow and steady. Lose less in crashes, gain less in bull markets." },
];

const CITY_TIERS = [
  { id: "low",    label: "SMALL TOWN",   desc: "Low cost of living. Fewer opportunities but your dollar goes far.", icon: "🌾" },
  { id: "medium", label: "MID-SIZE CITY", desc: "Balanced cost and opportunity. The classic middle path.",          icon: "🏙️" },
  { id: "high",   label: "MAJOR METRO",  desc: "High cost of living but premium salaries and opportunities.",       icon: "🌆" },
];

const GENDERS = [
  { id: "male",     label: "MALE",      icon: "♂",  desc: "Avg height 5'9\". Standard male health stats." },
  { id: "female",   label: "FEMALE",    icon: "♀",  desc: "Avg height 5'4\". Different health curve." },
  { id: "nonbinary", label: "NON-BINARY", icon: "⚧", desc: "Your own path. Avg height 5'6\"." },
];

const PARENTAL_TIERS   = ["low", "middle", "high"];
const PARENTAL_LABELS  = { low: "WORKING CLASS", middle: "MIDDLE CLASS", high: "WEALTHY" };
const PARENTAL_DESCS   = {
  low:    "Parents have little to offer financially. You're largely on your own.",
  middle: "Some family support available. Not rich, but not broke either.",
  high:   "Privileged starting position. More cash, less debt pressure.",
};

// ─────────────────────────────────────────────────────
// Normal distribution (Box-Muller) — mirrors server helper
// ─────────────────────────────────────────────────────
function normalRandom(mean: number, stddev: number, min: number, max: number): number {
  const u1 = Math.random() || 1e-10;
  const u2 = Math.random();
  const z  = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.min(max, Math.max(min, mean + z * stddev));
}

function rollAttributes(gender: string) {
  const iq             = Math.round(normalRandom(100, 15, 60, 160));
  const athleticGenetics = Math.round(normalRandom(50, 15, 10, 95));
  const heightMean     = gender === "female" ? 64 : gender === "nonbinary" ? 66.5 : 69;
  const heightStd      = gender === "female" ? 2.5 : 3;
  const heightInches   = Math.round(normalRandom(heightMean, heightStd, 58, 84));
  return { iq, athleticGenetics, heightInches };
}

function inchesToFeet(inches: number) {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

function iqLabel(iq: number) {
  if (iq >= 145) return "GENIUS";
  if (iq >= 130) return "GIFTED";
  if (iq >= 115) return "ABOVE AVG";
  if (iq >= 85)  return "AVERAGE";
  if (iq >= 70)  return "BELOW AVG";
  return "CHALLENGED";
}

function athleticsLabel(v: number) {
  if (v >= 80) return "ELITE";
  if (v >= 60) return "ATHLETIC";
  if (v >= 40) return "AVERAGE";
  if (v >= 20) return "BELOW AVG";
  return "SEDENTARY";
}

// ─────────────────────────────────────────────────────
// Rolling number animation
// ─────────────────────────────────────────────────────
function RollingNumber({
  target, rolling, duration = 700,
}: { target: number; rolling: boolean; duration?: number }) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!rolling) { setDisplay(target); return; }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= duration) { setDisplay(target); return; }
      setDisplay(Math.round(Math.random() * 200));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, rolling, duration]);

  return <>{display}</>;
}

// ─────────────────────────────────────────────────────
// Attribute Card
// ─────────────────────────────────────────────────────
function AttrCard({
  label, value, displayValue, sublabel, color = "#ffb000", rolling,
}: {
  label: string; value: number; displayValue: string; sublabel: string;
  color?: string; rolling: boolean;
}) {
  return (
    <div className="pixel-panel p-4 text-center">
      <div className="font-pixel text-xs opacity-60 mb-2" style={{ color }}>{label}</div>
      <div className="font-terminal text-4xl mb-1" style={{ color }}>
        <RollingNumber target={value} rolling={rolling} />
      </div>
      <div className="font-terminal text-sm opacity-70" style={{ color }}>
        {rolling ? "???" : displayValue}
      </div>
      <div className="font-pixel text-xs mt-2 opacity-50">{sublabel}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Step 4 rolling stat display (existing parental roll)
// ─────────────────────────────────────────────────────
function StatRollDisplay({ label, value, rolling }: { label: string; value: string; rolling: boolean }) {
  const [displayed, setDisplayed] = useState("???");
  useEffect(() => {
    if (!rolling) { setDisplayed(value); return; }
    let count = 0;
    const chars = "0123456789$ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const interval = setInterval(() => {
      if (count < 8) {
        setDisplayed(Array.from({ length: Math.min(value.length, 5) }, () =>
          chars[Math.floor(Math.random() * chars.length)]).join(""));
        count++;
      } else { setDisplayed(value); clearInterval(interval); }
    }, 60);
    return () => clearInterval(interval);
  }, [rolling, value]);
  return (
    <div className="flex justify-between items-center">
      <span className="font-terminal text-[#00ff41] opacity-70 text-lg">{label}:</span>
      <span className={`font-terminal text-[#ffb000] text-xl ${rolling ? "opacity-70" : "opacity-100"}`}>{displayed}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────
export default function SetupPage() {
  const router  = useRouter();
  const initGame = useMutation(api.games.initGame);

  // Steps: 0=starting, 1=name, 2=personality, 3=city, 4=gender+attrs, 5=background
  const [step,         setStep]         = useState(0);
  const [startingPoint, setStartingPoint] = useState("");
  const [displayName,  setDisplayName]  = useState("");
  const [personality,  setPersonality]  = useState("");
  const [cityTier,     setCityTier]     = useState("");
  const [gender,       setGender]       = useState("");

  // Attribute roll state
  const [attrs,        setAttrs]        = useState<{ iq: number; athleticGenetics: number; heightInches: number } | null>(null);
  const [attrsRolling, setAttrsRolling] = useState(false);
  const [attrsRollCount, setAttrsRollCount] = useState(0);

  // Background roll state
  const [rolling,      setRolling]      = useState(false);
  const [rolledTier,   setRolledTier]   = useState<string | null>(null);
  const [rolledStats,  setRolledStats]  = useState<Record<string, string>>({});
  const [rollCount,    setRollCount]    = useState(0);
  const [loading,      setLoading]      = useState(false);

  const selectedPoint = STARTING_POINTS.find(p => p.id === startingPoint);

  // ── Roll biological attributes (client-side preview) ──
  const rollAttrs = () => {
    if (!gender) return;
    setAttrsRolling(true);
    setAttrsRollCount(c => c + 1);

    // Show rolling for 900ms then reveal
    setTimeout(() => {
      const rolled = rollAttributes(gender);
      setAttrs(rolled);
      setAttrsRolling(false);
    }, 900);
  };

  // Re-roll only height
  const rerollHeight = () => {
    if (!attrs || !gender || attrsRolling) return;
    const heightMean = gender === "female" ? 64 : gender === "nonbinary" ? 66.5 : 69;
    const heightStd  = gender === "female" ? 2.5 : 3;
    const newHeight  = Math.round(normalRandom(heightMean, heightStd, 58, 84));
    setAttrs({ ...attrs, heightInches: newHeight });
  };

  // ── Background roll ───────────────────────────────────
  const rollBackground = () => {
    setRolling(true);
    setRolledTier(null);
    setRollCount(c => c + 1);

    let iterations = 0;
    const interval = setInterval(() => {
      setRolledTier(PARENTAL_TIERS[Math.floor(Math.random() * PARENTAL_TIERS.length)]);
      iterations++;
      if (iterations >= 12) {
        clearInterval(interval);
        const roll      = Math.random();
        const finalTier = roll < 0.4 ? "low" : roll < 0.8 ? "middle" : "high";
        setRolledTier(finalTier);
        setRolling(false);
        // Build stats display
        if (startingPoint === "high_school") {
          setRolledStats({ "STARTING CASH": "$500", "MONTHLY INCOME": "$0", "STUDENT DEBT": "$0", DIFFICULTY: "HARD ★★★" });
        } else if (startingPoint === "college") {
          const cash = finalTier === "low" ? "$2,000" : finalTier === "middle" ? "$8,000" : "$20,000";
          const debt = finalTier === "low" ? "$20,000" : finalTier === "middle" ? "$10,000" : "$0";
          setRolledStats({ "STARTING CASH": cash, "MONTHLY INCOME": "$500", "STUDENT DEBT": debt, DIFFICULTY: "NORMAL ★★" });
        } else {
          const cash = finalTier === "low" ? "$1,000" : finalTier === "middle" ? "$3,000" : "$5,000";
          const debt = finalTier === "low" ? "$45,000" : finalTier === "middle" ? "$25,000" : "$5,000";
          setRolledStats({ "STARTING CASH": cash, "MONTHLY INCOME": "$3,500", "STUDENT DEBT": debt, DIFFICULTY: "EASY ★" });
        }
      }
    }, 80);
  };

  // ── Start game ───────────────────────────────────────
  const handleStartGame = async () => {
    if (!rolledTier || loading) return;
    setLoading(true);
    try {
      const gameId = await initGame({
        displayName:       displayName || "Player",
        startingPoint:     startingPoint as any,
        parentalIncomeTier: rolledTier as any,
        personalityTrait:  personality as any,
        cityTier:          cityTier as any,
        gender:            gender as any,
      });
      router.push(`/game?id=${gameId}`);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────
  const totalSteps = 5; // 0-5
  const selectedGender = GENDERS.find(g => g.id === gender);

  return (
    <div className="crt min-h-screen bg-[#0a0a0a] p-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <a href="/" className="pixel-btn text-xs py-2 px-3">← BACK</a>
          <div className="font-pixel text-[#ffb000] text-xs">CHARACTER CREATION</div>
          <div className="flex gap-2 ml-auto">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`w-2 h-2 border ${step >= i ? "bg-[#00ff41] border-[#00ff41]" : "border-[#00ff41] opacity-30"}`} />
            ))}
          </div>
        </div>

        {/* ── STEP 0: Starting Point ─────────────────────────── */}
        {step === 0 && (
          <div>
            <div className="font-pixel text-[#00ff41] text-xs mb-6">STEP 1: CHOOSE YOUR STARTING POINT</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STARTING_POINTS.map(point => (
                <button key={point.id} onClick={() => setStartingPoint(point.id)}
                  className={`pixel-panel p-4 text-left transition-all cursor-pointer ${startingPoint === point.id ? "border-[#ffb000] shadow-[0_0_20px_rgba(255,176,0,0.3)]" : ""}`}>
                  <div className="text-3xl mb-2">{point.icon}</div>
                  <div className="font-pixel text-xs mb-1" style={{ color: point.color }}>{point.label}</div>
                  <div className="font-terminal text-[#ffb000] text-base mb-2">{point.ageLabel}</div>
                  <div className="font-terminal text-[#00ff41] opacity-70 text-sm mb-3">{point.description}</div>
                  <div className="space-y-1">
                    {Object.entries(point.stats).map(([k, v]) => (
                      <div key={k} className="flex justify-between font-terminal text-sm">
                        <span className="opacity-60">{k}:</span>
                        <span className="text-[#ffb000]">{v}</span>
                      </div>
                    ))}
                  </div>
                  {startingPoint === point.id && <div className="mt-3 font-pixel text-[#ffb000] text-xs">▸ SELECTED</div>}
                </button>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className={`pixel-btn pixel-btn-amber ${!startingPoint ? "pixel-btn-disabled" : ""}`}
                onClick={() => startingPoint && setStep(1)}>
                NEXT: NAME YOUR CHARACTER →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: Name ──────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div className="font-pixel text-[#00ff41] text-xs mb-6">STEP 2: ENTER YOUR NAME</div>
            <div className="pixel-panel p-6 max-w-md mx-auto">
              <div className="font-terminal text-[#ffb000] text-2xl mb-4">WHAT IS YOUR NAME?</div>
              <input type="text" value={displayName}
                onChange={e => setDisplayName(e.target.value.slice(0, 16))}
                placeholder="ENTER NAME..."
                className="w-full bg-transparent border-b-2 border-[#00ff41] text-[#00ff41] font-terminal text-2xl py-2 px-1 outline-none placeholder-[#00ff41] placeholder-opacity-30"
                maxLength={16}
                onKeyDown={e => e.key === "Enter" && displayName && setStep(2)} />
              <div className="font-terminal text-[#00ff41] opacity-50 text-sm mt-2">{displayName.length}/16 CHARACTERS</div>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button className="pixel-btn" onClick={() => setStep(0)}>← BACK</button>
              <button className={`pixel-btn pixel-btn-amber ${!displayName.trim() ? "pixel-btn-disabled" : ""}`}
                onClick={() => displayName.trim() && setStep(2)}>
                NEXT: PERSONALITY →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Personality ───────────────────────────────── */}
        {step === 2 && (
          <div>
            <div className="font-pixel text-[#00ff41] text-xs mb-6">STEP 3: CHOOSE YOUR PERSONALITY</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PERSONALITIES.map(p => (
                <button key={p.id} onClick={() => setPersonality(p.id)}
                  className={`pixel-panel p-4 text-left cursor-pointer transition-all ${personality === p.id ? "border-[#ffb000] shadow-[0_0_20px_rgba(255,176,0,0.3)]" : ""}`}>
                  <div className="text-3xl mb-2">{p.icon}</div>
                  <div className="font-pixel text-[#ffb000] text-xs mb-2">{p.label}</div>
                  <div className="font-terminal text-[#00ff41] opacity-70 text-sm">{p.desc}</div>
                  {personality === p.id && <div className="mt-3 font-pixel text-[#ffb000] text-xs">▸ SELECTED</div>}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button className="pixel-btn" onClick={() => setStep(1)}>← BACK</button>
              <button className={`pixel-btn pixel-btn-amber ${!personality ? "pixel-btn-disabled" : ""}`}
                onClick={() => personality && setStep(3)}>
                NEXT: CITY →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: City ──────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <div className="font-pixel text-[#00ff41] text-xs mb-6">STEP 4: CHOOSE YOUR CITY</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CITY_TIERS.map(c => (
                <button key={c.id} onClick={() => setCityTier(c.id)}
                  className={`pixel-panel p-4 text-left cursor-pointer transition-all ${cityTier === c.id ? "border-[#ffb000] shadow-[0_0_20px_rgba(255,176,0,0.3)]" : ""}`}>
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <div className="font-pixel text-[#ffb000] text-xs mb-2">{c.label}</div>
                  <div className="font-terminal text-[#00ff41] opacity-70 text-sm">{c.desc}</div>
                  {cityTier === c.id && <div className="mt-3 font-pixel text-[#ffb000] text-xs">▸ SELECTED</div>}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button className="pixel-btn" onClick={() => setStep(2)}>← BACK</button>
              <button className={`pixel-btn pixel-btn-amber ${!cityTier ? "pixel-btn-disabled" : ""}`}
                onClick={() => cityTier && setStep(4)}>
                NEXT: YOUR DNA →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Gender + Attribute Roll ───────────────────── */}
        {step === 4 && (
          <div>
            <div className="font-pixel text-[#00ff41] text-xs mb-6">STEP 5: GENDER & STARTING ATTRIBUTES</div>

            {/* Gender selector */}
            <div className="mb-6">
              <div className="font-pixel text-[#ffb000] text-xs mb-3">SELECT GENDER</div>
              <div className="grid grid-cols-3 gap-3">
                {GENDERS.map(g => (
                  <button key={g.id} onClick={() => { setGender(g.id); setAttrs(null); setAttrsRollCount(0); }}
                    className={`pixel-panel p-3 text-center cursor-pointer transition-all ${gender === g.id ? "border-[#ffb000] shadow-[0_0_20px_rgba(255,176,0,0.3)]" : ""}`}>
                    <div className="font-terminal text-3xl mb-1" style={{ color: gender === g.id ? "#ffb000" : "#00ff41" }}>{g.icon}</div>
                    <div className="font-pixel text-xs text-[#ffb000]">{g.label}</div>
                    <div className="font-terminal text-[#00ff41] opacity-60 text-xs mt-1">{g.desc}</div>
                    {gender === g.id && <div className="mt-2 font-pixel text-[#ffb000] text-xs">▸ SELECTED</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Attribute roll */}
            {gender && (
              <div className="pixel-panel p-5 mb-5">
                <div className="font-pixel text-[#00ff41] text-xs mb-4 flex items-center gap-3">
                  <span>GENETIC LOTTERY</span>
                  {attrs && !attrsRolling && (
                    <span className="text-[#ffb000] opacity-70">(these are baked in — embrace the hand you're dealt)</span>
                  )}
                </div>

                {!attrs && !attrsRolling ? (
                  <div className="text-center py-8">
                    <div className="font-terminal text-[#00ff41] opacity-40 text-xl mb-4">
                      Press the button to roll your biological attributes...
                    </div>
                    <div className="font-terminal text-[#00ff41] opacity-30 text-sm">
                      IQ · Athletic Genetics · Height — all locked at birth
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    <AttrCard
                      label="IQ" value={attrs?.iq ?? 100}
                      displayValue={attrs ? iqLabel(attrs.iq) : "???"}
                      sublabel="60–160" color="#00ff41" rolling={attrsRolling}
                    />
                    <AttrCard
                      label="ATHLETIC GENETICS" value={attrs?.athleticGenetics ?? 50}
                      displayValue={attrs ? athleticsLabel(attrs.athleticGenetics) : "???"}
                      sublabel="10–95" color="#ffb000" rolling={attrsRolling}
                    />
                    <AttrCard
                      label="HEIGHT" value={attrs?.heightInches ?? 69}
                      displayValue={attrs ? inchesToFeet(attrs.heightInches) : "???"}
                      sublabel="Inches" color="#ff6600" rolling={attrsRolling}
                    />
                  </div>
                )}

                {/* Roll / Reroll buttons */}
                <div className="flex gap-3 justify-center mt-5">
                  <button
                    className={`pixel-btn pixel-btn-amber ${attrsRolling ? "pixel-btn-disabled" : ""}`}
                    onClick={rollAttrs} disabled={attrsRolling}>
                    {attrsRolling ? "🎲 ROLLING..." : attrsRollCount === 0 ? "🎲 ROLL YOUR DNA" : "🔄 REROLL ALL"}
                  </button>
                  {attrs && !attrsRolling && (
                    <button className="pixel-btn text-xs" onClick={rerollHeight}>
                      ↺ REROLL HEIGHT
                    </button>
                  )}
                </div>

                {/* Starting conditions summary */}
                {attrs && !attrsRolling && (
                  <div className="mt-5 border-t border-[#00ff41] border-opacity-20 pt-4">
                    <div className="font-pixel text-[#00ff41] text-xs mb-3">STARTING CONDITIONS SUMMARY</div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 font-terminal text-sm">
                      {[
                        { label: "Starting Skills",    value: "All ~5-15 (random)" },
                        { label: "Fear of Rejection",  value: "60 (will decrease)" },
                        { label: "Life Expectancy",    value: "~78 yrs (adjustable)" },
                        { label: "Exercise Habit",     value: "Moderate (changeable)" },
                        { label: "Diet",               value: "Average (changeable)" },
                        { label: "Sleep",              value: "6hrs (changeable)" },
                        { label: "IQ Bonus",           value: attrs.iq >= 120 ? "+Tech skill bonus" : "None" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between">
                          <span className="opacity-50">{label}:</span>
                          <span className="text-[#ffb000]">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button className="pixel-btn" onClick={() => setStep(3)}>← BACK</button>
              <button
                className={`pixel-btn pixel-btn-amber ${(!gender || !attrs || attrsRolling) ? "pixel-btn-disabled" : ""}`}
                onClick={() => gender && attrs && !attrsRolling && setStep(5)}>
                NEXT: ROLL BACKGROUND →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Roll Background ───────────────────────────── */}
        {step === 5 && (
          <div>
            <div className="font-pixel text-[#00ff41] text-xs mb-6">STEP 6: ROLL YOUR BACKGROUND</div>

            {/* Character summary */}
            <div className="pixel-panel p-4 mb-4">
              <div className="font-pixel text-[#ffb000] text-xs mb-3">CHARACTER SUMMARY</div>
              <div className="grid grid-cols-2 gap-2 font-terminal text-lg">
                <div><span className="opacity-60">NAME: </span><span className="text-[#ffb000]">{displayName}</span></div>
                <div><span className="opacity-60">START: </span><span className="text-[#ffb000]">{selectedPoint?.label}</span></div>
                <div><span className="opacity-60">PERSONALITY: </span><span className="text-[#ffb000]">{personality?.toUpperCase()}</span></div>
                <div><span className="opacity-60">CITY: </span><span className="text-[#ffb000]">{cityTier?.toUpperCase()}</span></div>
                <div><span className="opacity-60">GENDER: </span><span className="text-[#ffb000]">{gender?.toUpperCase()}</span></div>
              </div>
            </div>

            {/* Roll area */}
            <div className="pixel-panel p-6 mb-6 text-center">
              <div className="font-pixel text-[#00ff41] text-xs mb-4">FAMILY BACKGROUND (RANDOM ROLL)</div>
              {rolledTier ? (
                <div>
                  <div className={`font-pixel text-2xl mb-2 ${
                    rolledTier === "high" ? "text-[#ffb000] glow-amber" : rolledTier === "middle" ? "text-[#00ff41] glow-green" : "text-[#ff6600]"
                  } ${rolling ? "opacity-50" : "opacity-100"}`}>
                    {PARENTAL_LABELS[rolledTier as keyof typeof PARENTAL_LABELS]}
                  </div>
                  {!rolling && (
                    <div className="font-terminal text-[#00ff41] opacity-70 text-lg mb-4">
                      {PARENTAL_DESCS[rolledTier as keyof typeof PARENTAL_DESCS]}
                    </div>
                  )}
                  {!rolling && Object.keys(rolledStats).length > 0 && (
                    <div className="space-y-2 max-w-xs mx-auto mt-4">
                      {Object.entries(rolledStats).map(([label, value]) => (
                        <StatRollDisplay key={label} label={label} value={value} rolling={false} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="font-terminal text-[#00ff41] opacity-50 text-xl py-6">
                  PRESS ROLL TO DISCOVER YOUR BACKGROUND...
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-4">
                <button className="pixel-btn" onClick={() => setStep(4)}>← BACK</button>
                <button className="pixel-btn pixel-btn-amber" onClick={rollBackground} disabled={rolling}>
                  {rolling ? "ROLLING..." : rollCount === 0 ? "🎲 ROLL BACKGROUND" : "🔄 REROLL"}
                </button>
              </div>

              {rolledTier && !rolling && (
                <button
                  className={`pixel-btn text-lg px-8 py-3 ${loading ? "pixel-btn-disabled" : ""}`}
                  style={{ color: "#0a0a0a", background: "#00ff41", borderColor: "#00ff41" }}
                  onClick={handleStartGame}>
                  {loading ? "LOADING..." : "▶ BEGIN YOUR LIFE →"}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
