import { mutation } from "./_generated/server";

// ═══════════════════════════════════════════════════
// SEED ALL
// ═══════════════════════════════════════════════════
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const results: Record<string, number> = {};

    // ── Careers ─────────────────────────────────────
    const existingCareer = await ctx.db.query("careers").first();
    if (!existingCareer) {
      const careers = [
        { title: "Software Engineer",      requiredDegree: "bachelor", industry: "Technology",      startingSalary: 6500,  median10yrSalary: 10000, top10pctSalary: 18000, jobSecurityRating: 8,  progressionPath: ["Junior Dev", "Mid Dev", "Senior Dev", "Staff Eng", "Principal Eng"] },
        { title: "Registered Nurse",       requiredDegree: "associate", industry: "Healthcare",     startingSalary: 5500,  median10yrSalary: 7500,  top10pctSalary: 10500, jobSecurityRating: 9,  progressionPath: ["Staff RN", "Charge Nurse", "Nurse Manager", "Director of Nursing"] },
        { title: "Accountant",             requiredDegree: "bachelor", industry: "Finance",          startingSalary: 4500,  median10yrSalary: 6500,  top10pctSalary: 10000, jobSecurityRating: 8,  progressionPath: ["Junior Accountant", "Senior Accountant", "CPA", "Controller", "CFO"] },
        { title: "Teacher (K-12)",         requiredDegree: "bachelor", industry: "Education",        startingSalary: 3500,  median10yrSalary: 4800,  top10pctSalary: 7000,  jobSecurityRating: 9,  progressionPath: ["Teacher", "Dept Head", "VP", "Principal", "Superintendent"] },
        { title: "Electrician",            requiredDegree: "trade",    industry: "Trades",           startingSalary: 4000,  median10yrSalary: 6000,  top10pctSalary: 9500,  jobSecurityRating: 9,  progressionPath: ["Apprentice", "Journeyman", "Master Electrician", "Electrical Contractor"] },
        { title: "Plumber",               requiredDegree: "trade",    industry: "Trades",           startingSalary: 3800,  median10yrSalary: 5800,  top10pctSalary: 9000,  jobSecurityRating: 9,  progressionPath: ["Apprentice", "Journeyman", "Master Plumber", "Plumbing Contractor"] },
        { title: "Lawyer",                requiredDegree: "jd",       industry: "Legal",            startingSalary: 7000,  median10yrSalary: 12000, top10pctSalary: 25000, jobSecurityRating: 7,  progressionPath: ["Associate", "Senior Associate", "Partner", "Managing Partner"] },
        { title: "Physician (MD)",        requiredDegree: "md",       industry: "Healthcare",        startingSalary: 12000, median10yrSalary: 18000, top10pctSalary: 30000, jobSecurityRating: 9,  progressionPath: ["Resident", "Attending Physician", "Specialist", "Department Chief"] },
        { title: "Dentist",               requiredDegree: "md",       industry: "Healthcare",        startingSalary: 10000, median10yrSalary: 16000, top10pctSalary: 25000, jobSecurityRating: 9,  progressionPath: ["Associate Dentist", "Dental Practice Owner"] },
        { title: "Pharmacist",            requiredDegree: "phd",      industry: "Healthcare",        startingSalary: 8500,  median10yrSalary: 11000, top10pctSalary: 14000, jobSecurityRating: 8,  progressionPath: ["Staff Pharmacist", "Clinical Pharmacist", "Pharmacy Director"] },
        { title: "Marketing Manager",     requiredDegree: "bachelor", industry: "Marketing",         startingSalary: 5000,  median10yrSalary: 8000,  top10pctSalary: 14000, jobSecurityRating: 6,  progressionPath: ["Marketing Coordinator", "Marketing Manager", "Marketing Director", "CMO"] },
        { title: "Financial Analyst",     requiredDegree: "bachelor", industry: "Finance",           startingSalary: 5500,  median10yrSalary: 8500,  top10pctSalary: 16000, jobSecurityRating: 7,  progressionPath: ["Analyst", "Senior Analyst", "Portfolio Manager", "VP Finance", "CFO"] },
        { title: "Graphic Designer",      requiredDegree: "associate", industry: "Design",           startingSalary: 3500,  median10yrSalary: 5500,  top10pctSalary: 9000,  jobSecurityRating: 6,  progressionPath: ["Junior Designer", "Designer", "Senior Designer", "Art Director", "Creative Dir"] },
        { title: "Data Scientist",        requiredDegree: "master",   industry: "Technology",        startingSalary: 7500,  median10yrSalary: 12000, top10pctSalary: 20000, jobSecurityRating: 8,  progressionPath: ["Data Analyst", "Data Scientist", "Senior Data Scientist", "ML Engineer", "Head of AI"] },
        { title: "Project Manager",       requiredDegree: "bachelor", industry: "Management",        startingSalary: 6000,  median10yrSalary: 9000,  top10pctSalary: 14000, jobSecurityRating: 7,  progressionPath: ["Junior PM", "Project Manager", "Senior PM", "Program Manager", "VP Operations"] },
        { title: "Sales Representative",  requiredDegree: "none",     industry: "Sales",             startingSalary: 4000,  median10yrSalary: 7000,  top10pctSalary: 15000, jobSecurityRating: 5,  progressionPath: ["Sales Rep", "Account Exec", "Senior AE", "Sales Manager", "VP Sales"] },
        { title: "HR Manager",            requiredDegree: "bachelor", industry: "Human Resources",   startingSalary: 4500,  median10yrSalary: 7000,  top10pctSalary: 11000, jobSecurityRating: 7,  progressionPath: ["HR Coordinator", "HR Generalist", "HR Manager", "HR Director", "CHRO"] },
        { title: "Civil Engineer",        requiredDegree: "bachelor", industry: "Engineering",       startingSalary: 5500,  median10yrSalary: 8000,  top10pctSalary: 13000, jobSecurityRating: 8,  progressionPath: ["EIT", "PE", "Senior Engineer", "Project Engineer", "Chief Engineer"] },
        { title: "UX Designer",           requiredDegree: "bachelor", industry: "Design",            startingSalary: 5500,  median10yrSalary: 9000,  top10pctSalary: 15000, jobSecurityRating: 7,  progressionPath: ["UX Researcher", "UX Designer", "Senior UX", "Lead Designer", "Design Director"] },
        { title: "Physical Therapist",    requiredDegree: "master",   industry: "Healthcare",        startingSalary: 6000,  median10yrSalary: 8000,  top10pctSalary: 11000, jobSecurityRating: 9,  progressionPath: ["Staff PT", "Senior PT", "PT Specialist", "PT Director"] },
        { title: "Dental Hygienist",      requiredDegree: "associate", industry: "Healthcare",       startingSalary: 5000,  median10yrSalary: 6500,  top10pctSalary: 9000,  jobSecurityRating: 9,  progressionPath: ["Dental Hygienist", "Lead Hygienist"] },
        { title: "Real Estate Agent",     requiredDegree: "none",     industry: "Real Estate",       startingSalary: 2500,  median10yrSalary: 6000,  top10pctSalary: 16000, jobSecurityRating: 4,  progressionPath: ["Agent", "Senior Agent", "Team Lead", "Broker", "Real Estate Investor"] },
        { title: "Insurance Agent",       requiredDegree: "none",     industry: "Insurance",         startingSalary: 3500,  median10yrSalary: 5500,  top10pctSalary: 10000, jobSecurityRating: 7,  progressionPath: ["Agent", "Senior Agent", "Agency Owner"] },
        { title: "Social Worker",         requiredDegree: "bachelor", industry: "Social Services",   startingSalary: 3200,  median10yrSalary: 4500,  top10pctSalary: 6500,  jobSecurityRating: 8,  progressionPath: ["Case Worker", "Social Worker", "Senior SW", "Program Director"] },
        { title: "Journalist",            requiredDegree: "bachelor", industry: "Media",             startingSalary: 3000,  median10yrSalary: 4500,  top10pctSalary: 8000,  jobSecurityRating: 4,  progressionPath: ["Reporter", "Staff Writer", "Senior Reporter", "Editor", "Editor-in-Chief"] },
        { title: "Chef",                  requiredDegree: "none",     industry: "Food Service",      startingSalary: 3000,  median10yrSalary: 5000,  top10pctSalary: 9000,  jobSecurityRating: 6,  progressionPath: ["Line Cook", "Sous Chef", "Head Chef", "Executive Chef", "Restaurant Owner"] },
        { title: "Firefighter",           requiredDegree: "none",     industry: "Public Safety",     startingSalary: 4500,  median10yrSalary: 6000,  top10pctSalary: 8500,  jobSecurityRating: 9,  progressionPath: ["Firefighter", "Engineer", "Captain", "Battalion Chief", "Fire Chief"] },
        { title: "Police Officer",        requiredDegree: "none",     industry: "Public Safety",     startingSalary: 4200,  median10yrSalary: 5800,  top10pctSalary: 8000,  jobSecurityRating: 8,  progressionPath: ["Officer", "Detective", "Sergeant", "Lieutenant", "Captain"] },
        { title: "Truck Driver",          requiredDegree: "none",     industry: "Transportation",    startingSalary: 4000,  median10yrSalary: 5500,  top10pctSalary: 7500,  jobSecurityRating: 8,  progressionPath: ["CDL Driver", "Owner-Operator", "Fleet Owner"] },
        { title: "Cosmetologist",         requiredDegree: "trade",    industry: "Beauty",            startingSalary: 2500,  median10yrSalary: 4000,  top10pctSalary: 7000,  jobSecurityRating: 6,  progressionPath: ["Stylist", "Senior Stylist", "Salon Manager", "Salon Owner"] },
      ];
      for (const c of careers) await ctx.db.insert("careers", c);
      results.careers = careers.length;
    } else {
      results.careers = 0;
    }

    // ── Business Types ────────────────────────────────
    const existingBiz = await ctx.db.query("businessTypes").first();
    if (!existingBiz) {
      const businessTypes = [
        {
          name: "SaaS App", category: "Tech", scaleRating: 10, overhead: "low",
          marketingDependency: 7, startupCostMin: 5000, startupCostMax: 30000,
          description: "Build and sell software subscriptions. High ceiling, slow start.",
          degreeBonuses: { bachelor: 20, master: 15, phd: 10 },
        },
        {
          name: "Newsletter", category: "Media", scaleRating: 6, overhead: "low",
          marketingDependency: 9, startupCostMin: 100, startupCostMax: 1000,
          description: "Grow an email list and monetize via ads/sponsorships. Pure content play.",
          degreeBonuses: { bachelor: 5 },
        },
        {
          name: "YouTube Channel", category: "Media", scaleRating: 8, overhead: "low",
          marketingDependency: 8, startupCostMin: 500, startupCostMax: 5000,
          description: "Video content creation. Ad revenue + sponsorships. Takes 12-18 months.",
          degreeBonuses: {},
        },
        {
          name: "Online Course", category: "Media", scaleRating: 7, overhead: "low",
          marketingDependency: 8, startupCostMin: 500, startupCostMax: 5000,
          description: "Package expertise into sellable digital courses. Great margins.",
          degreeBonuses: { bachelor: 10, master: 15 },
        },
        {
          name: "Dropshipping Store", category: "E-commerce", scaleRating: 5, overhead: "medium",
          marketingDependency: 10, startupCostMin: 1000, startupCostMax: 8000,
          description: "Sell products without holding inventory. High competition, marketing-intensive.",
          degreeBonuses: {},
        },
        {
          name: "Amazon FBA", category: "E-commerce", scaleRating: 7, overhead: "medium",
          marketingDependency: 7, startupCostMin: 3000, startupCostMax: 20000,
          description: "Source products and sell via Amazon fulfillment. Good margins if done right.",
          degreeBonuses: {},
        },
        {
          name: "Marketing Agency", category: "Services", scaleRating: 7, overhead: "medium",
          marketingDependency: 6, startupCostMin: 2000, startupCostMax: 15000,
          description: "Manage advertising and growth for other businesses. Easy to start, hard to scale.",
          degreeBonuses: { bachelor: 15 },
        },
        {
          name: "Design Agency", category: "Services", scaleRating: 6, overhead: "low",
          marketingDependency: 6, startupCostMin: 1000, startupCostMax: 8000,
          description: "Branding, web, and visual design for businesses. Portfolio matters most.",
          degreeBonuses: { bachelor: 10, associate: 10 },
        },
        {
          name: "Bookkeeping Service", category: "Finance", scaleRating: 5, overhead: "low",
          marketingDependency: 4, startupCostMin: 500, startupCostMax: 3000,
          description: "Manage books for small businesses. Steady demand, low overhead.",
          degreeBonuses: { bachelor: 20, associate: 15 },
        },
        {
          name: "Freelance Writing", category: "Media", scaleRating: 4, overhead: "low",
          marketingDependency: 5, startupCostMin: 100, startupCostMax: 1000,
          description: "Write for publications, businesses, and agencies. Quick to start.",
          degreeBonuses: { bachelor: 10 },
        },
        {
          name: "Social Media Management", category: "Services", scaleRating: 5, overhead: "low",
          marketingDependency: 7, startupCostMin: 500, startupCostMax: 3000,
          description: "Run social media for businesses. High demand, moderate pay.",
          degreeBonuses: { bachelor: 5 },
        },
        {
          name: "Electrician Business", category: "Trades", scaleRating: 7, overhead: "high",
          marketingDependency: 4, startupCostMin: 10000, startupCostMax: 40000,
          description: "Licensed electrical contracting. Strong demand, steady cash flow.",
          degreeBonuses: { trade: 30 },
        },
        {
          name: "Plumbing Business", category: "Trades", scaleRating: 7, overhead: "high",
          marketingDependency: 3, startupCostMin: 8000, startupCostMax: 35000,
          description: "Residential and commercial plumbing contracting. Recession-resistant.",
          degreeBonuses: { trade: 30 },
        },
        {
          name: "Restaurant", category: "Food & Bev", scaleRating: 5, overhead: "high",
          marketingDependency: 6, startupCostMin: 40000, startupCostMax: 150000,
          description: "High risk, high reward. Passion project that can become a local institution.",
          degreeBonuses: {},
        },
        {
          name: "Cleaning Service", category: "Services", scaleRating: 6, overhead: "medium",
          marketingDependency: 5, startupCostMin: 2000, startupCostMax: 10000,
          description: "Residential and commercial cleaning. Easy to start, scales with crews.",
          degreeBonuses: {},
        },
        {
          name: "Landscaping Business", category: "Trades", scaleRating: 6, overhead: "high",
          marketingDependency: 4, startupCostMin: 5000, startupCostMax: 25000,
          description: "Mowing, landscaping, and outdoor work. Seasonal but scalable.",
          degreeBonuses: {},
        },
        {
          name: "Personal Training", category: "Health & Fitness", scaleRating: 4, overhead: "low",
          marketingDependency: 6, startupCostMin: 500, startupCostMax: 5000,
          description: "One-on-one or group fitness coaching. Certifications help.",
          degreeBonuses: {},
        },
        {
          name: "Real Estate Investing", category: "Real Estate", scaleRating: 9, overhead: "medium",
          marketingDependency: 3, startupCostMin: 20000, startupCostMax: 80000,
          description: "Buy, rent, or flip properties. Requires capital but builds lasting wealth.",
          degreeBonuses: { bachelor: 10, master: 15 },
        },
        {
          name: "Property Management", category: "Real Estate", scaleRating: 7, overhead: "medium",
          marketingDependency: 4, startupCostMin: 5000, startupCostMax: 20000,
          description: "Manage rentals for other investors. Steady fee income as portfolio grows.",
          degreeBonuses: { bachelor: 5 },
        },
        {
          name: "Franchise", category: "Franchise", scaleRating: 7, overhead: "high",
          marketingDependency: 3, startupCostMin: 50000, startupCostMax: 200000,
          description: "Buy into a proven system. Lower risk, high upfront cost, moderate ceiling.",
          degreeBonuses: { bachelor: 5, master: 10 },
        },
      ];
      for (const b of businessTypes) await ctx.db.insert("businessTypes", b);
      results.businessTypes = businessTypes.length;
    } else {
      results.businessTypes = 0;
    }

    // ── Colleges ─────────────────────────────────────
    const existingCollege = await ctx.db.query("colleges").first();
    if (!existingCollege) {
      const colleges = [
        // Ivy / Elite
        { name: "Harvard University",           state: "MA", type: "ivy",       avgAnnualCost: 58000, acceptanceRate: 4  },
        { name: "MIT",                          state: "MA", type: "ivy",       avgAnnualCost: 56000, acceptanceRate: 5  },
        { name: "Stanford University",          state: "CA", type: "ivy",       avgAnnualCost: 57000, acceptanceRate: 4  },
        { name: "Yale University",              state: "CT", type: "ivy",       avgAnnualCost: 59000, acceptanceRate: 6  },
        { name: "Princeton University",         state: "NJ", type: "ivy",       avgAnnualCost: 55000, acceptanceRate: 5  },
        // Top Private
        { name: "University of Chicago",        state: "IL", type: "private",   avgAnnualCost: 62000, acceptanceRate: 7  },
        { name: "Northwestern University",      state: "IL", type: "private",   avgAnnualCost: 60000, acceptanceRate: 8  },
        { name: "Duke University",              state: "NC", type: "private",   avgAnnualCost: 58000, acceptanceRate: 9  },
        { name: "Vanderbilt University",        state: "TN", type: "private",   avgAnnualCost: 56000, acceptanceRate: 12 },
        { name: "Georgetown University",        state: "DC", type: "private",   avgAnnualCost: 59000, acceptanceRate: 14 },
        // Flagship State
        { name: "University of Michigan",       state: "MI", type: "state",     avgAnnualCost: 30000, acceptanceRate: 20 },
        { name: "UCLA",                         state: "CA", type: "state",     avgAnnualCost: 28000, acceptanceRate: 12 },
        { name: "University of Texas Austin",   state: "TX", type: "state",     avgAnnualCost: 22000, acceptanceRate: 31 },
        { name: "University of Florida",        state: "FL", type: "state",     avgAnnualCost: 18000, acceptanceRate: 31 },
        { name: "Ohio State University",        state: "OH", type: "state",     avgAnnualCost: 24000, acceptanceRate: 68 },
        { name: "University of Illinois UC",    state: "IL", type: "state",     avgAnnualCost: 26000, acceptanceRate: 60 },
        { name: "Arizona State University",     state: "AZ", type: "state",     avgAnnualCost: 18000, acceptanceRate: 88 },
        { name: "University of Georgia",        state: "GA", type: "state",     avgAnnualCost: 20000, acceptanceRate: 47 },
        { name: "Purdue University",            state: "IN", type: "state",     avgAnnualCost: 22000, acceptanceRate: 67 },
        { name: "Penn State University",        state: "PA", type: "state",     avgAnnualCost: 23000, acceptanceRate: 56 },
        // Community Colleges
        { name: "Santa Monica College",         state: "CA", type: "community", avgAnnualCost: 4500,  acceptanceRate: 100 },
        { name: "Maricopa Community College",   state: "AZ", type: "community", avgAnnualCost: 3500,  acceptanceRate: 100 },
        { name: "Houston Community College",    state: "TX", type: "community", avgAnnualCost: 4000,  acceptanceRate: 100 },
        { name: "Broward College",              state: "FL", type: "community", avgAnnualCost: 4200,  acceptanceRate: 100 },
        { name: "Northern Virginia CC",         state: "VA", type: "community", avgAnnualCost: 4800,  acceptanceRate: 100 },
      ];
      for (const c of colleges) await ctx.db.insert("colleges", c);
      results.colleges = colleges.length;
    } else {
      results.colleges = 0;
    }

    return { status: "seeded", results };
  },
});
