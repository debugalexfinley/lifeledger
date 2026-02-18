// ─────────────────────────────────────────────────────────────────────────────
// Pure game helpers — no Convex imports (safe to import from any mutation)
// ─────────────────────────────────────────────────────────────────────────────

// ── Normal distribution (Box-Muller transform) ──────────────────────────────
export function normalRandom(
  mean: number,
  stddev: number,
  min: number,
  max: number
): number {
  const u1 = Math.max(Math.random(), 1e-10);
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.min(max, Math.max(min, Math.round(mean + z * stddev)));
}

// ── Starting attributes ───────────────────────────────────────────────────────
export function rollStartingAttributes(heightInchesOverride?: number): {
  iq: number;
  athleticGenetics: number;
  heightInches: number;
} {
  return {
    iq: normalRandom(100, 15, 60, 160),
    athleticGenetics: normalRandom(50, 15, 10, 95),
    heightInches: heightInchesOverride ?? normalRandom(69, 3, 58, 80),
  };
}

// ── Health habits ─────────────────────────────────────────────────────────────
export type HealthHabits = {
  exercise: "sedentary" | "3x_week" | "gym";
  diet: "healthy" | "average" | "fast_food";
  sleep: "8hrs" | "6hrs" | "grind_5hrs";
  stressManagement: "therapy" | "meditation" | "nothing";
  preventiveCare: boolean;
};

export const DEFAULT_HEALTH_HABITS: HealthHabits = {
  exercise: "sedentary",
  diet: "average",
  sleep: "6hrs",
  stressManagement: "nothing",
  preventiveCare: false,
};

export function applyHealthHabits(
  habits: HealthHabits,
  health: number,
  happiness: number,
  baseMonthlyExpenses: number,
  exerciseStreakMonths: number,
  poorDietNoExerciseMonths: number
): {
  health: number;
  happiness: number;
  expenseDelta: number;
  exerciseStreakMonths: number;
  poorDietNoExerciseMonths: number;
} {
  let dHealth = 0;
  let dHappy = 0;
  let expenseDelta = 0;
  let eStreak = exerciseStreakMonths;
  let pdStreak = poorDietNoExerciseMonths;

  // Exercise
  switch (habits.exercise) {
    case "3x_week":
      dHealth += 3;
      dHappy += 2;
      eStreak++;
      break;
    case "gym":
      dHealth += 4;
      dHappy += 1;
      expenseDelta += 50;
      eStreak++;
      break;
    default: // sedentary
      eStreak = 0;
      break;
  }

  // Diet
  switch (habits.diet) {
    case "healthy":
      dHealth += 2;
      expenseDelta += 200;
      break;
    case "fast_food":
      dHealth -= 1;
      expenseDelta -= 100;
      break;
    default:
      break; // average: no change
  }

  // Sleep
  switch (habits.sleep) {
    case "8hrs":
      dHealth += 1;
      break;
    case "grind_5hrs":
      dHealth -= 2;
      break;
    default:
      break; // 6hrs: no change
  }

  // Stress management
  switch (habits.stressManagement) {
    case "therapy":
      dHappy += 5;
      expenseDelta += 150;
      break;
    case "meditation":
      dHappy += 2;
      break;
    default:
      break;
  }

  // Poor diet + no exercise tracking & compound penalty
  if (habits.diet !== "healthy" && habits.exercise === "sedentary") {
    pdStreak++;
    if (pdStreak > 12) dHealth -= 0.5; // starts hurting after a year
  } else {
    pdStreak = Math.max(0, pdStreak - 2); // improves quickly when habits improve
  }

  return {
    health: Math.min(100, Math.max(0, health + dHealth)),
    happiness: Math.min(100, Math.max(0, happiness + dHappy)),
    expenseDelta,
    exerciseStreakMonths: eStreak,
    poorDietNoExerciseMonths: pdStreak,
  };
}

