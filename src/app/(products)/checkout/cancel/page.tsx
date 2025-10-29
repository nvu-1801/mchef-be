// app/checkout/cancel/page.tsx
"use client";

import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="relative min-h-dvh flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-white to-amber-50">
      {/* Background decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-orange-300/30 to-amber-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-pink-300/20 to-yellow-300/20 blur-3xl" />

      {/* Card */}
      <div className="mx-4 w-full max-w-lg">
        <div className="relative rounded-3xl border border-white/60 bg-white/70 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl">
          {/* Accent ring */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-orange-400/40 via-amber-400/25 to-pink-400/30 blur-[2px]"></div>

          <div className="relative p-8 sm:p-10">
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg ring-4 ring-white/60">
              {/* X icon */}
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-center text-2xl font-extrabold tracking-tight text-orange-700 sm:text-3xl">
              Thanh toán đã bị huỷ
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-3 max-w-md text-center text-sm leading-6 text-zinc-600">
              Giao dịch chưa được hoàn tất. Bạn có thể quay lại chọn gói khác hoặc thử lại sau.
              Nếu cần hỗ trợ, vui lòng liên hệ đội ngũ của chúng tôi.
            </p>

            {/* Divider */}
            <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-orange-300 to-transparent" />

            {/* Actions */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/upgrade"
                className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:shadow-[0_8px_30px_rgba(255,165,0,0.35)] active:scale-[0.98]"
              >
                <span className="mr-2 transition-transform group-hover:-translate-x-0.5">
                  {/* arrow-rotate */}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7 7-7" />
                  </svg>
                </span>
                Quay lại bảng giá
              </Link>

              <Link
                href="/home"
                className="inline-flex items-center justify-center rounded-xl border border-orange-200/70 bg-white/70 px-5 py-3 text-sm font-semibold text-orange-700 shadow-sm backdrop-blur transition-colors duration-200 hover:bg-white"
              >
                Về trang chủ
              </Link>
            </div>

            {/* Tip box */}
            <div className="mt-6 rounded-xl border border-amber-200/70 bg-amber-50/70 p-4 text-left">
              <p className="text-xs text-amber-800">
                <span className="mr-1">💡</span>
                Mẹo: Nếu bạn gặp lỗi kỹ thuật khi thanh toán, hãy thử đổi trình duyệt hoặc xoá cache trước khi thử lại.
              </p>
            </div>
          </div>
        </div>

        {/* Tiny footer */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          Mã lỗi: <span className="font-medium text-zinc-700">PAY-CANCELLED</span>
        </p>
      </div>
    </div>
  );
}
