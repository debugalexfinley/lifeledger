/**
 * Financial Pursuits Game Universe
 * All real-world companies, platforms, and marketplaces are renamed
 * to fictional equivalents that are recognizable but uniquely ours.
 */

// ─── PLATFORMS & MARKETPLACES ───────────────────────────────────────────────

export const PLATFORMS = {
  // Search & Social Advertising
  GOOBLE:        { name: "Gooble",        realWorld: "Google",    type: "search",    icon: "🔍" },
  FACESPACE:     { name: "Facespace",     realWorld: "Facebook",  type: "social",    icon: "👥" },
  INSTAPIC:      { name: "Instapic",      realWorld: "Instagram", type: "social",    icon: "📸" },
  TOKTOK:        { name: "TokTok",        realWorld: "TikTok",    type: "social",    icon: "🎵" },
  VIEWTUBE:      { name: "ViewTube",      realWorld: "YouTube",   type: "video",     icon: "▶️" },
  PROLINK:       { name: "ProLink",       realWorld: "LinkedIn",  type: "social",    icon: "💼" },
  PINBOARD:      { name: "PinBoard",      realWorld: "Pinterest", type: "social",    icon: "📌" },
  THREADZ:       { name: "Threadz",       realWorld: "X/Twitter", type: "social",    icon: "🐦" },

  // Marketplaces
  AMAZOOM:       { name: "Amazoom",       realWorld: "Amazon",    type: "marketplace", icon: "📦" },
  EBID:          { name: "eBid",          realWorld: "eBay",      type: "marketplace", icon: "🏷️" },
  ARTZY:         { name: "Artzy",         realWorld: "Etsy",      type: "marketplace", icon: "🎨" },
  WALLMART:      { name: "WallMart",      realWorld: "Walmart",   type: "marketplace", icon: "🏪" },
  BULLSEYE:      { name: "BullsEye",      realWorld: "Target",    type: "marketplace", icon: "🎯" },
  SHOPEASY:      { name: "ShopEasy",      realWorld: "Shopify",   type: "platform",  icon: "🛒" },

  // Payments & Finance
  CASHBUDDY:     { name: "CashBuddy",     realWorld: "PayPal",    type: "payment",   icon: "💸" },
  PAYSTRIPE:     { name: "PayStripe",     realWorld: "Stripe",    type: "payment",   icon: "💳" },
  SQUARECASH:    { name: "SquareCash",    realWorld: "Square",    type: "payment",   icon: "⬛" },

  // Productivity & SaaS Tools
  MICROHARD:     { name: "Microhard",     realWorld: "Microsoft", type: "software",  icon: "💻" },
  PEAR_INC:      { name: "Pear Inc",      realWorld: "Apple",     type: "hardware",  icon: "🍐" },
  GOOBLEDRIVE:   { name: "GoobleVault",   realWorld: "Google Drive", type: "storage", icon: "☁️" },
  SLACKR:        { name: "Slackr",        realWorld: "Slack",     type: "comms",     icon: "💬" },
  ZOOMIN:        { name: "ZoomIn",        realWorld: "Zoom",      type: "video",     icon: "📹" },
  SALESCLOUD:    { name: "SalesCloud",    realWorld: "Salesforce",type: "crm",       icon: "☁️" },
  GROWTHSTACK:   { name: "GrowthStack",   realWorld: "HubSpot",   type: "crm",       icon: "📊" },
  MAILMONK:      { name: "MailMonk",      realWorld: "Mailchimp", type: "email",     icon: "🐒" },
  CANVAZ:        { name: "Canvaz",        realWorld: "Canva",     type: "design",    icon: "🎨" },
  WEBPRESS:      { name: "WebPress",      realWorld: "WordPress", type: "cms",       icon: "🌐" },
  SITELIFT:      { name: "SiteLift",      realWorld: "Squarespace", type: "cms",     icon: "🏗️" },

  // Gig & Freelance
  FREELINK:      { name: "FreelinkPro",   realWorld: "Upwork",    type: "freelance", icon: "🔗" },
  FIVERLINK:     { name: "FiverLink",     realWorld: "Fiverr",    type: "freelance", icon: "5️⃣" },
  TASKPAL:       { name: "TaskPal",       realWorld: "TaskRabbit",type: "gig",       icon: "🐇" },
  THUMBQUEST:    { name: "ThumbQuest",    realWorld: "Thumbtack", type: "gig",       icon: "👍" },

  // Delivery & Logistics
  DOORDINE:      { name: "DoorDine",      realWorld: "DoorDash",  type: "delivery",  icon: "🚪" },
  UBERGRUB:      { name: "UberGrub",      realWorld: "UberEats",  type: "delivery",  icon: "🍔" },
  GRUBDASH:      { name: "GrubDash",      realWorld: "GrubHub",   type: "delivery",  icon: "🏃" },
  RIDEPAL:       { name: "RidePal",       realWorld: "Uber",      type: "transport", icon: "🚗" },
  LYFFT:         { name: "Lyfft",         realWorld: "Lyft",      type: "transport", icon: "🚕" },

  // Hospitality
  NESTBNB:       { name: "NestBnb",       realWorld: "Airbnb",    type: "rental",    icon: "🏠" },
  VOYAGEBNB:     { name: "VoyageBnb",     realWorld: "VRBO",      type: "rental",    icon: "✈️" },

  // Streaming & Entertainment
  STREAMFLIX:    { name: "StreamFlix",    realWorld: "Netflix",   type: "streaming", icon: "🎬" },
  PRIMEVAULT:    { name: "PrimeVault",    realWorld: "Amazon Prime", type: "streaming", icon: "⭐" },
  SPOTIFM:       { name: "SpotiFM",       realWorld: "Spotify",   type: "music",     icon: "🎵" },
} as const;