// ── Life expectancy ───────────────────────────────────────────────────────────
export function calcLifeExpectancy(game: {
  startingAttributes?: { athleticGenetics: number } | null;
  health?: number;
  healthHistory?: Array<{ value: number }>;
  exerciseStreakMonths?: number;
  poorDietNoExerciseMonths?: number;
  smokingHistory?: boolean;
  netWorth?: number;
}): number {
  let le = 78;

  // Athletic genetics modifier (±5 years)
  const ag = game.startingAttributes?.athleticGenetics ?? 50;
  if (ag >= 70) le += 5;
  else if (ag >= 55) le += 2;
  else if (ag <= 30) le -= 5;
  else if (ag <= 40) le -= 2;

  // Sustained health — use last 24 months of history for accuracy
  const recentHealth = (game.healthHistory ?? []).slice(-24);
  if (recentHealth.length >= 12) {
    const avg =
      recentHealth.reduce((s, h) => s + h.value, 0) / recentHealth.length;
    if (avg < 40) le -= 5;
    else if (avg < 55) le -= 2;
    else if (avg > 80) le += 3;
  } else if (game.health !== undefined) {
    if (game.health < 40) le -= 3;
    else if (game.health > 80) le += 2;
  }

  // Exercise habit 5+ years
  if ((game.exerciseStreakMonths ?? 0) >= 60) le += 3;

  // Wealth > $1M (better healthcare access)
  if ((game.netWorth ?? 0) > 1_000_000) le += 2;

  // Smoking event
  if (game.smokingHistory) le -= 7;

  // Poor diet + no exercise 5+ years
  if ((game.poorDietNoExerciseMonths ?? 0) >= 60) le -= 5;

  return Math.max(45, Math.min(99, Math.round(le)));
}

// ── Partner generation ────────────────────────────────────────────────────────
const PARTNER_NAMES = [
  "Alex", "Jordan", "Sam", "Casey", "Riley", "Morgan", "Taylor", "Avery",
  "Quinn", "Drew", "Parker", "Cameron", "Blake", "Sage", "Rowan", "Phoenix",
  "Hayden", "Emery", "Devon", "Reese", "Jamie", "Skyler", "Finley", "Peyton",
  "Lennon", "River", "Sloane", "Elliot", "Harley", "Sutton",
];

const PERSONALITY_TRAITS = [
  "creative", "adventurous", "conflict-avoidant", "ambitious", "caring",
  "spontaneous", "analytical", "empathetic", "independent", "loyal",
  "introverted", "extroverted", "pragmatic", "idealistic", "funny",
  "serious", "romantic", "practical", "competitive", "easygoing",
  "artistic", "athletic", "intellectual", "spiritual", "nerdy",
  "social butterfly", "bookworm", "foodie", "traveler", "homebody",
];

const PARTNER_CAREERS = [
  { title: "Software Engineer", income: 7200 },
  { title: "Registered Nurse", income: 5200 },
  { title: "Teacher", income: 3800 },
  { title: "Marketing Manager", income: 5800 },
  { title: "Accountant", income: 4800 },
  { title: "Graphic Designer", income: 4200 },
  { title: "Doctor", income: 12000 },
  { title: "Lawyer", income: 9500 },
  { title: "Real Estate Agent", income: 5500 },
  { title: "Chef", income: 3500 },
  { title: "Personal Trainer", income: 3800 },
  { title: "Journalist", income: 4000 },
  { title: "Therapist", income: 6000 },
  { title: "Electrician", income: 5200 },
  { title: "Data Analyst", income: 6200 },
  { title: "Pharmacist", income: 9000 },
  { title: "Physical Therapist", income: 7000 },
  { title: "Project Manager", income: 6500 },
  { title: "Financial Advisor", income: 7500 },
  { title: "UX Designer", income: 6000 },
  { title: "Freelancer", income: 3200 },
  { title: "Small Business Owner", income: 5500 },
];

export const ORGANIC_LOCATIONS = [
  "coffee shop", "gym", "work conference", "friend's party", "bar",
  "dog park", "hiking trail", "bookstore", "grocery store", "yoga class",
  "farmers market", "volunteer event", "co-working space", "art gallery",
  "trivia night",
];

