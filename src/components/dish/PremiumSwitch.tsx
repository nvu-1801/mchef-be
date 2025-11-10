"use client";

import { useEffect, useState } from "react";

type Props = {
  dishId: string;
  compact?: boolean; // hiển thị gọn gàng (card)
  onChanged?: (active: boolean) => void; // chỉ trả về trạng thái Premium
};

type PremiumState =
  | { isPremium: false; canView: true }
  | {
      isPremium: true;
      active: boolean;
      canView: boolean;
      reason?: string;
    };

type PremiumApiResponse = {
  isPremium?: boolean;
  active?: boolean;
  canView?: boolean;
  reason?: string;
  error?: string;
};

export default function PremiumSwitch({ dishId, compact, onChanged }: Props) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<PremiumState | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/dishes/${dishId}/premium`, { method: "GET" });
      const data: PremiumApiResponse = await res.json();
      if (!res.ok) throw new Error(data?.error || "Fetch premium failed");
      // Server có thể trả về required_plan nhưng ta không dùng nữa
      setState(
        data?.isPremium
          ? ({
              isPremium: true,
              active: !!data.active,
              canView: !!data.canView,
              reason: data.reason,
            } as PremiumState)
          : ({ isPremium: false, canView: true } as PremiumState)
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErr(error.message || "Cannot load premium state");
      } else {
        setErr("Cannot load premium state");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishId]);

  async function enablePremium() {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/dishes/${dishId}/premium`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // chỉ bật premium, server sẽ mặc định required_plan = 'premium'
        body: JSON.stringify({ active: true }),
      });
      const data: PremiumApiResponse = await res.json();
      if (!res.ok) throw new Error(data?.error || "Enable premium failed");
      await load();
      onChanged?.(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErr(error.message || "Cannot enable premium");
      } else {
        setErr("Cannot enable premium");
      }
    } finally {
      setSaving(false);
    }
  }

  async function disablePremium() {
    if (!confirm("Gỡ thu phí cho món này?")) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/dishes/${dishId}/premium`, { method: "DELETE" });
      const data: PremiumApiResponse | null = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Disable premium failed");
      await load();
      onChanged?.(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErr(error.message || "Cannot disable premium");
      } else {
        setErr("Cannot disable premium");
      }
    } finally {
      setSaving(false);
    }
  }

  const active = state?.isPremium ? state.active : false;

  // --- UI ---
  if (loading) {
    return (
      <div
        className={
          compact
            ? "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs animate-pulse"
            : "rounded-xl border p-4 animate-pulse"
        }
      >
        <div className="h-4 w-4 rounded bg-gray-200" />
        <div className="h-4 w-24 rounded bg-gray-200" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {active ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
            💎 Premium
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
            Free
          </span>
        )}

        <button
          onClick={active ? disablePremium : enablePremium}
          disabled={saving}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            active
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "bg-violet-600 text-white hover:bg-violet-700"
          } disabled:opacity-50`}
          title={active ? "Tắt thu phí" : "Bật thu phí"}
        >
          {saving ? "Đang lưu…" : active ? "Tắt" : "Bật"}
        </button>

        {err && <span className="text-[11px] text-rose-600">{err}</span>}
      </div>
    );
  }

  // full panel
  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-gray-800 flex items-center gap-2">
          {active ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
              💎 Premium
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
              Free
            </span>
          )}
          Trạng thái thu phí
        </div>
        <div className="text-xs text-gray-500">
          {active ? "Đang thu phí" : "Không thu phí"}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={active ? disablePremium : enablePremium}
          disabled={saving}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            active
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "bg-violet-600 text-white hover:bg-violet-700"
          } disabled:opacity-50`}
        >
          {saving ? "Đang lưu…" : active ? "Tắt thu phí" : "Bật thu phí"}
        </button>
      </div>

      {err && <div className="text-xs text-rose-600">{err}</div>}
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";

// type Props = {
//   dishId: string;
//   compact?: boolean; // hiển thị gọn gàng (card)
//   onChanged?: (active: boolean) => void; // chỉ trả về trạng thái Premium
// };

// type PremiumState =
//   | { isPremium: false; canView: true }
//   | {
//       isPremium: true;
//       active: boolean;
//       canView: boolean;
//       reason?: string;
//     };

// export default function PremiumSwitch({ dishId, compact, onChanged }: Props) {
//   const [loading, setLoading] = useState(true);
//   const [state, setState] = useState<PremiumState | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [err, setErr] = useState<string | null>(null);

//   async function load() {
//     setLoading(true);
//     setErr(null);
//     try {
//       const res = await fetch(`/api/dishes/${dishId}/premium`, { method: "GET" });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error || "Fetch premium failed");
//       // Server có thể trả về required_plan nhưng ta không dùng nữa
//       setState(
//         data?.isPremium
//           ? ({ isPremium: true, active: !!data.active, canView: !!data.canView, reason: data.reason } as PremiumState)
//           : ({ isPremium: false, canView: true } as PremiumState)
//       );
//     } catch (e: any) {
//       setErr(e.message || "Cannot load premium state");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [dishId]);

//   async function enablePremium() {
//     setSaving(true);
//     setErr(null);
//     try {
//       const res = await fetch(`/api/dishes/${dishId}/premium`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         // chỉ bật premium, server sẽ mặc định required_plan = 'premium'
//         body: JSON.stringify({ active: true }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error || "Enable premium failed");
//       await load();
//       onChanged?.(true);
//     } catch (e: any) {
//       setErr(e.message || "Cannot enable premium");
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function disablePremium() {
//     if (!confirm("Gỡ thu phí cho món này?")) return;
//     setSaving(true);
//     setErr(null);
//     try {
//       const res = await fetch(`/api/dishes/${dishId}/premium`, { method: "DELETE" });
//       const data = await res.json().catch(() => null);
//       if (!res.ok) throw new Error(data?.error || "Disable premium failed");
//       await load();
//       onChanged?.(false);
//     } catch (e: any) {
//       setErr(e.message || "Cannot disable premium");
//     } finally {
//       setSaving(false);
//     }
//   }

//   const active = state?.isPremium ? state.active : false;

//   // --- UI ---
//   if (loading) {
//     return (
//       <div
//         className={
//           compact
//             ? "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs animate-pulse"
//             : "rounded-xl border p-4 animate-pulse"
//         }
//       >
//         <div className="h-4 w-4 rounded bg-gray-200" />
//         <div className="h-4 w-24 rounded bg-gray-200" />
//       </div>
//     );
//   }

//   if (compact) {
//     return (
//       <div className="flex items-center gap-2">
//         {active ? (
//           <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
//             💎 Premium
//           </span>
//         ) : (
//           <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
//             Free
//           </span>
//         )}

//         <button
//           onClick={active ? disablePremium : enablePremium}
//           disabled={saving}
//           className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
//             active
//               ? "bg-rose-600 text-white hover:bg-rose-700"
//               : "bg-violet-600 text-white hover:bg-violet-700"
//           } disabled:opacity-50`}
//           title={active ? "Tắt thu phí" : "Bật thu phí"}
//         >
//           {saving ? "Đang lưu…" : active ? "Tắt" : "Bật"}
//         </button>

