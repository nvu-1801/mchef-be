// lib/payos.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getPayOSClient() {
  const CLIENT_ID = process.env.PAYOS_CLIENT_ID!;
  const API_KEY = process.env.PAYOS_API_KEY!;
  const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY!;
  if (!CLIENT_ID || !API_KEY || !CHECKSUM_KEY) {
    throw new Error("PAYOS env missing");
  }

  const mod: any = await import("@payos/node");

  // ƯU TIÊN named export PayOS (tránh trả về module)
  const PayOSCtor =
    (typeof mod?.PayOS === "function" && mod.PayOS) ||
    (typeof mod?.default === "function" && mod.default) ||
    null;

  if (!PayOSCtor) {
    throw new Error("payOS SDK: PayOS class not found (ESM/CJS export mismatch)");
  }

  // Một số phiên bản nhận object, một số nhận 3 tham số
  try {
    const inst = new PayOSCtor({ clientId: CLIENT_ID, apiKey: API_KEY, checksumKey: CHECKSUM_KEY });
    return inst;
  } catch {
    // thử kiểu 3 tham số (theo d.ts @ 1.0.6+)
    return new PayOSCtor(CLIENT_ID, API_KEY, CHECKSUM_KEY);
  }
}



// import { PayOS } from "@payos/node";

// // lib/payos.ts
// export function getPayOSClient() {
//   const CLIENT_ID = process.env.PAYOS_CLIENT_ID!;
//   const API_KEY = process.env.PAYOS_API_KEY!;
//   const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY!;
//   if (!CLIENT_ID || !API_KEY || !CHECKSUM_KEY) {
//     throw new Error("PAYOS env missing");
//   }

//   return new PayOS({
//     clientId: CLIENT_ID,
//     apiKey: API_KEY,
//     checksumKey: CHECKSUM_KEY,
//   });
// }