export type PartnerProspect = {
  name: string;
  traits: string[];
  career: string;
  monthlyIncome: number;
  attractiveness: number;
  iq: number;
  ambition: number;
  emotionalStability: number;
  financialResponsibility: number;
  compatibilityScore: number;
  location: string;
  source: "organic" | "online";
  hasBeenTalkedTo: boolean;
};

export function generatePartner(
  source: "organic" | "online",
  location: string,
  playerMarketingSkill: number = 0
): PartnerProspect {
  const name = PARTNER_NAMES[Math.floor(Math.random() * PARTNER_NAMES.length)];

  // Pick 2-3 unique personality traits
  const shuffled = [...PERSONALITY_TRAITS].sort(() => Math.random() - 0.5);
  const traits = shuffled.slice(0, Math.random() > 0.5 ? 3 : 2);

  // Online dating with good marketing skill pulls from better-career pool
  const careerPool =
    source === "online" && playerMarketingSkill > 50
      ? PARTNER_CAREERS.filter((c) => c.income >= 5000)
      : PARTNER_CAREERS;
  const career = careerPool[Math.floor(Math.random() * careerPool.length)];

  const attractiveness = Math.min(
    10,
    Math.max(1, Math.round(normalRandom(6, 1.8, 1, 10)))
  );
  const iq = normalRandom(100, 18, 60, 140);
  const ambition = Math.min(
    10,
    Math.max(1, Math.round(normalRandom(5.5, 2, 1, 10)))
  );
  const emotionalStability = Math.min(
    10,
    Math.max(1, Math.round(normalRandom(6, 2, 1, 10)))
  );
  const financialResponsibility = Math.min(
    10,
    Math.max(1, Math.round(normalRandom(5.5, 2, 1, 10)))
  );

  // Compatibility: weighted formula + significant random factor
  const compatibility = Math.round(
    emotionalStability * 8 +
    financialResponsibility * 5 +
    (10 - Math.abs(ambition - 6)) * 4 +
    Math.random() * 35
  );

  return {
    name,
    traits,
    career: career.title,
    monthlyIncome: Math.round(career.income * (0.8 + Math.random() * 0.6)),
    attractiveness,
    iq,
    ambition,
    emotionalStability,
    financialResponsibility,
    compatibilityScore: Math.min(100, Math.max(10, compatibility)),
    location,
    source,
    hasBeenTalkedTo: false,
  };
}

export function getRandomLocation(): string {
  return ORGANIC_LOCATIONS[Math.floor(Math.random() * ORGANIC_LOCATIONS.length)];
}

/** Estimated divorce risk % given a partner's attributes */
export function calcDivorceRisk(partner: {
  emotionalStability: number;
  ambition: number;
  attractiveness: number;
  compatibilityScore: number;
}): number {
  let risk = 30;
  risk -= partner.emotionalStability * 2;
  risk += partner.ambition > 8 ? 10 : 0;
  risk += partner.attractiveness > 8 ? 5 : 0; // highly attractive partners have more options
  risk -= partner.compatibilityScore * 0.15;
  return Math.max(5, Math.min(80, Math.round(risk)));
}

/** Estimated combined income boost from marriage (ambition-weighted) */
export function partnerIncomeBoost(partner: {
  monthlyIncome: number;
  ambition: number;
}): number {
  return Math.round(partner.monthlyIncome * (partner.ambition / 20));
}

/** Monthly expense change from low-financial-responsibility partner lifestyle creep */
export function partnerExpenseChange(partner: {
  financialResponsibility: number;
  monthlyIncome: number;
}): number {
  if (partner.financialResponsibility <= 3) {
    return Math.round(300 + Math.random() * 1200); // $300-1500 lifestyle creep
  }
  if (partner.financialResponsibility >= 8) {
    return -Math.round(partner.monthlyIncome * 0.05); // partner helps save
  }
  return 0;
}
