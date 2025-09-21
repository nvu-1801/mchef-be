import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-2 bg-blue-50">
      {/* Left panel (form) */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right hero */}
      <div className="hidden lg:block relative">
        {/* đặt ảnh ở /public/auth-hero.jpg hoặc đổi src dưới đây */}
        <Image
          src="/auth-hero.jpg" // ảnh trong /public
          alt="Hero"
          fill
          className="object-cover"
          priority
        />
        {/* nếu chưa có ảnh, để nền gradient */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-indigo-400 mix-blend-multiply" /> */}
      </div>
    </div>
  );
}
