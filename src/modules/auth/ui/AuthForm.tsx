"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "../../../libs/db/supabase/supabase-client";

function humanize(message?: string) {
  const m = (message || "").toLowerCase();
  if (m.includes("email not confirmed") || m.includes("not confirmed"))
    return "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.";
  if (m.includes("invalid login credentials"))
    return "Sai email hoặc mật khẩu.";
  if (m.includes("email provider disabled"))
    return "Email/Password đang bị tắt trong Supabase. Hãy bật Provider Email.";
  if (m.includes("captcha"))
    return "Captcha đang bật. Hãy tắt Captcha hoặc tích hợp hCaptcha.";
  return message || "Có lỗi xảy ra.";
}

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp.get("redirect") || "/home";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setConfirmNotice(null);
    const sb = supabaseBrowser();

    startTransition(async () => {
      try {
        if (mode === "signup") {
          const origin = window.location.origin;
          const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: {
              // Sau khi user bấm link xác nhận trong email, quay về app để set session
              emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
                redirectTo
              )}`,
            },
          });
          if (error) throw error;

          // Nếu dự án tắt email confirmation -> Supabase trả session ngay
          if (data.session) {
            await fetch("/api/auth/ensure-admin", { method: "POST" }).catch(
              () => {}
            );
            await sb.auth.refreshSession();
            router.replace(redirectTo);
            router.refresh();
            return;
          }

          // Ngược lại (bật email confirmation): show thông báo xác nhận
          setConfirmNotice(
            `Đã gửi email xác nhận đến ${email}. Vui lòng kiểm tra hộp thư và bấm vào liên kết để kích hoạt tài khoản.`
          );
          return;
        }

        // Sign in
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;

        await fetch("/api/auth/ensure-admin", { method: "POST" }).catch(
          () => {}
        );
        await sb.auth.refreshSession();

        router.replace(redirectTo); // → về Home
        router.refresh();
      } catch (err: any) {
        setMsg(humanize(err?.message));
        console.error("[auth]", err);
      }
    });
  }

  async function signInWithGoogle() {
    const sb = supabaseBrowser();
    const origin = window.location.origin;
    const next =
      new URLSearchParams(window.location.search).get("redirect") || "/home";

    await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  // Gửi lại email xác nhận (nếu bật email confirmation)
  async function resendConfirmEmail() {
    setMsg(null);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.resend({ type: "signup", email });
    if (error) setMsg(humanize(error.message));
    else setConfirmNotice(`Đã gửi lại email xác nhận đến ${email}.`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-gray-900">
      {/* Nút OAuth Google (giữ nguyên) */}
      <button
        type="button"
        className="w-full h-10 rounded-full border border-gray-300 bg-white
                   text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2"
        onClick={signInWithGoogle}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path
            fill="#EA4335"
            d="M12 11.9v3.8h5.4c-.2 1.2-1.6 3.6-5.4 3.6-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.8 5.6 14.6 4.7 12 4.7 6.9 4.7 2.8 8.8 2.8 13.9S6.9 23 12 23c6.9 0 9.6-4.8 9.6-7.3 0-.5 0-.9-.1-1.3H12z"
          />
        </svg>
        <span className="text-sm">Continue with Google</span>
      </button>

      {/* Thông báo confirm email (sau khi đăng ký) */}
      {confirmNotice && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {confirmNotice}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={resendConfirmEmail}
              className="text-emerald-700 underline underline-offset-2"
            >
              Gửi lại email xác nhận
            </button>
            <a
              href="/auth/signin"
              className="text-emerald-700 underline underline-offset-2"
            >
              Đã xác nhận? Đăng nhập
            </a>
          </div>
        </div>
      )}

      {/* Form */}
      <div>
        <label className="block text-sm mb-1 text-gray-800">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white text-gray-900 placeholder:text-gray-400
                     border border-gray-300 rounded-xl px-3 py-2 outline-none
                     focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-gray-800">Mật khẩu</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white text-gray-900 placeholder:text-gray-400
                       border border-gray-300 rounded-xl px-3 py-2 pr-10 outline-none
                       focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
            aria-label="Toggle password visibility"
          >
            {show ? "🙈" : "👁️"}
          </button>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">Ít nhất 8 ký tự.</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full h-10 rounded-full bg-gray-900 hover:bg-black text-white transition"
      >
        {pending
          ? "Đang xử lý..."
          : mode === "signin"
          ? "Đăng nhập"
          : "Đăng ký"}
      </button>

      {msg && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {msg}
        </p>
      )}
    </form>
  );
}
