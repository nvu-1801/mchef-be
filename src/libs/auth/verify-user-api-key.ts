// src/libs/auth/verify-user-api-key.ts
import { createHash } from "crypto";

export function generateUserApiKey(userId: string): string {
  const secret = process.env.INTERNAL_API_KEY || "fallback-secret";
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // reset mỗi ngày

  return createHash("sha256")
    .update(`${userId}:${secret}:${timestamp}`)
    .digest("hex")
    .substring(0, 32);
}

export function verifyUserApiKey(apiKey: string, userId: string): boolean {
  const expected = generateUserApiKey(userId);
  return apiKey === expected;
}
