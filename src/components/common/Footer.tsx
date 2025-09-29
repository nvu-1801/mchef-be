"use client";

import React from "react";
import {
  Mail,
  ArrowUp,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Clock,
  Globe,
  CreditCard,
  Apple
} from "lucide-react";

/**
 * Footer Component
 * - Beautiful gradient border & soft glass background
 * - 4 navigation columns (Shop, Learn, Company, Support)
 * - Newsletter subscribe with basic validation
 * - Social icons
 * - Language & Currency selectors
 * - Contact / Store hours
 * - Payment badges
 * - Back-to-top button
 */
export default function Footer({ brand = "Shop" }: { brand?: string }) {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const year = new Date().getFullYear();

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }
    try {
      // OPTIONAL: hook to your API route if you have one
      // await fetch("/api/newsletter/subscribe", { method: "POST", body: JSON.stringify({ email }) });
      setMessage("Đăng ký nhận tin thành công ✨");
      setEmail("");
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  }

  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const sections: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: "Shop",
      links: [
        { label: "Sản phẩm mới", href: "/new" },
        { label: "Bán chạy", href: "/trending" },
        { label: "Khuyến mãi", href: "/sale" },
        { label: "Bộ sưu tập", href: "/collections" }
      ]
    },
    {
      title: "Learn",
      links: [
        { label: "Công thức", href: "/recipes" },
        { label: "Blog nấu ăn", href: "/blog" },
        { label: "Video hướng dẫn", href: "/videos" },
        { label: "FAQ", href: "/faq" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "Về chúng tôi", href: "/about" },
        { label: "Tuyển dụng", href: "/careers" },
        { label: "Đối tác", href: "/partners" },
        { label: "Liên hệ", href: "/contact" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Trung tâm hỗ trợ", href: "/support" },
        { label: "Theo dõi đơn hàng", href: "/orders/track" },
        { label: "Chính sách đổi trả", href: "/refund" },
        { label: "Bảo hành", href: "/warranty" }
      ]
    }
  ];

  return (
    <footer className="mt-16 border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-950/80 dark:border-neutral-800">
      {/* Gradient accent line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand + subscribe */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-emerald-500 text-white shadow">
                <Apple className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{brand}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Nấu ăn dễ dàng, mỗi ngày ngon hơn.</p>
              </div>
            </div>

            <form onSubmit={onSubscribe} className="mt-6 space-y-3">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Nhận tin khuyến mãi & công thức</label>
              <div className="flex overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm ring-1 ring-transparent focus-within:ring-indigo-400 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="grid place-items-center px-3 text-neutral-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@mail.com"
                  className="w-full bg-transparent px-3 py-2 outline-none placeholder:text-neutral-400"
                />
                <button
                  type="submit"
                  className="rounded-l-none bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-white"
                >
                  Đăng ký
                </button>
              </div>
              {message && <p className="text-xs text-emerald-600">{message}</p>}
              {error && <p className="text-xs text-rose-600">{error}</p>}
            </form>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
              <a href="#" aria-label="Facebook" className="rounded-full border p-2 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"><Facebook className="h-4 w-4"/></a>
              <a href="#" aria-label="Instagram" className="rounded-full border p-2 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"><Instagram className="h-4 w-4"/></a>
              <a href="#" aria-label="Twitter" className="rounded-full border p-2 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"><Twitter className="h-4 w-4"/></a>
              <a href="#" aria-label="YouTube" className="rounded-full border p-2 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"><Youtube className="h-4 w-4"/></a>
            </div>
          </div>

          {/* Link sections */}
          {sections.map((sec) => (
            <nav key={sec.title} aria-label={sec.title} className="md:col-span-1">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">{sec.title}</h4>
              <ul className="mt-4 space-y-2">
                {sec.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Info strip */}
        <div className="grid grid-cols-1 gap-6 rounded-2xl border bg-white/60 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-neutral-500"/>
            <div>
              <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Cửa hàng</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">123 Đường ABC, Quận 1, TP.HCM</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 text-neutral-500"/>
            <div>
              <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Hỗ trợ</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">(+84) 900 000 000 · hello@{brand.toLowerCase()}.com</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-neutral-500"/>
            <div>
              <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Giờ làm việc</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">T2–T6 9:00–18:00 · T7 9:00–12:00</div>
            </div>
          </div>
        </div>

        {/* Selectors & payments */}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <Globe className="h-4 w-4 text-neutral-500"/>
              <select className="bg-transparent outline-none">
                <option>Tiếng Việt</option>
                <option>English</option>
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <CreditCard className="h-4 w-4 text-neutral-500"/>
              <select className="bg-transparent outline-none">
                <option>VND (₫)</option>
                <option>USD ($)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="rounded-md border px-2 py-1 dark:border-neutral-700">VISA</span>
            <span className="rounded-md border px-2 py-1 dark:border-neutral-700">Mastercard</span>
            <span className="rounded-md border px-2 py-1 dark:border-neutral-700">JCB</span>
            <span className="rounded-md border px-2 py-1 dark:border-neutral-700">Momo</span>
            <span className="rounded-md border px-2 py-1 dark:border-neutral-700">ZaloPay</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t py-6 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400 md:flex-row md:items-center">
          <p>© {year} {brand}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="/privacy" className="hover:text-neutral-900 dark:hover:text-neutral-100">Privacy</a>
            <a href="/terms" className="hover:text-neutral-900 dark:hover:text-neutral-100">Terms</a>
            <a href="/cookies" className="hover:text-neutral-900 dark:hover:text-neutral-100">Cookies</a>
            <button onClick={scrollToTop} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900">
              <ArrowUp className="h-4 w-4" /> Lên đầu trang
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