// ─── AD CHANNELS (marketing spend allocation) ───────────────────────────────

export const AD_CHANNELS = [
  {
    id: "gooble_search",
    name: "Gooble Search Ads",
    platform: "Gooble",
    icon: "🔍",
    costPer: "CPC",
    avgCPC: 2.50,
    intent: "high",        // high purchase intent
    bestFor: ["ecom", "service", "saas"],
    description: "Show up when people search for what you sell. High intent, higher cost.",
  },
  {
    id: "facespace_ads",
    name: "Facespace Ads",
    platform: "Facespace",
    icon: "👥",
    costPer: "CPM",
    avgCPM: 12,
    intent: "medium",
    bestFor: ["ecom", "local_service", "saas"],
    description: "Reach a massive audience by demographics and interests.",
  },
  {
    id: "instapic_ads",
    name: "Instapic Ads",
    platform: "Instapic",
    icon: "📸",
    costPer: "CPM",
    avgCPM: 15,
    intent: "medium",
    bestFor: ["ecom", "beauty", "fashion", "food", "lifestyle"],
    description: "Visual-first ads. Great for products with strong aesthetic appeal.",
  },
  {
    id: "toktok_ads",
    name: "TokTok Ads",
    platform: "TokTok",
    icon: "🎵",
    costPer: "CPM",
    avgCPM: 9,
    intent: "low-medium",
    bestFor: ["ecom", "consumer", "youth_market"],
    description: "Viral potential is high. Lower CPM but lower purchase intent.",
  },
  {
    id: "viewtube_ads",
    name: "ViewTube Ads",
    platform: "ViewTube",
    icon: "▶️",
    costPer: "CPV",
    avgCPV: 0.05,
    intent: "medium",
    bestFor: ["saas", "ecom", "course", "brand_building"],
    description: "Video ads before content. Great for brand awareness and demos.",
  },
  {
    id: "prolink_ads",
    name: "ProLink Ads",
    platform: "ProLink",
    icon: "💼",
    costPer: "CPC",
    avgCPC: 8.50,
    intent: "high",
    bestFor: ["b2b", "saas", "agency", "service"],
    description: "Expensive but unmatched for B2B targeting. Best for selling to businesses.",
  },
  {
    id: "amazoom_ads",
    name: "Amazoom Sponsored",
    platform: "Amazoom",
    icon: "📦",
    costPer: "CPC",
    avgCPC: 1.80,
    intent: "very_high",
    bestFor: ["ecom", "physical_product"],
    description: "Ads on Amazoom listings. Shoppers are already in buying mode.",
  },
  {
    id: "seo_organic",
    name: "SEO / Organic Search",
    platform: "Gooble",
    icon: "🌱",
    costPer: "Time",
    avgCPC: 0,
    intent: "high",
    bestFor: ["saas", "content", "service", "ecom"],
    description: "Free traffic but slow to build. Compounds over time.",
  },
  {
    id: "email_marketing",
    name: "Email Marketing",
    platform: "MailMonk",
    icon: "📧",
    costPer: "Monthly",
    avgCPM: 2,
    intent: "very_high",
    bestFor: ["ecom", "saas", "newsletter", "course"],
    description: "Highest ROI channel. Works best with an existing list.",
  },
  {
    id: "influencer",
    name: "Creator / Influencer Deals",
    platform: "TokTok / Instapic / ViewTube",
    icon: "🌟",
    costPer: "Flat Fee",
    avgCPC: 0,
    intent: "medium",
    bestFor: ["ecom", "consumer", "lifestyle", "beauty"],
    description: "Pay creators to feature your product. High variance — can go viral or flop.",
  },
  {
    id: "affiliate",
    name: "Affiliate Program",
    platform: "Own",
    icon: "🤝",
    costPer: "Revenue Share",
    avgCPC: 0,
    intent: "high",
    bestFor: ["saas", "ecom", "course", "newsletter"],
    description: "Pay only on conversions. Slow to build but extremely efficient at scale.",
  },
] as const;

