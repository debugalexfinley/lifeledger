"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const STARTING_POINTS = [
  {
    id: "high_school",
    label: "HIGH SCHOOL",
    ageLabel: "START AT AGE 16",
    icon: "🎒",
    description:
      "The full experience. No degree, no job, but maximum potential. Build your life from scratch over 59 years.",
    stats: { cash: "$500", income: "$0/mo", debt: "$0", start_bonus: "HARD MODE" },
    color: "#00ff41",
  },
  {
    id: "college",
    label: "COLLEGE",
    ageLabel: "START AT AGE 18",
    icon: "📚",
    description:
      "Enrolled in college with part-time work. Degree incoming but student debt looms. 57 years to build.",
    stats: { cash: "$2k-20k", income: "$500/mo", debt: "$0-20k", start_bonus: "NORMAL" },
    color: "#ffb000",
  },
  {
    id: "post_college",
    label: "POST-GRAD",
    ageLabel: "START AT AGE 22",
    icon: "🎓",
    description:
      "Bachelor's degree in hand, entry-level job lined up. Student debt varies. 53 years of life ahead.",
    stats: { cash: "$1k-5k", income: "$3.5k/mo", debt: "$5k-45k", start_bonus: "EASY MODE" },
    color: "#ff6600",
  },
];

const PERSONALITIES = [
  {
    id: "risk_taker",
    label: "RISK TAKER",
    icon: "🎲",
    desc: "High risk = high reward. +20% investment gains, -30% crash protection",
  },
  {
    id: "balanced",
    label: "BALANCED",
    icon: "⚖️",
    desc: "The steady path. Moderate gains, moderate risks. Good all-arounder.",
  },
  {
    id: "conservative",
    label: "CONSERVATIVE",
    icon: "🛡️",
    desc: "Slow and steady. Lose less in crashes, gain less in bull markets.",
  },
];

const CITY_TIERS = [
  { id: "low", label: "SMALL TOWN", desc: "Low cost of living. Fewer opportunities but your dollar goes far.", icon: "🌾" },
  { id: "medium", label: "MID-SIZE CITY", desc: "Balanced cost and opportunity. The classic middle path.", icon: "🏙️" },
  { id: "high", label: "MAJOR METRO", desc: "High cost of living but premium salaries and opportunities.", icon: "🌆" },
];

const PARENTAL_TIERS = ["low", "middle", "high"];
const PARENTAL_LABELS = { low: "WORKING CLASS", middle: "MIDDLE CLASS", high: "WEALTHY" };
const PARENTAL_DESCS = {
  low: "Parents have little to offer financially. You're largely on your own.",
  middle: "Some family support available. Not rich, but not broke either.",
  high: "Privileged starting position. More cash, less debt pressure.",
};

