export type ProfileData = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  skills: string[];
  role: string;
  certStatus?: string | null;
  certificates?: Record<string, unknown>[]; 
  updatedAt: string | null;
};