// ─── E-COMMERCE NICHES ───────────────────────────────────────────────────────

export const ECOM_NICHES = {
  fitness: {
    name: "Fitness & Wellness",
    icon: "💪",
    competition: "high",
    avgMargin: 45,
    seasonality: "slight_q1_spike",
    products: [
      { id: "resistance_bands", name: "Resistance Bands Set", margin: 70, competition: "high", avgPrice: 29, issues: ["Quality breaks", "Sizing confusion", "Amazon dominance"] },
      { id: "yoga_mat", name: "Yoga Mat", margin: 55, competition: "very_high", avgPrice: 45, issues: ["Saturated market", "Material feel complaints", "Weight"] },
      { id: "protein_shaker", name: "Protein Shaker Bottle", margin: 60, competition: "high", avgPrice: 22, issues: ["Leakage complaints", "Cleaning difficulty"] },
      { id: "foam_roller", name: "Foam Roller", margin: 65, competition: "medium", avgPrice: 35, issues: ["Durability", "Size options"] },
      { id: "fitness_tracker", name: "Fitness Tracker Band", margin: 40, competition: "very_high", avgPrice: 49, issues: ["Tech support", "Accuracy claims", "Battery life"] },
      { id: "gym_bag", name: "Gym Duffle Bag", margin: 55, competition: "medium", avgPrice: 55, issues: ["Material quality", "Strap durability"] },
    ],
  },
  beauty: {
    name: "Beauty & Skincare",
    icon: "✨",
    competition: "very_high",
    avgMargin: 65,
    seasonality: "holiday_spike",
    products: [
      { id: "face_serum", name: "Vitamin C Face Serum", margin: 80, competition: "very_high", avgPrice: 35, issues: ["Oxidation shelf life", "Skin reaction claims", "Ingredient legitimacy"] },
      { id: "lip_gloss", name: "Hydrating Lip Gloss Set", margin: 75, competition: "high", avgPrice: 18, issues: ["Shade accuracy in photos", "Taste/smell complaints"] },
      { id: "jade_roller", name: "Jade Roller & Gua Sha Set", margin: 70, competition: "high", avgPrice: 25, issues: ["Authenticity claims", "Material quality"] },
      { id: "lash_serum", name: "Lash Growth Serum", margin: 82, competition: "medium", avgPrice: 42, issues: ["Efficacy claims", "Regulatory issues in some states"] },
      { id: "sunscreen", name: "Mineral Sunscreen SPF 50", margin: 68, competition: "high", avgPrice: 28, issues: ["White cast complaints", "Stability in heat"] },
    ],
  },
  pet_supplies: {
    name: "Pet Supplies",
    icon: "🐾",
    competition: "medium",
    avgMargin: 50,
    seasonality: "stable",
    products: [
      { id: "dog_harness", name: "No-Pull Dog Harness", margin: 65, competition: "medium", avgPrice: 38, issues: ["Sizing inconsistency", "Escape artist dogs", "Durability"] },
      { id: "cat_tree", name: "Cat Tree Tower", margin: 45, competition: "medium", avgPrice: 89, issues: ["Assembly difficulty", "Wobble/stability", "Shipping damage"] },
      { id: "slow_feeder", name: "Slow Feeder Dog Bowl", margin: 70, competition: "low", avgPrice: 22, issues: ["Material safety questions", "Size compatibility"] },
      { id: "pet_camera", name: "Pet Monitoring Camera", margin: 40, competition: "medium", avgPrice: 65, issues: ["App connectivity", "WiFi setup difficulty", "Battery life"] },
      { id: "dog_treats", name: "Grain-Free Dog Treats", margin: 55, competition: "high", avgPrice: 24, issues: ["Ingredient sourcing", "FDA scrutiny", "Shelf life"] },
    ],
  },
  home_decor: {
    name: "Home & Garden Decor",
    icon: "🏡",
    competition: "medium",
    avgMargin: 55,
    seasonality: "spring_and_holiday",
    products: [
      { id: "candles", name: "Scented Soy Candles Set", margin: 75, competition: "high", avgPrice: 32, issues: ["Scent throw complaints", "Wick issues", "Wax tunneling"] },
      { id: "macrame", name: "Macrame Wall Hanging", margin: 68, competition: "medium", avgPrice: 45, issues: ["Artzy competition", "Handmade perception", "Shipping damage"] },
      { id: "plant_pots", name: "Minimalist Plant Pot Set", margin: 60, competition: "medium", avgPrice: 38, issues: ["Breakage in shipping", "Drainage hole confusion"] },
      { id: "throw_pillow", name: "Boho Throw Pillow Cover", margin: 70, competition: "high", avgPrice: 25, issues: ["Color accuracy", "Zipper quality", "Insert not included"] },
      { id: "fairy_lights", name: "LED Fairy Lights (100ft)", margin: 65, competition: "high", avgPrice: 19, issues: ["Bulb failures", "Battery drain", "Amazoom undercutting"] },
    ],
  },
  tech_gadgets: {
    name: "Tech Gadgets & Accessories",
    icon: "🔌",
    competition: "very_high",
    avgMargin: 40,
    seasonality: "q4_spike",
    products: [
      { id: "wireless_charger", name: "15W Wireless Charging Pad", margin: 55, competition: "very_high", avgPrice: 29, issues: ["Compatibility issues", "Overheating claims", "Amazoom clones"] },
      { id: "cable_organizer", name: "Magnetic Cable Organizer", margin: 70, competition: "medium", avgPrice: 16, issues: ["Magnet strength", "Cable type fit"] },
      { id: "laptop_stand", name: "Adjustable Laptop Stand", margin: 50, competition: "high", avgPrice: 45, issues: ["Wobble at angles", "Weight capacity", "Scratching"] },
      { id: "webcam_cover", name: "Privacy Webcam Cover 3-Pack", margin: 78, competition: "low", avgPrice: 12, issues: ["Adhesive residue", "Too thin/thick complaints"] },
      { id: "usb_hub", name: "7-Port USB-C Hub", margin: 45, competition: "very_high", avgPrice: 38, issues: ["Heat output", "Compatibility", "Port failures"] },
    ],
  },
  outdoor: {
    name: "Outdoor & Camping",
    icon: "⛺",
    competition: "medium",
    avgMargin: 48,
    seasonality: "spring_summer_spike",
    products: [
      { id: "hammock", name: "Portable Camping Hammock", margin: 65, competition: "medium", avgPrice: 42, issues: ["Weight capacity claims", "Tree strap length", "Setup difficulty"] },
      { id: "water_filter", name: "Portable Water Filter Straw", margin: 60, competition: "medium", avgPrice: 28, issues: ["Filtration efficacy claims", "Backflow issues", "Lifespan"] },
      { id: "headlamp", name: "Rechargeable LED Headlamp", margin: 55, competition: "medium", avgPrice: 35, issues: ["Battery life claims", "Beam distance", "Water resistance"] },
      { id: "camp_chair", name: "Ultralight Folding Camp Chair", margin: 50, competition: "medium", avgPrice: 65, issues: ["Weight limit", "Assembly", "Shipping damage"] },
      { id: "solar_charger", name: "Solar Panel Charger 25000mAh", margin: 45, competition: "medium", avgPrice: 55, issues: ["Solar efficiency claims", "Charging speed", "Durability"] },
    ],
  },
  baby: {
    name: "Baby & Kids",
    icon: "👶",
    competition: "medium",
    avgMargin: 52,
    seasonality: "stable",
    products: [
      { id: "baby_monitor", name: "Video Baby Monitor", margin: 45, competition: "medium", avgPrice: 89, issues: ["WiFi range", "App stability", "Night vision quality"] },
      { id: "teether", name: "Silicone Teether Toy Set", margin: 72, competition: "medium", avgPrice: 18, issues: ["BPA-free certification questions", "Small parts risk"] },
      { id: "diaper_bag", name: "Convertible Diaper Backpack", margin: 58, competition: "medium", avgPrice: 65, issues: ["Zipper durability", "Waterproofing", "Compartment organization"] },
      { id: "white_noise", name: "Portable White Noise Machine", margin: 55, competition: "medium", avgPrice: 35, issues: ["Volume level safety", "Battery life", "Sound variety"] },
      { id: "stroller_organizer", name: "Universal Stroller Organizer", margin: 68, competition: "low", avgPrice: 28, issues: ["Compatibility with different strollers", "Cup holder fit"] },
    ],
  },
  fashion: {
    name: "Fashion & Accessories",
    icon: "👗",
    competition: "very_high",
    avgMargin: 60,
    seasonality: "seasonal",
    products: [
      { id: "tote_bag", name: "Canvas Tote Bag Set", margin: 72, competition: "high", avgPrice: 22, issues: ["Printing quality", "Handle durability", "Artzy competition"] },
      { id: "sunglasses", name: "Polarized Sunglasses", margin: 65, competition: "very_high", avgPrice: 35, issues: ["Lens quality", "Fit/sizing", "UV claim legitimacy"] },
      { id: "minimalist_watch", name: "Minimalist Mesh Watch", margin: 60, competition: "high", avgPrice: 55, issues: ["Battery replacement", "Band comfort", "Water resistance claims"] },
      { id: "scrunchies", name: "Silk Scrunchie Set (10-pack)", margin: 80, competition: "medium", avgPrice: 16, issues: ["Real vs fake silk", "Color accuracy", "Elastic durability"] },
      { id: "phone_crossbody", name: "Crossbody Phone Bag", margin: 65, competition: "medium", avgPrice: 32, issues: ["Phone size compatibility", "Strap length", "Zipper quality"] },
    ],
  },
} as const;

