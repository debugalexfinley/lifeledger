"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const CATEGORY_COLORS: Record<string, string> = {
  career: "#ffb000",
  health: "#00ff41",
  market: "#ff6600",
  family: "#ff88cc",
  wildcard: "#aa44ff",
  opportunity: "#00ccff",
};

const CATEGORY_ICONS: Record<string, string> = {
  career: "💼",
  health: "❤️",
  market: "📊",
  family: "👨‍👩‍👧",
  wildcard: "🎲",
  opportunity: "⭐",
};

function EventContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("id") as Id<"games"> | null;

  const game = useQuery(api.games.getGame, gameId ? { gameId } : "skip");
  const resolveEvent = useMutation(api.games.resolveEvent);

  const [resolved, setResolved] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [choiceMade, setChoiceMade] = useState<string | null>(null);

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
        <div className="font-pixel text-[#00ff41] text-xs cursor-blink">LOADING...</div>
      </div>
    );
  }

  const event = game.pendingEventData;
  if (!event && !resolved) {
    router.push(`/game?id=${gameId}`);
    return null;
  }

  // Determine category from impact type for color
  const impactType = event?.impactType || "";
  let category = "wildcard";
  if (impactType.includes("income") || impactType.includes("career")) category = "career";
  if (impactType.includes("health")) category = "health";
  if (impactType.includes("investment") || impactType.includes("market")) category = "market";
  if (impactType.includes("married") || impactType.includes("baby")) category = "family";
  if (impactType.includes("opportunity") || impactType.includes("mentor")) category = "opportunity";

  const color = CATEGORY_COLORS[category] || "#ffb000";
  const icon = CATEGORY_ICONS[category] || "🎲";

  // Parse impact for display
  const impacts: Array<{ label: string; value: string; positive: boolean }> = [];
  if (event) {
    const parts = event.impactType.split(",");
    for (const part of parts) {
      const [key, val] = part.trim().split(":");
      const numVal = parseFloat(val || "0");
      if (key === "cash") impacts.push({ label: "CASH", value: `${numVal >= 0 ? "+" : ""}$${Math.abs(numVal).toLocaleString()}`, positive: numVal >= 0 });
      if (key === "happiness") impacts.push({ label: "HAPPINESS", value: `${numVal >= 0 ? "+" : ""}${numVal}`, positive: numVal >= 0 });
      if (key === "health") impacts.push({ label: "HEALTH", value: `${numVal >= 0 ? "+" : ""}${numVal}`, positive: numVal >= 0 });
      if (key === "income_pct") impacts.push({ label: "INCOME", value: `${numVal >= 0 ? "+" : ""}${numVal}%`, positive: numVal >= 0 });
      if (key === "income_zero") impacts.push({ label: "INCOME", value: "→ $0 (LAYOFF)", positive: false });
      if (key === "investment_pct") impacts.push({ label: "INVESTMENTS", value: `${numVal >= 0 ? "+" : ""}${numVal}%`, positive: numVal >= 0 });
      if (key === "realestate_pct") impacts.push({ label: "REAL ESTATE", value: `${numVal >= 0 ? "+" : ""}${numVal}%`, positive: numVal >= 0 });
      if (key === "expense") impacts.push({ label: "MONTHLY EXPENSES", value: `+$${Math.abs(numVal).toLocaleString()}/mo`, positive: false });
      if (key === "married") impacts.push({ label: "STATUS", value: "→ MARRIED ❤️", positive: true });
      if (key === "baby") impacts.push({ label: "FAMILY", value: "+ BABY 👶", positive: true });
      if (key === "divorced") impacts.push({ label: "STATUS", value: "→ DIVORCED", positive: false });
    }
  }

  const handleChoice = async (choice: "accept" | "decline" | "none") => {
    if (!gameId || processing) return;
    setProcessing(true);
    setChoiceMade(choice === "accept" ? event?.choiceAcceptOutcome || "" : choice === "decline" ? event?.choiceDeclineOutcome || "" : event?.body || "");

    try {
      await resolveEvent({ gameId, choice });
      setResolved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="crt min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dramatic background glow */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 font-pixel text-xs opacity-20" style={{ color }}>
        ╔══════════╗
      </div>
      <div className="absolute bottom-4 right-4 font-pixel text-xs opacity-20" style={{ color }}>
        ╚══════════╝
      </div>

      <div className="max-w-2xl w-full event-slide-in">
        {!resolved ? (
          /* Event display */
          <div className="pixel-panel p-6" style={{ borderColor: color }}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{icon}</div>
              <div>
                <div className="font-pixel text-xs mb-1" style={{ color: `${color}88` }}>
                  LIFE EVENT — AGE {game.currentAge}
                </div>
                <div className="font-pixel text-sm" style={{ color }}>
                  {event?.title}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="font-terminal text-[#00ff41] text-xl leading-relaxed mb-6 border-l-4 pl-4" style={{ borderColor: color }}>
              {event?.body}
            </div>

            {/* Impact preview */}
            {impacts.length > 0 && !event?.hasChoice && (
              <div className="mb-6 space-y-1">
                <div className="font-pixel text-xs text-[#00ff41] opacity-60 mb-2">IMPACT:</div>
                {impacts.map((impact, i) => (
                  <div key={i} className="flex items-center gap-3 font-terminal text-lg">
                    <span className="opacity-60">{impact.label}:</span>
                    <span style={{ color: impact.positive ? "#00ff41" : "#ff0044" }}>
                      {impact.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Choices */}
            {event?.hasChoice ? (
              <div className="space-y-3">
                <div className="font-pixel text-xs text-[#ffb000] mb-3">WHAT DO YOU DO?</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    className="pixel-panel p-3 text-left hover:border-[#00ff41] cursor-pointer transition-all"
                    onClick={() => handleChoice("accept")}
                    disabled={processing}
                  >
                    <div className="font-pixel text-[#00ff41] text-xs mb-2">✓ ACCEPT</div>
                    <div className="font-terminal text-[#00ff41] opacity-70 text-base">
                      {event.choiceAcceptOutcome.slice(0, 80)}...
                    </div>
                  </button>
                  <button
                    className="pixel-panel p-3 text-left hover:border-[#ffb000] cursor-pointer transition-all"
                    onClick={() => handleChoice("decline")}
                    disabled={processing}
                  >
                    <div className="font-pixel text-[#ffb000] text-xs mb-2">✗ DECLINE</div>
                    <div className="font-terminal text-[#ffb000] opacity-70 text-base">
                      {event.choiceDeclineOutcome.slice(0, 80)}...
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="w-full pixel-btn pixel-btn-amber py-3"
                onClick={() => handleChoice("none")}
                disabled={processing}
              >
                {processing ? "PROCESSING..." : "▶ ACKNOWLEDGE EVENT →"}
              </button>
            )}
          </div>
        ) : (
          /* Resolution display */
          <div className="pixel-panel p-6 text-center" style={{ borderColor: color }}>
            <div className="text-5xl mb-4">
              {choiceMade?.includes("LAYOFF") || choiceMade?.includes("declining") ? "😬" : "✅"}
            </div>
            <div className="font-pixel text-[#ffb000] text-xs mb-4">OUTCOME</div>
            <div className="font-terminal text-[#00ff41] text-xl leading-relaxed mb-6">
              {choiceMade}
            </div>
            <button
              className="pixel-btn pixel-btn-amber px-8 py-3"
              onClick={() => router.push(`/game?id=${gameId}`)}
            >
              ▶ CONTINUE YOUR LIFE →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="font-pixel text-[#00ff41] text-xs cursor-blink">LOADING...</div>
      </div>
    }>
      <EventContent />
    </Suspense>
  );
}
