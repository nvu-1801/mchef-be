// lib/orderCode.ts
export function genOrderCode() {
  const t = Date.now();              // ms since epoch
  const r = Math.floor(Math.random() * 1000); // 0..999
  return Number(`${t}${r.toString().padStart(3, "0")}`); // <= 16-18 digit
}