// ─── SERVICE BUSINESS NICHES ─────────────────────────────────────────────────

export const SERVICE_NICHES = {
  marketing_agency: {
    name: "Marketing Agency",
    icon: "📣",
    subServices: ["SEO", "Paid Ads (PPC)", "Social Media Management", "Email Marketing", "Content Creation", "Web Design", "Brand Strategy"],
    clientTypes: ["Small Business", "E-commerce Brand", "SaaS Company", "Local Business", "Enterprise"],
    billingModels: ["Monthly Retainer", "Project-Based", "Performance-Based", "Hourly"],
    competitiveFactors: ["Case studies & results", "Niche specialization", "Team credentials", "Tool stack", "Reporting quality"],
  },
  accounting_cpa: {
    name: "Accounting / CPA Firm",
    icon: "📊",
    subServices: ["Tax Preparation", "Bookkeeping", "Payroll Processing", "CFO Advisory", "Audit", "Business Formation", "Estate Planning"],
    clientTypes: ["Individuals", "Small Business Owners", "Freelancers", "Real Estate Investors", "Corporations"],
    billingModels: ["Monthly Retainer", "Annual Package", "Per-Return", "Hourly"],
    competitiveFactors: ["CPA credentials", "Industry specialization", "Software (QuickBooks/Xero)", "Response time", "Tax savings track record"],
  },
  law_firm: {
    name: "Law Firm",
    icon: "⚖️",
    subServices: ["Business Law", "Real Estate Law", "Estate Planning", "Employment Law", "IP/Patent", "Criminal Defense", "Personal Injury"],
    clientTypes: ["Individuals", "Small Businesses", "Startups", "Real Estate Investors", "Corporations"],
    billingModels: ["Hourly", "Retainer", "Contingency", "Flat Fee"],
    competitiveFactors: ["Bar credentials", "Win rate / track record", "Specialization", "Response time", "Reputation"],
  },
  it_consulting: {
    name: "IT / Tech Consulting",
    icon: "🖥️",
    subServices: ["Managed IT Services", "Cybersecurity", "Cloud Migration", "Software Development", "IT Support", "Network Setup"],
    clientTypes: ["Small Business", "Mid-Market", "Healthcare", "Finance", "Government"],
    billingModels: ["Managed Services (MSP)", "Project-Based", "Hourly", "Retainer"],
    competitiveFactors: ["Certifications", "Response time SLA", "Security track record", "Technology partnerships"],
  },
  real_estate_agency: {
    name: "Real Estate Agency",
    icon: "🏠",
    subServices: ["Buyer Representation", "Seller Representation", "Property Management", "Commercial Real Estate", "Investment Consulting"],
    clientTypes: ["Home Buyers", "Home Sellers", "Investors", "Commercial Clients", "Landlords"],
    billingModels: ["Commission (2.5-3%)", "Flat Fee", "Management % of Rent"],
    competitiveFactors: ["Market knowledge", "Negotiation record", "Days on market", "List-to-sale ratio", "Reviews"],
  },
  personal_training: {
    name: "Personal Training",
    icon: "💪",
    subServices: ["1-on-1 Training", "Group Classes", "Online Coaching", "Nutrition Plans", "Corporate Wellness", "Sports Performance"],
    clientTypes: ["General Fitness", "Weight Loss", "Athletes", "Seniors", "Corporate Clients"],
    billingModels: ["Per Session", "Monthly Package", "Online Subscription", "Corporate Contract"],
    competitiveFactors: ["Certifications (NASM/ACE)", "Specialization", "Client results", "Before/after portfolio", "Nutrition knowledge"],
  },
  cleaning_service: {
    name: "Cleaning Service",
    icon: "🧹",
    subServices: ["Residential Cleaning", "Commercial Cleaning", "Deep Cleaning", "Move-In/Out Cleaning", "Post-Construction", "Window Cleaning", "Carpet Cleaning"],
    clientTypes: ["Homeowners", "Renters", "Offices", "Airbnb Hosts", "Property Managers"],
    billingModels: ["Per Visit (flat)", "Monthly Subscription", "Commercial Contract", "Hourly"],
    competitiveFactors: ["Background checks", "Insurance/bonding", "Products used (green?)", "Reliability", "Reviews"],
  },
  landscaping: {
    name: "Landscaping & Lawn Care",
    icon: "🌿",
    subServices: ["Weekly Lawn Maintenance", "Landscape Design", "Tree Service", "Irrigation", "Snow Removal", "Hardscape/Patios"],
    clientTypes: ["Residential", "HOA", "Commercial Property", "Municipal"],
    billingModels: ["Monthly Subscription", "Per-Service", "Seasonal Contract", "Project-Based"],
    competitiveFactors: ["Equipment quality", "Crew reliability", "License/insurance", "Organic options", "Design portfolio"],
  },
  event_planning: {
    name: "Event Planning",
    icon: "🎉",
    subServices: ["Wedding Planning", "Corporate Events", "Birthday/Parties", "Conference Management", "Virtual Events", "Venue Sourcing"],
    clientTypes: ["Couples", "Corporations", "Non-Profits", "Individuals", "Government"],
    billingModels: ["Flat Package Fee", "% of Total Budget", "Hourly", "Day-of Coordination"],
    competitiveFactors: ["Vendor network", "Portfolio", "Reviews", "Specialization (weddings vs corporate)", "Crisis management"],
  },
  photography: {
    name: "Photography Studio",
    icon: "📷",
    subServices: ["Wedding Photography", "Portrait Sessions", "Commercial/Product", "Real Estate Photos", "Events", "Headshots", "Video Production"],
    clientTypes: ["Couples", "Families", "Businesses", "Real Estate Agents", "Corporate"],
    billingModels: ["Per Session + Digital Files", "Package Pricing", "Licensing Fee", "Retainer (commercial)"],
    competitiveFactors: ["Portfolio quality", "Style/aesthetic", "Turnaround time", "Equipment", "Albums/products"],
  },
} as const;

