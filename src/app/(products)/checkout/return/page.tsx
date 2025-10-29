// app/checkout/return/page.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutReturnPage() {
  const params = useSearchParams();
  const orderCode = params.get("orderCode");
  const status = (params.get("status") || "success").toLowerCase(); // success/paid/failed
  const message = params.get("message") || "";

  const success = status === "success" || status === "paid";

  const palette = useMemo(
    () =>
      success
        ? {
            bgFrom: "from-emerald-50",
            bgTo: "to-green-50",
            ring: "from-emerald-400/40 via-teal-400/30 to-green-400/30",
            title: "text-emerald-700",
            iconBg: "from-emerald-500 to-teal-500",
            primaryBtn: "from-emerald-500 to-teal-500",
            divider: "from-transparent via-emerald-300 to-transparent",
          }
        : {
            bgFrom: "from-rose-50",
            bgTo: "to-red-50",
            ring: "from-rose-400/40 via-pink-400/30 to-red-400/30",
            title: "text-rose-700",
            iconBg: "from-rose-500 to-red-500",
            primaryBtn: "from-pink-500 to-violet-500",
            divider: "from-transparent via-rose-300 to-transparent",
          },
    [success]
  );

  return (
    <div
      className={`relative min-h-dvh flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${palette.bgFrom} via-white ${palette.bgTo}`}
    >
      {/* Background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-300/25 to-teal-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-pink-300/20 to-yellow-300/20 blur-3xl" />

      <div className="mx-4 w-full max-w-xl">
        <div className="relative rounded-3xl border border-white/60 bg-white/70 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl">
          {/* Accent ring */}
          <div
            className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${palette.ring} blur-[2px]`}
          />
          <div className="relative p-8 sm:p-10">
            {/* Icon */}
            <div
              className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${palette.iconBg} shadow-lg ring-4 ring-white/60`}
            >
              {success ? (
                // check-circle
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4M12 22a10 10 0 100-20 10 10 0 000 20z"
                  />
                </svg>
              ) : (
                // warning
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86l-8.4 14.55A2 2 0 003.6 21h16.8a2 2 0 001.71-3l-8.4-14.55a2 2 0 00-3.42 0z"
                  />
                </svg>
              )}
            </div>

            {/* Title */}
            <div className="mb-2 flex items-center justify-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border border-black/5 bg-black/[0.02] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-600`}
              >
                {success ? "Payment" : "Payment Error"}
              </span>
            </div>
            <h1
              className={`text-center text-2xl sm:text-3xl font-extrabold tracking-tight ${palette.title}`}
            >
              {success ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            </h1>

            {/* Details */}
            <div className="mt-4 space-y-2 text-center">
              {orderCode && (
                <p className="text-sm text-zinc-600">
                  Mã đơn hàng:{" "}
                  <span className="font-semibold text-zinc-800">
                    {orderCode}
                  </span>
                </p>
              )}
              {message && (
                <p className="text-xs text-zinc-500">{message}</p>
              )}
            </div>

            {/* Divider */}
            <div
              className={`mx-auto mt-6 h-px w-24 bg-gradient-to-r ${palette.divider}`}
            />

            {/* Actions */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {success ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`group inline-flex items-center justify-center rounded-xl bg-gradient-to-r ${palette.primaryBtn} px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:shadow-[0_8px_30px_rgba(16,185,129,0.35)] active:scale-[0.98]`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
                      />
                    </svg>
                    Về Dashboard
                  </Link>
                  <Link
                    href={`/orders/${orderCode ?? ""}`}
                    className="inline-flex items-center justify-center rounded-xl border border-emerald-200/70 bg-white/70 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm backdrop-blur transition-colors duration-200 hover:bg-white disabled:opacity-60"
                    aria-disabled={!orderCode}
                    onClick={(e) => {
                      if (!orderCode) e.preventDefault();
                    }}
                  >
                    Xem hoá đơn
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/upgrade"
                    className={`group inline-flex items-center justify-center rounded-xl bg-gradient-to-r ${palette.primaryBtn} px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:shadow-[0_8px_30px_rgba(236,72,153,0.35)] active:scale-[0.98]`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Chọn gói khác
                  </Link>
                  <Link
                    href="/home"
                    className="inline-flex items-center justify-center rounded-xl border border-rose-200/70 bg-white/70 px-5 py-3 text-sm font-semibold text-rose-700 shadow-sm backdrop-blur transition-colors duration-200 hover:bg-white"
                  >
                    Về trang chủ
                  </Link>
                </>
              )}
            </div>

            {/* Tip */}
            <div className="mt-6 rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-4 text-left dark:border-emerald-300/50" hidden={!success}>
              <p className="text-xs text-emerald-800">
                ✅ Gợi ý: Quyền nâng cấp có thể cần vài giây để kích hoạt. Nếu chưa thấy hiệu lực, hãy tải lại Dashboard.
              </p>
            </div>
            <div className="mt-6 rounded-xl border border-rose-200/60 bg-rose-50/60 p-4 text-left" hidden={success}>
              <p className="text-xs text-rose-800">
                ⚠️ Nếu giao dịch bị huỷ do lỗi kỹ thuật, hãy thử lại sau hoặc dùng trình duyệt khác.
              </p>
            </div>
          </div>
        </div>

        {/* Tiny footer */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          Trạng thái:{" "}
          <span className="font-medium text-zinc-700 uppercase">
            {success ? "PAID" : "FAILED"}
          </span>
        </p>
      </div>
    </div>
  );
}
