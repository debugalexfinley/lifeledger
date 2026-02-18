import { mutation } from "./_generated/server";

export const seedEventTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("eventTemplates").first();
    if (existing) return { status: "already_seeded", count: 0 };

    const templates = [
      // ═══════════════════════════════════════
      // CAREER EVENTS
      // ═══════════════════════════════════════
      {
        category: "career" as const,
        weight: 8,
        minAge: 20,
        titleTemplate: "Promotion Offer",
        bodyTemplate:
          "Your manager pulls you aside — they're impressed with your work. They're offering you a promotion with a significant raise!",
        impactType: "income_pct:25,happiness:10",
        hasChoice: true,
        choiceAcceptOutcome: "You accepted the promotion! Your salary increased by 25%.",
        choiceDeclineOutcome:
          "You declined the promotion. Your boss seems confused, but respects your decision.",
      },
      {
        category: "career" as const,
        weight: 5,
        minAge: 22,
        titleTemplate: "Layoff Notice",
        bodyTemplate:
          "Company-wide restructuring. HR calls you in — your position has been eliminated effective immediately.",
        impactType: "income_zero:0,happiness:-20,health:-5",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "career" as const,
        weight: 6,
        minAge: 18,
        titleTemplate: "Side Hustle Takes Off",
        bodyTemplate:
          "Your side project is gaining traction! You start making consistent money from it each month.",
        impactType: "income_pct_temp:15,happiness:15",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "career" as const,
        weight: 6,
        minAge: 22,
        titleTemplate: "Toxic Boss",
        bodyTemplate:
          "Your new manager is making your life hell — micromanaging every task, taking credit for your work. Do you stick it out or quit?",
        impactType: "happiness:-15",
        hasChoice: true,
        choiceAcceptOutcome:
          "You quit. It's scary but your mental health improves immediately. Now to find a new job...",
        choiceDeclineOutcome:
          "You stay. The paycheck is worth it for now, but you feel the stress building.",
      },
      {
        category: "career" as const,
        weight: 4,
        minAge: 25,
        titleTemplate: "Job Offer from Competitor",
        bodyTemplate:
          "A headhunter reaches out — a competitor is offering you 30% more to jump ship. Do you take it?",
        impactType: "income_pct:30,happiness:5",
        hasChoice: true,
        choiceAcceptOutcome:
          "You made the jump! 30% raise and exciting new challenges await.",
        choiceDeclineOutcome:
          "You stay loyal. Your current company notices and gives you a small raise anyway.",
      },
      {
        category: "career" as const,
        weight: 4,
        minAge: 28,
        titleTemplate: "Work-Life Balance Crisis",
        bodyTemplate:
          "You've been working 70-hour weeks. Your health and relationships are suffering. Do you dial it back?",
        impactType: "health:-10,happiness:-10",
        hasChoice: true,
        choiceAcceptOutcome:
          "You set better boundaries. Productivity stays high and you feel much better.",
        choiceDeclineOutcome:
          "You push through. Income stays high but health takes another hit.",
      },
      {
        category: "career" as const,
        weight: 5,
        minAge: 25,
        titleTemplate: "Performance Bonus",
        bodyTemplate:
          "Outstanding quarter! Your company rewards top performers with a one-time bonus.",
        impactType: "cash:5000,happiness:10",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "career" as const,
        weight: 3,
        minAge: 30,
        titleTemplate: "Start Your Own Business",
        bodyTemplate:
          "You've spotted a market gap. Starting a business could transform your financial future — or drain your savings. Do you take the leap?",
        impactType: "income_pct:-50,cash:-10000,happiness:20",
        hasChoice: true,
        choiceAcceptOutcome:
          "You launched your business! It's risky, but you're the boss now.",
        choiceDeclineOutcome:
          "You stay employed. Safe, but you wonder about the road not taken.",
      },
      {
        category: "career" as const,
        weight: 5,
        minAge: 22,
        titleTemplate: "Conference Networking Win",
        bodyTemplate:
          "At an industry conference you meet a VP who remembers your name. Three weeks later they call with a job offer.",
        impactType: "income_pct:20,happiness:8",
        hasChoice: true,
        choiceAcceptOutcome:
          "You took the call. New job, 20% salary bump, exciting team.",
        choiceDeclineOutcome:
          "You politely declined. Loyalty has its own rewards.",
      },
      {
        category: "career" as const,
        weight: 4,
        minAge: 35,
        titleTemplate: "Executive Opportunity",
        bodyTemplate:
          "A board seat opens up at a mid-size company. Taking it means more responsibility and a significant salary jump.",
        impactType: "income_pct:40,happiness:10,health:-5",
        hasChoice: true,
        choiceAcceptOutcome:
          "You stepped into executive leadership. The pressure is real but so is the comp package.",
        choiceDeclineOutcome:
          "You passed. Work-life balance wins today.",
      },
      {
        category: "career" as const,
        weight: 6,
        minAge: 18,
        titleTemplate: "Internship Offer",
        bodyTemplate:
          "A well-known company is offering you a paid internship. The experience could accelerate your career significantly.",
        impactType: "income_pct_temp:30,happiness:12",
        hasChoice: true,
        choiceAcceptOutcome:
          "You got the internship! Great experience and a foot in the door.",
        choiceDeclineOutcome:
          "You declined to focus on school. Grades improve.",
      },
      {
        category: "career" as const,
        weight: 3,
        minAge: 22,
        titleTemplate: "Whistleblower Moment",
        bodyTemplate:
          "You've discovered your company is engaged in questionable practices. Do you report it?",
        impactType: "happiness:-10",
        hasChoice: true,
        choiceAcceptOutcome:
          "You reported it. It was painful but your integrity is intact. New job incoming.",
        choiceDeclineOutcome:
          "You look the other way. The cognitive dissonance is real.",
      },

      // ═══════════════════════════════════════
      // HEALTH EVENTS
      // ═══════════════════════════════════════
      {
        category: "health" as const,
        weight: 5,
        titleTemplate: "Medical Emergency",
        bodyTemplate:
          "You're rushed to the ER with a serious condition. The bills are devastating even with insurance.",
        impactType: "cash:-8000,health:-20,happiness:-15",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "health" as const,
        weight: 7,
        titleTemplate: "Gym Habit Formed",
        bodyTemplate:
          "You've been consistently hitting the gym for three months. The results are showing!",
        impactType: "health:10,happiness:8",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "health" as const,
        weight: 5,
        minAge: 28,
        titleTemplate: "Burnout",
        bodyTemplate:
          "Months of overwork have caught up with you. Your doctor advises you to slow down immediately.",
        impactType: "happiness:-20,health:-10",
        hasChoice: true,
        choiceAcceptOutcome:
          "You took medical leave. Recovery takes 2 months but you bounce back stronger.",
        choiceDeclineOutcome:
          "You pushed through. Health continues to decline slowly.",
      },
      {
        category: "health" as const,
        weight: 4,
        minAge: 30,
        titleTemplate: "Chronic Condition Diagnosis",
        bodyTemplate:
          "Routine checkup reveals a chronic condition requiring ongoing medication and lifestyle changes.",
        impactType: "health:-15,expense:200,happiness:-10",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "health" as const,
        weight: 6,
        titleTemplate: "Meditation & Mindfulness",
        bodyTemplate:
          "You've adopted a daily meditation practice. Stress levels are plummeting.",
        impactType: "happiness:12,health:5",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "health" as const,
        weight: 5,
        titleTemplate: "Sports Injury",
        bodyTemplate:
          "A weekend pickup game ends badly — torn ligament. Surgery and physical therapy required.",
        impactType: "cash:-4000,health:-15,happiness:-10",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "health" as const,
        weight: 6,
        titleTemplate: "Mental Health Therapy",
        bodyTemplate:
          "You started seeing a therapist. The sessions are helping you process stress and make better decisions.",
        impactType: "happiness:15,expense:200",
        hasChoice: true,
        choiceAcceptOutcome:
          "You committed to weekly sessions. Your mental clarity improves significantly.",
        choiceDeclineOutcome:
          "You skipped it. The problems fester a little longer.",
      },
      {
        category: "health" as const,
        weight: 4,
        minAge: 40,
        titleTemplate: "Heart Health Warning",
        bodyTemplate:
          "Your doctor warns your cholesterol and blood pressure are concerning. Lifestyle changes needed now.",
        impactType: "health:-10,happiness:-8,expense:150",
        hasChoice: true,
        choiceAcceptOutcome:
          "You changed your diet and started exercising. Health slowly improves.",
        choiceDeclineOutcome:
          "You ignored the advice. Health continues to decline.",
      },
      {
        category: "health" as const,
        weight: 5,
        titleTemplate: "Sleep Optimization",
        bodyTemplate:
          "You invested in better sleep hygiene — blackout curtains, consistent schedule, no screens at night.",
        impactType: "health:8,happiness:10",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "health" as const,
        weight: 3,
        minAge: 50,
        titleTemplate: "Major Surgery",
        bodyTemplate:
          "A necessary surgery puts you out of work for 6 weeks and drains your medical savings.",
        impactType: "cash:-15000,health:-20,happiness:-15",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "health" as const,
        weight: 6,
        titleTemplate: "Healthy Eating Habit",
        bodyTemplate:
          "You committed to meal prepping and cutting processed food. Energy levels have never been better.",
        impactType: "health:7,happiness:5",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "health" as const,
        weight: 4,
        titleTemplate: "Substance Dependency",
        bodyTemplate:
          "Stress has led to unhealthy coping mechanisms. You notice the pattern and must decide to address it.",
        impactType: "health:-15,happiness:-10,cash:-500",
        hasChoice: true,
        choiceAcceptOutcome:
          "You sought help. Recovery is hard but your health and finances stabilize.",
        choiceDeclineOutcome:
          "You ignored the warning signs. Health and happiness continue declining.",
      },

      // ═══════════════════════════════════════
      // MARKET EVENTS
      // ═══════════════════════════════════════
      {
        category: "market" as const,
        weight: 4,
        titleTemplate: "Recession Hits",
        bodyTemplate:
          "The economy enters a severe recession. Markets crash, layoffs spike, and your investments take a hit.",
        impactType: "investment_pct:-30,happiness:-10",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "market" as const,
        weight: 5,
        titleTemplate: "Bull Market Rally",
        bodyTemplate:
          "Markets are surging! Your investment portfolio is up big this quarter.",
        impactType: "investment_pct:20,happiness:10",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "market" as const,
        weight: 4,
        titleTemplate: "Real Estate Boom",
        bodyTemplate:
          "Property values in your area skyrocket. If you own, you're sitting pretty.",
        impactType: "realestate_pct:25,happiness:8",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "market" as const,
        weight: 4,
        titleTemplate: "Stock Market Crash",
        bodyTemplate:
          "A sudden market correction wipes out significant portfolio value overnight.",
        impactType: "investment_pct:-40,happiness:-15",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "market" as const,
        weight: 5,
        titleTemplate: "Interest Rate Hike",
        bodyTemplate:
          "The Fed raises rates significantly. Your mortgage payment adjusts upward if you have a variable rate.",
        impactType: "expense:300,happiness:-5",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "market" as const,
        weight: 4,
        titleTemplate: "Crypto Mania",
        bodyTemplate:
          "Everyone's talking about a hot new cryptocurrency. Do you invest a chunk of your savings?",
        impactType: "happiness:5",
        hasChoice: true,
        choiceAcceptOutcome:
          "You bought in. It doubled — you sold half and kept the rest.",
        choiceDeclineOutcome:
          "You stayed out. Smart money avoids speculation.",
      },
      {
        category: "market" as const,
        weight: 3,
        titleTemplate: "Hyperinflation Spike",
        bodyTemplate:
          "Inflation surges to 9%. Your purchasing power drops and expenses creep up.",
        impactType: "expense:400,happiness:-8,investment_pct:-5",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "market" as const,
        weight: 5,
        titleTemplate: "Tech Sector Surge",
        bodyTemplate:
          "Tech stocks are on fire this year. If you hold any tech ETFs, you're winning.",
        impactType: "investment_pct:15,happiness:5",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "market" as const,
        weight: 3,
        titleTemplate: "Housing Market Crash",
        bodyTemplate:
          "Real estate values drop sharply. Your home may now be worth less than you owe.",
        impactType: "realestate_pct:-25,happiness:-12",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },

      // ═══════════════════════════════════════
      // FAMILY EVENTS
      // ═══════════════════════════════════════
      {
        category: "family" as const,
        weight: 6,
        minAge: 22,
        titleTemplate: "Relationship Milestone",
        bodyTemplate:
          "You've been dating someone wonderful for two years. They pop the question... or you do. Time to decide.",
        impactType: "married:1",
        hasChoice: true,
        choiceAcceptOutcome:
          "You said yes! Wedding planning begins. Expenses up slightly but happiness surges.",
        choiceDeclineOutcome:
          "You said not yet. Your partner is disappointed but understanding.",
      },
      {
        category: "family" as const,
        weight: 5,
        minAge: 25,
        maxAge: 40,
        titleTemplate: "New Baby",
        bodyTemplate:
          "Congratulations! A new life is joining your family. Expenses are about to increase significantly.",
        impactType: "baby:1",
        hasChoice: true,
        choiceAcceptOutcome:
          "The baby arrives! Life is exhausting but beautiful. +$1,200/mo expenses.",
        choiceDeclineOutcome:
          "You decided it's not the right time. The choice weighs on you.",
      },
      {
        category: "family" as const,
        weight: 3,
        minAge: 30,
        titleTemplate: "Inheritance",
        bodyTemplate:
          "A relative has passed away, leaving you a meaningful inheritance.",
        impactType: "cash:35000,happiness:-5",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "family" as const,
        weight: 4,
        minAge: 28,
        titleTemplate: "Divorce",
        bodyTemplate:
          "The marriage has broken down irreparably. Lawyers are involved and assets will be divided.",
        impactType: "divorced:1",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "family" as const,
        weight: 5,
        minAge: 35,
        titleTemplate: "Aging Parent Support",
        bodyTemplate:
          "A parent needs financial support for medical care. Do you help them?",
        impactType: "happiness:-5",
        hasChoice: true,
        choiceAcceptOutcome:
          "You're helping cover their expenses. +$800/mo but you feel good about it.",
        choiceDeclineOutcome:
          "You can't afford it right now. The guilt is real.",
      },
      {
        category: "family" as const,
        weight: 5,
        minAge: 22,
        maxAge: 35,
        titleTemplate: "Second Child",
        bodyTemplate:
          "Your family is growing again! Another child means more joy and more expenses.",
        impactType: "baby:1,happiness:10",
        hasChoice: true,
        choiceAcceptOutcome:
          "Another baby on the way! Expenses jump again but the family is thriving.",
        choiceDeclineOutcome:
          "One child is enough for now. Your finances thank you.",
      },
      {
        category: "family" as const,
        weight: 4,
        minAge: 40,
        titleTemplate: "College Tuition for Kids",
        bodyTemplate:
          "Your child is heading to college. Will you help pay for it?",
        impactType: "cash:-20000,happiness:10",
        hasChoice: true,
        choiceAcceptOutcome:
          "You paid for their education. Your savings took a hit but they'll graduate debt-free.",
        choiceDeclineOutcome:
          "They'll have to take out loans. You feel guilty but your finances are intact.",
      },
      {
        category: "family" as const,
        weight: 4,
        minAge: 25,
        titleTemplate: "Family Vacation",
        bodyTemplate:
          "The family needs a break. A proper vacation would cost about $3,000 but the memories would last forever.",
        impactType: "cash:-3000,happiness:20",
        hasChoice: true,
        choiceAcceptOutcome:
          "Best trip ever! The family needed this. +20 happiness.",
        choiceDeclineOutcome:
          "Too expensive right now. You do a staycation instead.",
      },
      {
        category: "family" as const,
        weight: 3,
        minAge: 50,
        titleTemplate: "Large Inheritance",
        bodyTemplate:
          "You receive a substantial inheritance from a relative who planned well for retirement.",
        impactType: "cash:75000,happiness:5",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "family" as const,
        weight: 4,
        minAge: 30,
        titleTemplate: "Partner Gets Promoted",
        bodyTemplate:
          "Your partner receives a major promotion! Household income jumps.",
        impactType: "income_pct_temp:20,happiness:15",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },

      // ═══════════════════════════════════════
      // WILDCARD EVENTS
      // ═══════════════════════════════════════
      {
        category: "wildcard" as const,
        weight: 4,
        titleTemplate: "Identity Theft",
        bodyTemplate:
          "You receive a fraud alert — someone has stolen your identity and racked up charges.",
        impactType: "cash:-3000,happiness:-15,debt:3000",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const,
        weight: 4,
        titleTemplate: "Lottery Win",
        bodyTemplate:
          "Your scratch-off ticket reveals a real winner! Not life-changing, but definitely helpful.",
        impactType: "cash:12000,happiness:20",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const,
        weight: 5,
        titleTemplate: "Car Totaled",
        bodyTemplate:
          "Your car is totaled in an accident. Insurance covers some but not all of the replacement cost.",
        impactType: "cash:-5000,happiness:-10",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const,
        weight: 3,
        titleTemplate: "Natural Disaster",
        bodyTemplate:
          "A flood/fire/storm hits your area causing significant damage to your property.",
        impactType: "cash:-12000,realestate_pct:-10,happiness:-20,health:-5",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const,
        weight: 4,
        titleTemplate: "Home Repair Emergency",
        bodyTemplate:
          "The roof is leaking, the HVAC died, and the water heater failed — all in the same month.",
        impactType: "cash:-8000,happiness:-10",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const,
        weight: 5,
        titleTemplate: "Viral Social Media Post",
        bodyTemplate:
          "A video you posted goes viral! Sponsors reach out and there's real money to be made.",
        impactType: "income_pct_temp:10,happiness:15",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const,
        weight: 4,
        titleTemplate: "Tax Audit",
        bodyTemplate:
          "The IRS flags your return for an audit. Legal and accounting fees add up.",
        impactType: "cash:-3500,happiness:-15",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const,
        weight: 4,
        titleTemplate: "Legal Dispute",
        bodyTemplate:
          "You're named in a lawsuit — either as plaintiff or defendant. Legal fees mount quickly.",
        impactType: "cash:-7000,happiness:-20",
        hasChoice: true,
        choiceAcceptOutcome: "You settled out of court. Expensive but the stress ends.",
        choiceDeclineOutcome: "You fought it in court. Costly but you won on principle.",
      },
      {
        category: "wildcard" as const,
        weight: 3,
        titleTemplate: "Scam Victim",
        bodyTemplate:
          "A sophisticated investment scam drained money from your account before you realized what happened.",
        impactType: "cash:-8000,happiness:-20",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const,
        weight: 5,
        titleTemplate: "Unexpected Tax Refund",
        bodyTemplate:
          "Your accountant discovers deductions you missed for years. You receive a large refund.",
        impactType: "cash:4500,happiness:10",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const,
        weight: 5,
        titleTemplate: "Burst Pipe",
        bodyTemplate:
          "A pipe burst while you were on vacation, flooding your home or apartment.",
        impactType: "cash:-4000,happiness:-12",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const,
        weight: 4,
        titleTemplate: "Pay Raise Surprise",
        bodyTemplate:
          "Your company announces surprise annual raises for all employees.",
        impactType: "income_pct:8,happiness:12",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },

      // ═══════════════════════════════════════
      // OPPORTUNITY EVENTS
      // ═══════════════════════════════════════
      {
        category: "opportunity" as const,
        weight: 5,
        minAge: 25,
        titleTemplate: "Mentor Relationship",
        bodyTemplate:
          "A senior leader in your field takes you under their wing. Their guidance is invaluable.",
        impactType: "income_pct_temp:15,happiness:10",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "opportunity" as const,
        weight: 3,
        minAge: 22,
        maxAge: 40,
        titleTemplate: "Startup Equity Offer",
        bodyTemplate:
          "A promising startup wants you. Lower base salary but meaningful equity stake. High risk, potential massive upside.",
        impactType: "income_pct:-20,happiness:15",
        hasChoice: true,
        choiceAcceptOutcome:
          "You joined the startup! Salary cut hurts now, but the equity could be worth millions.",
        choiceDeclineOutcome:
          "You played it safe. 5 years later, that startup sold for $100M. What if...?",
      },
      {
        category: "opportunity" as const,
        weight: 4,
        minAge: 28,
        titleTemplate: "Real Estate Deal",
        bodyTemplate:
          "A below-market property just hit listings — a motivated seller needs cash fast. $20k down could net you a great investment.",
        impactType: "realestate_pct:15,happiness:8",
        hasChoice: true,
        choiceAcceptOutcome:
          "You grabbed it! The property is already appreciating above market rate.",
        choiceDeclineOutcome:
          "You passed. Someone else bought it and flipped it for a 30% gain in 18 months.",
      },
      {
        category: "opportunity" as const,
        weight: 4,
        minAge: 30,
        titleTemplate: "Angel Investment Opportunity",
        bodyTemplate:
          "A friend is launching a company and wants you to invest $10,000 for 5% equity. Do you bet on them?",
        impactType: "cash:-10000,happiness:10",
        hasChoice: true,
        choiceAcceptOutcome:
          "You invested. The company grows steadily — your equity is worth something.",
        choiceDeclineOutcome:
          "You didn't invest. Your savings stay intact.",
      },
      {
        category: "opportunity" as const,
        weight: 5,
        minAge: 22,
        titleTemplate: "Certification Opportunity",
        bodyTemplate:
          "Your company will pay for a professional certification that could significantly boost your earning power.",
        impactType: "income_pct:12,happiness:8",
        hasChoice: true,
        choiceAcceptOutcome:
          "Certified! Your market value just jumped. New opportunities are opening.",
        choiceDeclineOutcome:
          "Too busy right now. You'll get to it eventually.",
      },
      {
        category: "opportunity" as const,
        weight: 4,
        minAge: 25,
        titleTemplate: "Relocation Offer",
        bodyTemplate:
          "Your company wants to transfer you to a high-cost city — but with a 35% salary increase and relocation package.",
        impactType: "income_pct:35,expense:800,happiness:5",
        hasChoice: true,
        choiceAcceptOutcome:
          "You moved! Higher salary, higher expenses, but your career is accelerating.",
        choiceDeclineOutcome:
          "You stayed put. Comfort over career advancement for now.",
      },
      {
        category: "opportunity" as const,
        weight: 5,
        minAge: 20,
        titleTemplate: "Index Fund Strategy",
        bodyTemplate:
          "A financial advisor friend explains the power of consistent index fund investing. Even $200/month compounds dramatically.",
        impactType: "happiness:5",
        hasChoice: true,
        choiceAcceptOutcome:
          "You set up automatic $200/month investments. Future you will be grateful.",
        choiceDeclineOutcome:
          "You'll think about it later. Procrastination costs.",
      },
      {
        category: "opportunity" as const,
        weight: 4,
        minAge: 30,
        titleTemplate: "Rental Property Income",
        bodyTemplate:
          "You found a duplex — live in one unit, rent the other. The rental income would nearly cover your mortgage.",
        impactType: "income_pct_temp:25,happiness:10",
        hasChoice: true,
        choiceAcceptOutcome:
          "You bought the duplex! The rental income is a game changer for your finances.",
        choiceDeclineOutcome:
          "Too much hassle being a landlord. You passed.",
      },
      {
        category: "opportunity" as const,
        weight: 4,
        minAge: 22,
        titleTemplate: "Freelance Big Client",
        bodyTemplate:
          "A major corporation wants to hire you as a freelance consultant for a 3-month project at premium rates.",
        impactType: "cash:15000,happiness:15",
        hasChoice: true,
        choiceAcceptOutcome:
          "You landed the contract! $15,000 for 3 months of consulting work.",
        choiceDeclineOutcome:
          "You turned it down. Too much on your plate right now.",
      },
      {
        category: "opportunity" as const,
        weight: 3,
        minAge: 35,
        titleTemplate: "Business Acquisition",
        bodyTemplate:
          "An established small business is for sale at a fair price. It's profitable and you have the skills to run it.",
        impactType: "income_pct:50,cash:-30000,happiness:20",
        hasChoice: true,
        choiceAcceptOutcome:
          "You bought the business! The income is strong and you're your own boss.",
        choiceDeclineOutcome:
          "Too risky. You stayed with steady employment.",
      },
      {
        category: "opportunity" as const,
        weight: 4,
        minAge: 20,
        titleTemplate: "Scholarship Discovered",
        bodyTemplate:
          "You discover a scholarship you qualify for that could pay off a significant chunk of student debt.",
        impactType: "cash:8000,happiness:15",
        hasChoice: true,
        choiceAcceptOutcome: "Application successful! $8,000 applied to your student loans.",
        choiceDeclineOutcome: "You forgot to apply before the deadline. Classic.",
      },
      {
        category: "opportunity" as const,
        weight: 4,
        minAge: 25,
        titleTemplate: "Book Publishing Deal",
        bodyTemplate:
          "Your expertise in your field has led to a book deal offer. Modest advance but great for your brand.",
        impactType: "cash:12000,happiness:20,income_pct_temp:10",
        hasChoice: true,
        choiceAcceptOutcome:
          "Your book is published! Speaking fees start rolling in.",
        choiceDeclineOutcome:
          "Writing a book is too time-consuming right now.",
      },

      // ═══════════════════════════════════════
      // ADDITIONAL MIXED EVENTS (FILLER)
      // ═══════════════════════════════════════
      {
        category: "career" as const,
        weight: 5,
        minAge: 18,
        titleTemplate: "Skill Up Online Course",
        bodyTemplate:
          "You complete an online certification course in a hot skill area. Recruiters are already reaching out.",
        impactType: "income_pct:10,happiness:8",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "career" as const,
        weight: 4,
        minAge: 22,
        titleTemplate: "Company Goes Bankrupt",
        bodyTemplate:
          "Your employer files for bankruptcy. Your job security evaporates overnight.",
        impactType: "income_zero:0,happiness:-25,health:-5",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "health" as const,
        weight: 5,
        titleTemplate: "Running Milestone",
        bodyTemplate: "You completed your first marathon! Training for months paid off.",
        impactType: "health:12,happiness:15",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "health" as const,
        weight: 4,
        minAge: 35,
        titleTemplate: "Preventive Health Screening",
        bodyTemplate:
          "Routine screening caught a potential issue early. Early detection makes all the difference.",
        impactType: "health:5,happiness:5,cash:-1500",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "family" as const,
        weight: 4,
        minAge: 20,
        titleTemplate: "Friendship Circle Grows",
        bodyTemplate:
          "You've built a strong social support network. Studies show close friendships are priceless for wellbeing.",
        impactType: "happiness:15",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const,
        weight: 5,
        titleTemplate: "Power Outage",
        bodyTemplate: "A major storm knocks out power for a week, spoiling food and disrupting work.",
        impactType: "cash:-800,happiness:-8",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "market" as const,
        weight: 5,
        titleTemplate: "Bond Market Stability",
        bodyTemplate:
          "Conservative investments held steady while stocks were volatile. Your diversified portfolio thanks you.",
        impactType: "happiness:5,investment_pct:5",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "opportunity" as const,
        weight: 4,
        minAge: 22,
        titleTemplate: "Government Grant",
        bodyTemplate:
          "Your small business qualifies for a government grant to support growth.",
        impactType: "cash:10000,happiness:15",
        hasChoice: true,
        choiceAcceptOutcome: "Grant approved! $10,000 injected into your operations.",
        choiceDeclineOutcome: "Too much paperwork. You declined.",
      },
      {
        category: "career" as const,
        weight: 4,
        minAge: 25,
        titleTemplate: "Automation Threat",
        bodyTemplate:
          "AI tools are automating parts of your role. Adapt or be left behind.",
        impactType: "income_pct:-10,happiness:-10",
        hasChoice: true,
        choiceAcceptOutcome: "You embraced AI tools and became even more valuable.",
        choiceDeclineOutcome: "You resisted change. Your role slowly becomes less relevant.",
      },
      {
        category: "family" as const,
        weight: 5,
        minAge: 18,
        titleTemplate: "Family Health Crisis",
        bodyTemplate: "A close family member falls seriously ill. You want to help cover their treatment costs.",
        impactType: "cash:-6000,happiness:-15,health:-5",
        hasChoice: true,
        choiceAcceptOutcome: "You covered the treatment costs. Family is everything.",
        choiceDeclineOutcome: "You couldn't afford to help. The guilt is heavy.",
      },
      {
        category: "wildcard" as const,
        weight: 4,
        titleTemplate: "Investment Returns Boosted",
        bodyTemplate: "A hot tip from a trusted colleague led to a well-timed investment move.",
        impactType: "investment_pct:12,happiness:12",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "career" as const,
        weight: 5,
        minAge: 30,
        titleTemplate: "Speaking Engagement",
        bodyTemplate: "You're invited to speak at an industry conference — paid gig!",
        impactType: "cash:3000,happiness:15,income_pct_temp:5",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "health" as const,
        weight: 5,
        titleTemplate: "Yoga Practice",
        bodyTemplate: "You developed a consistent yoga and stretching routine. Flexibility and focus improved.",
        impactType: "health:6,happiness:8",
        hasChoice: false,
        choiceAcceptOutcome: "",
        choiceDeclineOutcome: "",
      },
      {
        category: "opportunity" as const,
        weight: 3,
        minAge: 40,
        titleTemplate: "Retirement Fund Maxing",
        bodyTemplate: "Your financial advisor recommends maxing out retirement contributions. The tax advantage is huge.",
        impactType: "happiness:8",
        hasChoice: true,
        choiceAcceptOutcome: "Maxed your 401k contributions. Future you is thrilled.",
        choiceDeclineOutcome: "You couldn't swing the max this year.",
      },

      // ═══════════════════════════════════════
      // ADDITIONAL EVENTS (batch 2, reaching 100+)
      // ═══════════════════════════════════════
      {
        category: "career" as const, weight: 4, minAge: 26,
        titleTemplate: "Remote Work Policy",
        bodyTemplate: "Your company goes fully remote. No commute means more time and less stress.",
        impactType: "happiness:10,expense:-200",
        hasChoice: false, choiceAcceptOutcome: "", choiceDeclineOutcome: "",
      },
      {
        category: "career" as const, weight: 3, minAge: 30,
        titleTemplate: "Career Pivot",
        bodyTemplate: "After years in the same field, you feel completely hollow. A career pivot could mean starting over.",
        impactType: "happiness:20",
        hasChoice: true,
        choiceAcceptOutcome: "You made the leap! New industry, lower starting salary, but the passion is back.",
        choiceDeclineOutcome: "You stayed. The golden handcuffs stay locked.",
      },
      {
        category: "health" as const, weight: 5, minAge: 25,
        titleTemplate: "Clean Annual Physical",
        bodyTemplate: "Your annual checkup comes back spotless. The doctor gives you a thumbs up.",
        impactType: "health:5,happiness:5",
        hasChoice: false, choiceAcceptOutcome: "", choiceDeclineOutcome: "",
      },
      {
        category: "health" as const, weight: 4, minAge: 45,
        titleTemplate: "Vision Deterioration",
        bodyTemplate: "Your eyesight is declining. Glasses needed — adds to monthly costs.",
        impactType: "health:-3,expense:80,happiness:-3",
        hasChoice: false, choiceAcceptOutcome: "", choiceDeclineOutcome: "",
      },
      {
        category: "market" as const, weight: 4,
        titleTemplate: "Dividend Payout",
        bodyTemplate: "Your stock portfolio pays out a solid dividend this quarter. Passive income is real!",
        impactType: "cash:2000,happiness:8",
        hasChoice: false, choiceAcceptOutcome: "", choiceDeclineOutcome: "",
      },
      {
        category: "family" as const, weight: 5, minAge: 22,
        titleTemplate: "New Romantic Interest",
        bodyTemplate: "You meet someone special who completely changes your social world.",
        impactType: "happiness:15,expense:200",
        hasChoice: true,
        choiceAcceptOutcome: "You pursued it! The relationship blossoms and happiness surges.",
        choiceDeclineOutcome: "You're focused on career. The timing wasn't right.",
      },
      {
        category: "wildcard" as const, weight: 4,
        titleTemplate: "Emergency Vet Bills",
        bodyTemplate: "Your beloved pet needs emergency veterinary care. The bill is real.",
        impactType: "cash:-2500,happiness:-5",
        hasChoice: false, choiceAcceptOutcome: "", choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const, weight: 4,
        titleTemplate: "Last-Minute Trip",
        bodyTemplate: "A friend invites you on an amazing trip at the last minute. Flights are cheap, time is now.",
        impactType: "cash:-2000,happiness:25,health:5",
        hasChoice: true,
        choiceAcceptOutcome: "You went! Best trip of your life. No regrets.",
        choiceDeclineOutcome: "Too expensive. You watch the Instagram stories with mild envy.",
      },
      {
        category: "opportunity" as const, weight: 4, minAge: 28,
        titleTemplate: "Executive MBA Sponsored",
        bodyTemplate: "Your employer is offering to sponsor an Executive MBA program.",
        impactType: "income_pct:25,happiness:10",
        hasChoice: true,
        choiceAcceptOutcome: "Enrolled! Two intense years, but career trajectory skyrockets.",
        choiceDeclineOutcome: "Too time-consuming right now. Family takes priority.",
      },
      {
        category: "career" as const, weight: 5, minAge: 22,
        titleTemplate: "LinkedIn Post Goes Viral",
        bodyTemplate: "A post about your professional journey goes viral. Recruiters are flooding your inbox.",
        impactType: "income_pct:15,happiness:12",
        hasChoice: false, choiceAcceptOutcome: "", choiceDeclineOutcome: "",
      },
      {
        category: "health" as const, weight: 4, minAge: 30,
        titleTemplate: "WFH Weight Gain",
        bodyTemplate: "Remote work has meant more snacking, less walking. Health is trending down.",
        impactType: "health:-8,happiness:-5",
        hasChoice: true,
        choiceAcceptOutcome: "You bought a standing desk and walk daily. Health stabilizes.",
        choiceDeclineOutcome: "You'll fix it eventually. The decline continues slowly.",
      },
      {
        category: "market" as const, weight: 3,
        titleTemplate: "Meme Stock Squeeze",
        bodyTemplate: "A stock you own becomes the target of a massive short squeeze!",
        impactType: "investment_pct:40,happiness:15",
        hasChoice: true,
        choiceAcceptOutcome: "You sold at the peak! Locked in massive gains.",
        choiceDeclineOutcome: "You held too long. The squeeze reversed and wiped the gains.",
      },
      {
        category: "family" as const, weight: 4, minAge: 55,
        titleTemplate: "Grandchildren Arrive",
        bodyTemplate: "Your child has their first baby. Being a grandparent is unexpectedly joyful.",
        impactType: "happiness:20",
        hasChoice: false, choiceAcceptOutcome: "", choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const, weight: 3,
        titleTemplate: "Workplace Injury",
        bodyTemplate: "An accident at work puts you on disability leave for several weeks.",
        impactType: "health:-15,cash:-3000,happiness:-15",
        hasChoice: false, choiceAcceptOutcome: "", choiceDeclineOutcome: "",
      },
      {
        category: "opportunity" as const, weight: 4, minAge: 35,
        titleTemplate: "Digital Product Revenue",
        bodyTemplate: "A course, template, or app you built now generates consistent passive income.",
        impactType: "income_pct_temp:20,happiness:20",
        hasChoice: false, choiceAcceptOutcome: "", choiceDeclineOutcome: "",
      },
      {
        category: "career" as const, weight: 4, minAge: 32,
        titleTemplate: "First Management Role",
        bodyTemplate: "You're asked to lead a team of 5. More responsibility, more pay.",
        impactType: "income_pct:20,happiness:8,health:-3",
        hasChoice: true,
        choiceAcceptOutcome: "You said yes! Leading people is challenging but rewarding.",
        choiceDeclineOutcome: "You prefer individual contributor work. Honest self-knowledge.",
      },
      {
        category: "health" as const, weight: 5, minAge: 18,
        titleTemplate: "Strong Social Network",
        bodyTemplate: "A rich social life boosts your mood dramatically. Community matters.",
        impactType: "happiness:18",
        hasChoice: false, choiceAcceptOutcome: "", choiceDeclineOutcome: "",
      },
      {
        category: "market" as const, weight: 4,
        titleTemplate: "Economic Boom",
        bodyTemplate: "The economy is firing on all cylinders. Employment is high, wages are rising.",
        impactType: "investment_pct:15,income_pct:8,happiness:8",
        hasChoice: false, choiceAcceptOutcome: "", choiceDeclineOutcome: "",
      },
      {
        category: "wildcard" as const, weight: 4,
        titleTemplate: "Surprise Cash Gift",
        bodyTemplate: "A generous family member surprises you with a cash gift.",
        impactType: "cash:5000,happiness:15",
        hasChoice: false, choiceAcceptOutcome: "", choiceDeclineOutcome: "",
      },
      {
        category: "family" as const, weight: 4, minAge: 35, maxAge: 55,
        titleTemplate: "Mid-Life Restlessness",
        bodyTemplate: "You feel a deep restlessness. The life you built feels misaligned with who you want to be.",
        impactType: "happiness:-15",
        hasChoice: true,
        choiceAcceptOutcome: "You made meaningful changes — new hobby, new goals. Happiness recovers.",
        choiceDeclineOutcome: "You buried it in work. The feeling lingers.",
      },
      {
        category: "opportunity" as const, weight: 3, minAge: 40,
        titleTemplate: "Rental Property Cash Flow",
        bodyTemplate: "Your rental property is now cash-flow positive after years of building equity!",
        impactType: "income_pct_temp:25,happiness:20",
        hasChoice: false, choiceAcceptOutcome: "", choiceDeclineOutcome: "",
      },
    ];

    let count = 0;
    for (const template of templates) {
      await ctx.db.insert("eventTemplates", template);
      count++;
    }

    return { status: "seeded", count };
  },
});