// ─── SOFTWARE / SAAS NICHES ───────────────────────────────────────────────────

export const SAAS_NICHES = {
  productivity: { name: "Productivity Tools", examples: ["Task manager", "Time tracker", "Note-taking app", "Calendar tool"] },
  marketing_saas: { name: "Marketing SaaS", examples: ["Email tool", "Social scheduler", "SEO tracker", "Landing page builder"] },
  ecom_tools: { name: "E-Commerce Tools", examples: ["Inventory manager", "Review collector", "Pricing optimizer", "Analytics"] },
  hr_tools: { name: "HR & Workforce", examples: ["Scheduling app", "Payroll tool", "Hiring tracker", "Employee portal"] },
  finance_tools: { name: "Finance & Accounting SaaS", examples: ["Invoicing tool", "Expense tracker", "FP&A software", "Tax prep"] },
  vertical_saas: { name: "Vertical SaaS (Industry-Specific)", examples: ["Salon booking", "HVAC dispatch", "Restaurant POS", "Gym management"] },
  ai_tools: { name: "AI-Powered Tools", examples: ["AI writer", "AI image generator", "AI customer support", "AI analytics"] },
  dev_tools: { name: "Developer Tools", examples: ["API service", "Code review tool", "Monitoring/logging", "CI/CD platform"] },
} as const;

export type PlatformKey = keyof typeof PLATFORMS;
export type AdChannelId = typeof AD_CHANNELS[number]["id"];
export type EcomNicheKey = keyof typeof ECOM_NICHES;
export type ServiceNicheKey = keyof typeof SERVICE_NICHES;
export type SaasNicheKey = keyof typeof SAAS_NICHES;
