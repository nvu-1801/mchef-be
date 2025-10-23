// components/upgrade/data.ts
export type PlanId =
  | "user_free"
  | "user_premium_month"
  | "user_premium_year"
  | "chef_basic"
  | "chef_pro_month"
  | "chef_pro_year";

export const CHECK_SVG = (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const CROSS_SVG = (
  <svg
    className="h-5 w-5 opacity-40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const userMonthly = [
  {
    title: "Miễn phí",
    price: "0đ",
    period: "/tháng",
    planId: "user_free" as PlanId,
    cta: { label: "Dùng miễn phí", href: "/auth/signin" },
    features: {
      basicRecipes: true,
      premiumRecipes: false,
      hdVideos: false,
      aiCoach: false,
      saveCollections: true,
      offlineMode: false,
      noAds: false,
      prioritySupport: false,
    },
  },
  {
    title: "Premium",
    price: "79.000đ",
    period: "/tháng",
    planId: "user_premium_month" as PlanId,
    cta: {
      label: "Nâng cấp tháng",
      href: "/api/checkout?plan=user_premium_month",
    },
    highlight: true,
    features: {
      basicRecipes: true,
      premiumRecipes: true,
      hdVideos: true,
      aiCoach: true,
      saveCollections: true,
      offlineMode: true,
      noAds: true,
      prioritySupport: true,
    },
  },
];

export const userYearly = [
  {
    title: "Miễn phí",
    price: "0đ",
    period: "/năm",
    planId: "user_free" as PlanId,
    cta: { label: "Dùng miễn phí", href: "/auth/signin" },
    features: {
      basicRecipes: true,
      premiumRecipes: false,
      hdVideos: false,
      aiCoach: false,
      saveCollections: true,
      offlineMode: false,
      noAds: false,
      prioritySupport: false,
    },
  },
  {
    title: "Premium (tiết kiệm 20%)",
    price: "759.000đ",
    period: "/năm",
    planId: "user_premium_year" as PlanId,
    cta: {
      label: "Nâng cấp năm",
      href: "/api/checkout?plan=user_premium_year",
    },
    highlight: true,
    features: {
      basicRecipes: true,
      premiumRecipes: true,
      hdVideos: true,
      aiCoach: true,
      saveCollections: true,
      offlineMode: true,
      noAds: true,
      prioritySupport: true,
    },
  },
];

export const chefMonthly = [
  {
    title: "Chef Basic",
    price: "149.000đ",
    period: "/tháng",
    planId: "chef_basic" as PlanId,
    cta: {
      label: "Nâng cấp tháng",
      href: "/api/checkout?plan=chef_pro_month&tier=basic",
    },
    features: {
      postRecipes: true,
      featuredSlots: 1,
      paidClasses: true,
      revenueShare: "85%",
      analytics: false,
      watermarkRemove: false,
      prioritySupport: false,
      courseLandingPages: false,
    },
  },
  {
    title: "Chef Pro",
    price: "299.000đ",
    period: "/tháng",
    planId: "chef_pro_month" as PlanId,
    cta: { label: "Nâng cấp tháng", href: "/api/checkout?plan=chef_pro_month" },
    highlight: true,
    features: {
      postRecipes: true,
      featuredSlots: 4,
      paidClasses: true,
      revenueShare: "92%",
      analytics: true,
      watermarkRemove: true,
      prioritySupport: true,
      courseLandingPages: true,
    },
  },
];

export const chefYearly = [
  {
    title: "Chef Basic (tiết kiệm 20%)",
    price: "1.429.000đ",
    period: "/năm",
    planId: "chef_pro_year" as PlanId,
    cta: {
      label: "Nâng cấp năm",
      href: "/api/checkout?plan=chef_pro_year&tier=basic",
    },
    features: {
      postRecipes: true,
      featuredSlots: 1,
      paidClasses: true,
      revenueShare: "85%",
      analytics: false,
      watermarkRemove: false,
      prioritySupport: false,
      courseLandingPages: false,
    },
  },
  {
    title: "Chef Pro (tiết kiệm 25%)",
    price: "2.699.000đ",
    period: "/năm",
    planId: "chef_pro_year" as PlanId,
    cta: { label: "Nâng cấp năm", href: "/api/checkout?plan=chef_pro_year" },
    highlight: true,
    features: {
      postRecipes: true,
      featuredSlots: 4,
      paidClasses: true,
      revenueShare: "92%",
      analytics: true,
      watermarkRemove: true,
      prioritySupport: true,
      courseLandingPages: true,
    },
  },
];
