// Business-type-aware simulator profiles
// Each profile adapts channel names, lever labels, KPIs, and competitor archetypes
// so the BSG-style mechanics feel authentic to the specific business model.

export type BusinessProfile = {
  channels: { direct: string; wholesale: string; marketplace: string };
  channelMargins: { direct: number; wholesale: number; marketplace: number }; // typical gross margin %
  levers: { price: string; quality: string; adSpend: string; variety: string; rd: string };
  varietyLabel: string;
  kpiLabels: { profit: string; margin: string; growth: string; brand: string };
  competitors: [
    { name: string; strategy: string },
    { name: string; strategy: string },
    { name: string; strategy: string }
  ];
};

const PROFILES: Record<string, BusinessProfile> = {
  "SaaS Product": {
    channels: { direct: "Self-Serve / Website", wholesale: "Resellers & Agencies", marketplace: "App Marketplaces" },
    channelMargins: { direct: 80, wholesale: 55, marketplace: 60 },
    levers: { price: "Price per Seat", quality: "Product Reliability", adSpend: "Content & Ad Budget", variety: "Pricing Tiers", rd: "R&D Investment" },
    varietyLabel: "Pricing Tiers (1–5)",
    kpiLabels: { profit: "Net Profit", margin: "Gross Margin", growth: "MRR Growth", brand: "NPS Score" },
    competitors: [
      { name: "BootstrapSoft", strategy: "Cheap & Minimal" },
      { name: "EnterprisePro", strategy: "Premium Feature Set" },
      { name: "VCFunded Inc", strategy: "Aggressive Growth Mode" },
    ],
  },
  "Newsletter / Substack": {
    channels: { direct: "Paid Subscribers", wholesale: "Sponsorships & Ads", marketplace: "Affiliate Revenue" },
    channelMargins: { direct: 90, wholesale: 95, marketplace: 70 },
    levers: { price: "Subscription Price", quality: "Content Depth & Frequency", adSpend: "Growth Spend", variety: "Issues per Month", rd: "Research Investment" },
    varietyLabel: "Issues per Month",
    kpiLabels: { profit: "Net Revenue", margin: "Subscriber Growth Rate", growth: "Open Rate Trend", brand: "Subscriber NPS" },
    competitors: [
      { name: "Free Newsletter Bro", strategy: "Free + High Volume" },
      { name: "Premium Digest", strategy: "High-Price Deep Research" },
      { name: "VC-Backed Media Co", strategy: "Growth at All Costs" },
    ],
  },
  "YouTube / Content Creator": {
    channels: { direct: "Merch & Own Products", wholesale: "Brand Sponsorships", marketplace: "Ad Revenue (YouTube/etc)" },
    channelMargins: { direct: 60, wholesale: 95, marketplace: 70 },
    levers: { price: "Sponsorship Rate", quality: "Production Quality", adSpend: "Promotion Budget", variety: "Content Formats", rd: "Equipment Investment" },
    varietyLabel: "Content Formats (long/short/live/podcast)",
    kpiLabels: { profit: "Monthly Revenue", margin: "Subscriber Growth", growth: "View Count Growth", brand: "Engagement Rate" },
    competitors: [
      { name: "Daily Upload Gary", strategy: "High Volume, Low Quality" },
      { name: "Cinematic Creator", strategy: "Low Volume, High Quality" },
      { name: "Trending Chaser", strategy: "Algorithm-First Strategy" },
    ],
  },
  "Online Course": {
    channels: { direct: "Own Platform / Website", wholesale: "Corporate Training (B2B)", marketplace: "Udemy / Coursera" },
    channelMargins: { direct: 85, wholesale: 60, marketplace: 40 },
    levers: { price: "Course Price", quality: "Curriculum Depth", adSpend: "Ad & Content Budget", variety: "Courses Offered", rd: "New Curriculum Investment" },
    varietyLabel: "Courses in Catalog",
    kpiLabels: { profit: "Net Revenue", margin: "Completion Rate", growth: "Enrollment Growth", brand: "Student Rating" },
    competitors: [
      { name: "Free YouTube Tutorials", strategy: "Free & Good Enough" },
      { name: "Big Platform Bootcamp", strategy: "Credentialed & Expensive" },
      { name: "Cohort Learning Co", strategy: "Community & Live Access" },
    ],
  },
  "E-commerce (Dropshipping)": {
    channels: { direct: "Own Shopify Store", wholesale: "Wholesale to Retailers", marketplace: "Amazon / eBay / Etsy" },
    channelMargins: { direct: 50, wholesale: 30, marketplace: 25 },
    levers: { price: "Retail Pricing", quality: "Product Quality Tier", adSpend: "Paid Ad Budget", variety: "SKU Count", rd: "Product Development" },
    varietyLabel: "SKUs (1–5+)",
    kpiLabels: { profit: "Net Profit", margin: "Gross Margin", growth: "Revenue Growth", brand: "Return Rate" },
    competitors: [
      { name: "AliExpress Flipper", strategy: "Lowest Possible Price" },
      { name: "Brand Builder Co", strategy: "Premium Branded Products" },
      { name: "Amazon FBA Giant", strategy: "Volume + Reviews Game" },
    ],
  },
  "E-commerce (Amazon FBA)": {
    channels: { direct: "Amazon Listings", wholesale: "Wholesale Distribution", marketplace: "Walmart / eBay" },
    channelMargins: { direct: 35, wholesale: 30, marketplace: 28 },
    levers: { price: "List Price", quality: "Product & Packaging Quality", adSpend: "Amazon PPC Budget", variety: "ASIN Count", rd: "Product Line Expansion" },
    varietyLabel: "ASINs / Products",
    kpiLabels: { profit: "Net Profit", margin: "Amazon Margin", growth: "Unit Sales Growth", brand: "Review Rating" },
    competitors: [
      { name: "Overseas Manufacturer", strategy: "Undercut on Price" },
      { name: "Private Label Pro", strategy: "Premium Brand Story" },
      { name: "Wholesale Distributor", strategy: "High Volume, Thin Margin" },
    ],
  },
  "Marketing Agency": {
    channels: { direct: "Direct Retainer Clients", wholesale: "White-Label for Agencies", marketplace: "Freelance Platforms" },
    channelMargins: { direct: 65, wholesale: 45, marketplace: 40 },
    levers: { price: "Hourly / Retainer Rate", quality: "Team Talent Level", adSpend: "Biz Dev Spend", variety: "Service Lines", rd: "Process & Tool Investment" },
    varietyLabel: "Services (SEO/Ads/Social/Email/Web)",
    kpiLabels: { profit: "Net Profit", margin: "Utilization Rate", growth: "Revenue Growth", brand: "Client NPS" },
    competitors: [
      { name: "Offshore Digital", strategy: "Low-Cost High Volume" },
      { name: "BrandMasters Agency", strategy: "Premium Full-Service" },
      { name: "Performance Only Co", strategy: "ROI-Guaranteed Model" },
    ],
  },
  "Design Agency": {
    channels: { direct: "Direct Project Clients", wholesale: "Agency Subcontracting", marketplace: "Design Platforms (99designs etc)" },
    channelMargins: { direct: 70, wholesale: 50, marketplace: 35 },
    levers: { price: "Project / Hourly Rate", quality: "Designer Talent Level", adSpend: "Portfolio & Outreach", variety: "Design Services", rd: "Software & Training" },
    varietyLabel: "Service Types (branding/web/print/video)",
    kpiLabels: { profit: "Net Profit", margin: "Utilization Rate", growth: "Revenue Growth", brand: "Portfolio Rating" },
    competitors: [
      { name: "Fiverr Designer", strategy: "Race to the Bottom Pricing" },
      { name: "Full-Service Creative", strategy: "Premium Brand Strategy" },
      { name: "AI Design Tool", strategy: "Disrupting with Automation" },
    ],
  },
  "Bookkeeping Service": {
    channels: { direct: "Individual / Small Biz Clients", wholesale: "CPA Firm Referrals", marketplace: "Online Bookkeeping Platforms" },
    channelMargins: { direct: 70, wholesale: 55, marketplace: 45 },
    levers: { price: "Monthly Billing Rate", quality: "Staff Expertise Level", adSpend: "Referral & Marketing Spend", variety: "Service Lines", rd: "Accounting Software Investment" },
    varietyLabel: "Services (Bookkeeping/Tax/Payroll/Advisory)",
    kpiLabels: { profit: "Net Profit", margin: "Billable Hours Ratio", growth: "Client Growth", brand: "Client Retention Rate" },
    competitors: [
      { name: "BudgetBooks Online", strategy: "Cheap DIY Software" },
      { name: "Big 4 Local Branch", strategy: "Premium Full-Service CPA" },
      { name: "Virtual CFO Co", strategy: "Strategic Advisory Focus" },
    ],
  },
  "Freelance Writing": {
    channels: { direct: "Direct Brand Clients", wholesale: "Content Agency Clients", marketplace: "Content Platforms (Contently etc)" },
    channelMargins: { direct: 90, wholesale: 70, marketplace: 55 },
    levers: { price: "Per-Word / Project Rate", quality: "Writing & Research Depth", adSpend: "Portfolio Outreach", variety: "Content Niches", rd: "Skill Development" },
    varietyLabel: "Content Niches (1–5)",
    kpiLabels: { profit: "Monthly Revenue", margin: "Effective Hourly Rate", growth: "Client Growth", brand: "Client Referral Rate" },
    competitors: [
      { name: "AI Content Tool", strategy: "Near-Zero Cost Content" },
      { name: "Offshore Writer Pool", strategy: "Cheap Bulk Content" },
      { name: "Specialist Journalist", strategy: "Premium Niche Authority" },
    ],
  },
  "Restaurant": {
    channels: { direct: "Dine-In", wholesale: "Catering & Events", marketplace: "Delivery Apps (DoorDash etc)" },
    channelMargins: { direct: 65, wholesale: 55, marketplace: 40 },
    levers: { price: "Menu Pricing", quality: "Ingredient Quality", adSpend: "Local Marketing", variety: "Menu Breadth", rd: "Kitchen Equipment" },
    varietyLabel: "Menu Items",
    kpiLabels: { profit: "Net Profit", margin: "Food Cost %", growth: "Cover Count Growth", brand: "Yelp / Review Rating" },
    competitors: [
      { name: "Fast Food Chain", strategy: "Speed & Lowest Price" },
      { name: "Fine Dining Next Door", strategy: "Premium Experience" },
      { name: "Ghost Kitchen App", strategy: "Delivery-Only Volume" },
    ],
  },
  "Cleaning Service": {
    channels: { direct: "Residential Clients", wholesale: "Commercial Contracts", marketplace: "App Platforms (TaskRabbit etc)" },
    channelMargins: { direct: 55, wholesale: 45, marketplace: 40 },
    levers: { price: "Per-Job / Hourly Rate", quality: "Training & Supplies Quality", adSpend: "Local Advertising", variety: "Service Packages", rd: "Equipment Investment" },
    varietyLabel: "Service Packages (basic/deep/commercial)",
    kpiLabels: { profit: "Net Profit", margin: "Job Margin", growth: "Job Volume Growth", brand: "Review Rating" },
    competitors: [
      { name: "Individual Cleaner", strategy: "Cheap & Word of Mouth" },
      { name: "Franchise Chain", strategy: "Brand Trust & Systems" },
      { name: "Gig App Cleaners", strategy: "On-Demand Convenience" },
    ],
  },
  "Landscaping": {
    channels: { direct: "Residential Clients", wholesale: "HOA & Commercial Contracts", marketplace: "App Platforms (Thumbtack etc)" },
    channelMargins: { direct: 55, wholesale: 45, marketplace: 40 },
    levers: { price: "Per-Job / Monthly Rate", quality: "Crew Training & Equipment", adSpend: "Local Marketing", variety: "Service Types", rd: "Equipment Upgrade" },
    varietyLabel: "Services (mow/trim/design/irrigation)",
    kpiLabels: { profit: "Net Profit", margin: "Job Margin", growth: "Client Growth", brand: "Referral Rate" },
    competitors: [
      { name: "Neighborhood Kid", strategy: "Cheapest Option" },
      { name: "Full-Service Landscaper", strategy: "Premium Design & Care" },
      { name: "Lawn Care Franchise", strategy: "Systemized & Branded" },
    ],
  },
  "Electrician Business": {
    channels: { direct: "Residential Jobs", wholesale: "Commercial Contracts", marketplace: "Subcontracting" },
    channelMargins: { direct: 55, wholesale: 45, marketplace: 38 },
    levers: { price: "Hourly Rate", quality: "Crew Certification Level", adSpend: "Local Marketing", variety: "Service Specializations", rd: "Tools & Equipment" },
    varietyLabel: "Specializations (residential/commercial/solar/EV)",
    kpiLabels: { profit: "Net Profit", margin: "Job Margin", growth: "Job Volume Growth", brand: "Review Rating" },
    competitors: [
      { name: "Cheap Charlie Electric", strategy: "Undercut on Price" },
      { name: "Commercial First Corp", strategy: "Enterprise Contracts Only" },
      { name: "Tech-Enabled Service App", strategy: "App-Based Volume" },
    ],
  },
  "Plumbing Business": {
    channels: { direct: "Residential Emergency & Repair", wholesale: "New Construction Contracts", marketplace: "Home Services Apps" },
    channelMargins: { direct: 60, wholesale: 45, marketplace: 40 },
    levers: { price: "Service Call Rate", quality: "Crew Training & Parts Quality", adSpend: "Local Ads & SEO", variety: "Service Types", rd: "Equipment & Tools" },
    varietyLabel: "Services (repair/install/emergency/drain)",
    kpiLabels: { profit: "Net Profit", margin: "Job Margin", growth: "Call Volume Growth", brand: "Review Rating" },
    competitors: [
      { name: "Solo Handyman", strategy: "Low-Cost Word of Mouth" },
      { name: "National Franchise", strategy: "Brand Trust & Guarantee" },
      { name: "Emergency Service App", strategy: "On-Demand Premium" },
    ],
  },
  "Personal Training": {
    channels: { direct: "1-on-1 In-Person Clients", wholesale: "Corporate Wellness Programs", marketplace: "Online Fitness Apps" },
    channelMargins: { direct: 80, wholesale: 60, marketplace: 50 },
    levers: { price: "Session / Package Rate", quality: "Certifications & Programming", adSpend: "Social Media & Ads", variety: "Program Types", rd: "Education & Specialization" },
    varietyLabel: "Program Types (strength/cardio/nutrition/online)",
    kpiLabels: { profit: "Net Revenue", margin: "Client Retention Rate", growth: "Client Growth", brand: "Client Results / Testimonials" },
    competitors: [
      { name: "Free YouTube Workouts", strategy: "Free & Accessible" },
      { name: "Boutique Gym Trainer", strategy: "Premium In-Person" },
      { name: "AI Fitness App", strategy: "Scalable Tech-First" },
    ],
  },
  "Real Estate Investing": {
    channels: { direct: "Long-Term Rentals", wholesale: "Wholesale Deals to Investors", marketplace: "Short-Term Rentals (Airbnb)" },
    channelMargins: { direct: 40, wholesale: 30, marketplace: 55 },
    levers: { price: "Rent / Sale Price", quality: "Property Quality & Amenities", adSpend: "Listing & Marketing", variety: "Property Types", rd: "Renovation Investment" },
    varietyLabel: "Property Types (SFH/multi/commercial/STR)",
    kpiLabels: { profit: "Net Cash Flow", margin: "Cap Rate", growth: "Portfolio Growth", brand: "Tenant Retention" },
    competitors: [
      { name: "Institutional Investor", strategy: "Scale & Low Cap Rate" },
      { name: "Fix & Flip Operator", strategy: "Quick Turnover Plays" },
      { name: "Airbnb Arbitrage Host", strategy: "STR Revenue Maximizer" },
    ],
  },
  "Photography": {
    channels: { direct: "Direct Client Bookings", wholesale: "Agency & Corporate Work", marketplace: "Stock Photo Platforms" },
    channelMargins: { direct: 80, wholesale: 65, marketplace: 30 },
    levers: { price: "Session / Project Rate", quality: "Equipment & Editing Quality", adSpend: "Portfolio & Social Media", variety: "Photography Niches", rd: "Gear & Education" },
    varietyLabel: "Niches (wedding/portrait/commercial/event)",
    kpiLabels: { profit: "Net Revenue", margin: "Booking Rate", growth: "Revenue Growth", brand: "Portfolio & Referral Rate" },
    competitors: [
      { name: "Cheap Weekend Shooter", strategy: "Low Price, Basic Quality" },
      { name: "Award-Winning Studio", strategy: "Premium Brand & Experience" },
      { name: "Smartphone App", strategy: "DIY Photography Tools" },
    ],
  },
};

// Default fallback profile for business types not explicitly defined
export const DEFAULT_PROFILE: BusinessProfile = {
  channels: { direct: "Direct Clients", wholesale: "Business-to-Business (B2B)", marketplace: "Online Platforms" },
  channelMargins: { direct: 65, wholesale: 45, marketplace: 35 },
  levers: { price: "Pricing Rate", quality: "Quality Level", adSpend: "Marketing Budget", variety: "Offerings", rd: "Innovation Investment" },
  varietyLabel: "Service / Product Lines (1–5)",
  kpiLabels: { profit: "Net Profit", margin: "Gross Margin", growth: "Revenue Growth", brand: "Brand Rating" },
  competitors: [
    { name: "Budget Larry", strategy: "Undercut on Price" },
    { name: "Premium Pete", strategy: "High-End Quality" },
    { name: "Growth Gary", strategy: "Aggressive Market Expansion" },
  ],
};

export function getBusinessProfile(businessTypeName: string): BusinessProfile {
  return PROFILES[businessTypeName] ?? DEFAULT_PROFILE;
}