function StatRollDisplay({ label, value, rolling }: { label: string; value: string; rolling: boolean }) {
  const [displayed, setDisplayed] = useState("???");

  useEffect(() => {
    if (!rolling) {
      setDisplayed(value);
      return;
    }
    let count = 0;
    const chars = "0123456789$ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const interval = setInterval(() => {
      if (count < 8) {
        setDisplayed(
          Array.from({ length: Math.min(value.length, 5) }, () =>
            chars[Math.floor(Math.random() * chars.length)]
          ).join("")
        );
        count++;
      } else {
        setDisplayed(value);
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [rolling, value]);

  return (
    <div className="flex justify-between items-center">
      <span className="font-terminal text-[#00ff41] opacity-70 text-lg">{label}:</span>
      <span className={`font-terminal text-[#ffb000] text-xl ${rolling ? "opacity-70" : "opacity-100"}`}>
        {displayed}
      </span>
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const initGame = useMutation(api.games.initGame);

  const [step, setStep] = useState(0); // 0=starting, 1=name, 2=personality, 3=city, 4=roll
  const [startingPoint, setStartingPoint] = useState<string>("");
  const [displayName, setDisplayName] = useState("");
  const [personality, setPersonality] = useState<string>("");
  const [cityTier, setCityTier] = useState<string>("");
  const [rolling, setRolling] = useState(false);
  const [rolledTier, setRolledTier] = useState<string | null>(null);
  const [rolledStats, setRolledStats] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [rollCount, setRollCount] = useState(0);

  const selectedPoint = STARTING_POINTS.find((p) => p.id === startingPoint);

  const rollBackground = () => {
    setRolling(true);
    setRolledTier(null);
    setRollCount((c) => c + 1);

    // Animate rolling through tiers
    let iterations = 0;
    const interval = setInterval(() => {
      const tempTier = PARENTAL_TIERS[Math.floor(Math.random() * PARENTAL_TIERS.length)];
      setRolledTier(tempTier);
      iterations++;
      if (iterations >= 12) {
        clearInterval(interval);
        // Final weighted roll (low 40%, middle 40%, high 20%)
        const roll = Math.random();
        const finalTier = roll < 0.4 ? "low" : roll < 0.8 ? "middle" : "high";
        setRolledTier(finalTier);
        setRolling(false);

        // Set stats based on starting point + tier
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

  const handleStartGame = async () => {
    if (!rolledTier || loading) return;
    setLoading(true);
    try {
      const gameId = await initGame({
        displayName: displayName || "Player",
        startingPoint: startingPoint as any,
        parentalIncomeTier: rolledTier as any,
        personalityTrait: personality as any,
        cityTier: cityTier as any,
      });

      // First seed event templates
      router.push(`/game?id=${gameId}`);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="crt min-h-screen bg-[#0a0a0a] p-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <a href="/" className="pixel-btn text-xs py-2 px-3">← BACK</a>
          <div className="font-pixel text-[#ffb000] text-xs">
            CHARACTER CREATION
          </div>
          {/* Step dots */}
          <div className="flex gap-2 ml-auto">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 border ${step >= i ? "bg-[#00ff41] border-[#00ff41]" : "border-[#00ff41] opacity-30"}`}
              />
            ))}
          </div>
        </div>

        {/* ── STEP 0: Choose Starting Point ──────────────── */}
        {step === 0 && (
          <div>
            <div className="font-pixel text-[#00ff41] text-xs mb-6">
              STEP 1: CHOOSE YOUR STARTING POINT
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STARTING_POINTS.map((point) => (
                <button
                  key={point.id}
                  onClick={() => setStartingPoint(point.id)}
                  className={`pixel-panel p-4 text-left transition-all cursor-pointer ${
                    startingPoint === point.id ? "border-[#ffb000] shadow-[0_0_20px_rgba(255,176,0,0.3)]" : ""
                  }`}
                >
                  <div className="text-3xl mb-2">{point.icon}</div>
                  <div
                    className="font-pixel text-xs mb-1"
                    style={{ color: point.color }}
                  >
                    {point.label}
                  </div>
                  <div className="font-terminal text-[#ffb000] text-base mb-2">
                    {point.ageLabel}
                  </div>
                  <div className="font-terminal text-[#00ff41] opacity-70 text-sm mb-3">
                    {point.description}
                  </div>
                  <div className="space-y-1">
                    {Object.entries(point.stats).map(([k, v]) => (
                      <div key={k} className="flex justify-between font-terminal text-sm">
                        <span className="opacity-60">{k}:</span>
                        <span className="text-[#ffb000]">{v}</span>
                      </div>
                    ))}
                  </div>
                  {startingPoint === point.id && (
                    <div className="mt-3 font-pixel text-[#ffb000] text-xs">
                      ▸ SELECTED
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button
                className={`pixel-btn pixel-btn-amber ${!startingPoint ? "pixel-btn-disabled" : ""}`}
                onClick={() => startingPoint && setStep(1)}
              >
                NEXT: NAME YOUR CHARACTER →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: Name ───────────────────────────────── */}
        {step === 1 && (
          <div>
            <div className="font-pixel text-[#00ff41] text-xs mb-6">
              STEP 2: ENTER YOUR NAME
            </div>
            <div className="pixel-panel p-6 max-w-md mx-auto">
              <div className="font-terminal text-[#ffb000] text-2xl mb-4">
                WHAT IS YOUR NAME?
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value.slice(0, 16))}
                  placeholder="ENTER NAME..."
                  className="w-full bg-transparent border-b-2 border-[#00ff41] text-[#00ff41] font-terminal text-2xl py-2 px-1 outline-none placeholder-[#00ff41] placeholder-opacity-30 cursor-blink"
                  maxLength={16}
                  onKeyDown={(e) => e.key === "Enter" && displayName && setStep(2)}
                />
              </div>
              <div className="font-terminal text-[#00ff41] opacity-50 text-sm mt-2">
                {displayName.length}/16 CHARACTERS
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button className="pixel-btn" onClick={() => setStep(0)}>← BACK</button>
              <button
                className={`pixel-btn pixel-btn-amber ${!displayName.trim() ? "pixel-btn-disabled" : ""}`}
                onClick={() => displayName.trim() && setStep(2)}
              >
                NEXT: PERSONALITY →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Personality ────────────────────────── */}
        {step === 2 && (
          <div>
            <div className="font-pixel text-[#00ff41] text-xs mb-6">
              STEP 3: CHOOSE YOUR PERSONALITY
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPersonality(p.id)}
                  className={`pixel-panel p-4 text-left cursor-pointer transition-all ${
                    personality === p.id ? "border-[#ffb000] shadow-[0_0_20px_rgba(255,176,0,0.3)]" : ""
                  }`}
                >
                  <div className="text-3xl mb-2">{p.icon}</div>
                  <div className="font-pixel text-[#ffb000] text-xs mb-2">{p.label}</div>
                  <div className="font-terminal text-[#00ff41] opacity-70 text-sm">{p.desc}</div>
                  {personality === p.id && (
                    <div className="mt-3 font-pixel text-[#ffb000] text-xs">▸ SELECTED</div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button className="pixel-btn" onClick={() => setStep(1)}>← BACK</button>
              <button
                className={`pixel-btn pixel-btn-amber ${!personality ? "pixel-btn-disabled" : ""}`}
                onClick={() => personality && setStep(3)}
              >
                NEXT: CITY →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: City Tier ──────────────────────────── */}
        {step === 3 && (
          <div>
            <div className="font-pixel text-[#00ff41] text-xs mb-6">
              STEP 4: CHOOSE YOUR CITY
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CITY_TIERS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCityTier(c.id)}
                  className={`pixel-panel p-4 text-left cursor-pointer transition-all ${
                    cityTier === c.id ? "border-[#ffb000] shadow-[0_0_20px_rgba(255,176,0,0.3)]" : ""
                  }`}
                >
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <div className="font-pixel text-[#ffb000] text-xs mb-2">{c.label}</div>
                  <div className="font-terminal text-[#00ff41] opacity-70 text-sm">{c.desc}</div>
                  {cityTier === c.id && (
                    <div className="mt-3 font-pixel text-[#ffb000] text-xs">▸ SELECTED</div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button className="pixel-btn" onClick={() => setStep(2)}>← BACK</button>
              <button
                className={`pixel-btn pixel-btn-amber ${!cityTier ? "pixel-btn-disabled" : ""}`}
                onClick={() => cityTier && setStep(4)}
              >
                NEXT: ROLL BACKGROUND →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Roll Background ────────────────────── */}
        {step === 4 && (
          <div>
            <div className="font-pixel text-[#00ff41] text-xs mb-6">
              STEP 5: ROLL YOUR BACKGROUND
            </div>

            {/* Character summary */}
            <div className="pixel-panel p-4 mb-4">
              <div className="font-pixel text-[#ffb000] text-xs mb-3">CHARACTER SUMMARY</div>
              <div className="grid grid-cols-2 gap-2 font-terminal text-lg">
                <div><span className="opacity-60">NAME: </span><span className="text-[#ffb000]">{displayName}</span></div>
                <div><span className="opacity-60">START: </span><span className="text-[#ffb000]">{selectedPoint?.label}</span></div>
                <div><span className="opacity-60">PERSONALITY: </span><span className="text-[#ffb000]">{personality?.toUpperCase()}</span></div>
                <div><span className="opacity-60">CITY: </span><span className="text-[#ffb000]">{cityTier?.toUpperCase()}</span></div>
              </div>
            </div>

            {/* Roll animation area */}
            <div className="pixel-panel p-6 mb-6 text-center">
              <div className="font-pixel text-[#00ff41] text-xs mb-4">FAMILY BACKGROUND (RANDOM ROLL)</div>

              {rolledTier ? (
                <div>
                  <div
                    className={`font-pixel text-2xl mb-2 ${
                      rolledTier === "high"
                        ? "text-[#ffb000] glow-amber"
                        : rolledTier === "middle"
                        ? "text-[#00ff41] glow-green"
                        : "text-[#ff6600]"
                    } ${rolling ? "opacity-50" : "opacity-100"}`}
                  >
                    {PARENTAL_LABELS[rolledTier as keyof typeof PARENTAL_LABELS]}
                  </div>
                  {!rolling && (
                    <div className="font-terminal text-[#00ff41] opacity-70 text-lg mb-4">
                      {PARENTAL_DESCS[rolledTier as keyof typeof PARENTAL_DESCS]}
                    </div>
                  )}

                  {/* Stat display */}
                  {!rolling && Object.keys(rolledStats).length > 0 && (
                    <div className="space-y-2 max-w-xs mx-auto mt-4">
                      {Object.entries(rolledStats).map(([label, value]) => (
                        <StatRollDisplay key={label} label={label} value={value} rolling={false} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="font-terminal text-[#00ff41] opacity-50 text-xl">
                  PRESS ROLL TO DISCOVER YOUR BACKGROUND...
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-4">
                <button className="pixel-btn" onClick={() => setStep(3)}>← BACK</button>
                <button
                  className="pixel-btn pixel-btn-amber"
                  onClick={rollBackground}
                  disabled={rolling}
                >
                  {rolling ? "ROLLING..." : rollCount === 0 ? "🎲 ROLL BACKGROUND" : "🔄 REROLL"}
                </button>
              </div>

              {rolledTier && !rolling && (
                <button
                  className={`pixel-btn text-lg px-8 py-3 ${loading ? "pixel-btn-disabled" : ""}`}
                  style={{ color: "#0a0a0a", background: "#00ff41", borderColor: "#00ff41" }}
                  onClick={handleStartGame}
                >
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
