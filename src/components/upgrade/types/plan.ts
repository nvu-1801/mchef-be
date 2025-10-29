// types/plan.ts
export type Period = "month" | "year";
export type Audience = "user" | "chef";

export type PlanId =
  | "user_free"
  | "user_premium_month"
  | "user_premium_year"
  | "chef_basic_month"
  | "chef_basic_year"
  | "chef_pro_month"
  | "chef_pro_year";

export type UserFeatures = {
  basicRecipes: boolean;
  premiumRecipes: boolean;
  hdVideos: boolean;
  aiCoach: boolean;
  saveCollections: boolean;
  offlineMode: boolean;
  noAds: boolean;
  prioritySupport: boolean;
};

export type ChefFeatures = {
  postRecipes: boolean;
  featuredSlots: number;
  paidClasses: boolean;
  revenueShare: "85%" | "92%";
  analytics: boolean;
  watermarkRemove: boolean;
  prioritySupport: boolean;
  courseLandingPages: boolean;
};

export type PlanBase = {
  title: string;
  price: string;         // giữ string để không đụng nhiều chỗ render
  period: "/tháng" | "/năm"; // đồng bộ với PriceCard prop `period`
  planId: PlanId;
  cta: { label: string; href: string };
  highlight?: boolean;
};

export type UserPlan = PlanBase & { features: UserFeatures };
export type ChefPlan = PlanBase & { features: ChefFeatures };
