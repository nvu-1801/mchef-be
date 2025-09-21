import AuthTabs from "@/modules/auth/ui/AuthTabs";
import AuthForm from "@/modules/auth/ui/AuthForm";

type Props = {
  searchParams: Promise<{ registered?: string; error?: string; redirect?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const sp = await searchParams;                     
  const justRegistered = sp.registered === "1";
  const err = sp.error ?? null;

  return (
    <div>
      <div className="mb-6">
        <AuthTabs />
      </div>

      {justRegistered && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Tạo tài khoản thành công. Vui lòng đăng nhập để tiếp tục.
        </div>
      )}
      {err && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </div>
      )}

      <h1 className="text-2xl font-semibold mb-4 text-gray-900">Welcome back</h1>
      <AuthForm mode="signin" />
      <p className="text-xs text-gray-500 mt-4">
        Bằng việc tiếp tục, bạn đồng ý với Chính sách & Điều khoản.
      </p>
    </div>
  );
}