//         {err && <span className="text-[11px] text-rose-600">{err}</span>}
//       </div>
//     );
//   }

//   // full panel
//   return (
//     <div className="rounded-xl border p-4 space-y-3">
//       <div className="flex items-center justify-between">
//         <div className="font-semibold text-gray-800 flex items-center gap-2">
//           {active ? (
//             <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
//               💎 Premium
//             </span>
//           ) : (
//             <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
//               Free
//             </span>
//           )}
//           Trạng thái thu phí
//         </div>
//         <div className="text-xs text-gray-500">
//           {active ? "Đang thu phí" : "Không thu phí"}
//         </div>
//       </div>

//       <div className="flex items-center gap-2">
//         <button
//           onClick={active ? disablePremium : enablePremium}
//           disabled={saving}
//           className={`rounded-lg px-4 py-2 text-sm font-semibold ${
//             active
//               ? "bg-rose-600 text-white hover:bg-rose-700"
//               : "bg-violet-600 text-white hover:bg-violet-700"
//           } disabled:opacity-50`}
//         >
//           {saving ? "Đang lưu…" : active ? "Tắt thu phí" : "Bật thu phí"}
//         </button>
//       </div>

//       {err && <div className="text-xs text-rose-600">{err}</div>}
//     </div>
//   );
// }
