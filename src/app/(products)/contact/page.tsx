"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100 via-transparent to-transparent opacity-50" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-violet-200 to-purple-200 opacity-30 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 px-4 py-2 mb-6">
            <span className="text-2xl">📧</span>
            <span className="text-sm font-semibold text-rose-700">
              Get in Touch
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">
              Liên hệ với chúng tôi
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
            Có câu hỏi, góp ý hoặc cần hỗ trợ? Đội ngũ Master Chef luôn sẵn sàng
            lắng nghe!
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            {[
              {
                icon: "📍",
                title: "Địa chỉ văn phòng",
                value: "123 Nguyễn Văn Linh, Quận 7\nTP. Hồ Chí Minh, Việt Nam",
                gradient: "from-rose-500 to-pink-500",
              },
              {
                icon: "📞",
                title: "Điện thoại",
                value: "+84 (028) 1234 5678\nHotline: 1900 xxxx",
                gradient: "from-violet-500 to-purple-500",
              },
              {
                icon: "✉️",
                title: "Email",
                value: "support@masterchef.vn\ninfo@masterchef.vn",
                gradient: "from-sky-500 to-indigo-500",
              },
              {
                icon: "⏰",
                title: "Giờ làm việc",
                value: "Thứ 2 - Thứ 6: 9:00 - 18:00\nThứ 7: 9:00 - 12:00",
                gradient: "from-amber-500 to-orange-500",
              },
            ].map((item, i) => (
              <div key={i} className="group relative">
                <div
                  className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-20 blur-xl transition`}
                />
                <div className="relative h-full rounded-2xl border bg-white p-6 hover:shadow-xl transition">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-2xl text-white shadow-lg mb-4`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl border bg-white p-8 lg:p-12 shadow-xl">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 opacity-50 blur-3xl" />

              {submitted ? (
                <div className="relative text-center py-12">
                  <div className="text-7xl mb-6">✅</div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Cảm ơn bạn đã liên hệ!
                  </h3>
                  <p className="text-lg text-gray-600 mb-8">
                    Chúng tôi đã nhận được tin nhắn và sẽ phản hồi trong vòng 24
                    giờ.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-3 text-base font-bold text-white shadow-lg hover:shadow-xl transition"
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Gửi tin nhắn
                    </h2>
                    <p className="text-gray-600">
                      Điền form dưới đây và chúng tôi sẽ phản hồi sớm nhất có
                      thể
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="relative space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                          Họ và tên <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nguyễn Văn A"
                          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400
                                     focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                          Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="email@example.com"
                          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400
                                     focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        placeholder="0912 345 678"
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400
                                   focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Chủ đề <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900
                                   focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition"
                      >
                        <option value="">Chọn chủ đề...</option>
                        <option>Hỗ trợ kỹ thuật</option>
                        <option>Góp ý sản phẩm</option>
                        <option>Hợp tác kinh doanh</option>
                        <option>Báo cáo vi phạm</option>
                        <option>Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Nội dung <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={6}
                        placeholder="Viết tin nhắn của bạn tại đây..."
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400
                                   focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-4 text-base font-bold text-white
                                 shadow-lg shadow-rose-500/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          Gửi tin nhắn
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social & Map Section */}
      <section className="py-20 bg-gradient-to-r from-rose-50 via-pink-50 to-violet-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kết nối với chúng tôi
            </h2>
            <p className="text-gray-600">
              Theo dõi Master Chef trên mạng xã hội để cập nhật tin tức mới nhất
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              {
                name: "Facebook",
                icon: "📘",
                color: "from-blue-500 to-blue-600",
              },
              {
                name: "Instagram",
                icon: "📷",
                color: "from-pink-500 to-rose-500",
              },
              { name: "YouTube", icon: "📺", color: "from-red-500 to-red-600" },
              {
                name: "TikTok",
                icon: "🎵",
                color: "from-gray-800 to-gray-900",
              },
              {
                name: "Twitter",
                icon: "🐦",
                color: "from-sky-500 to-blue-500",
              },
            ].map((social, i) => (
              <a key={i} href="#" className="group relative">
                <div
                  className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r ${social.color} opacity-0 group-hover:opacity-100 blur transition`}
                />
                <div className="relative flex items-center gap-3 rounded-xl border bg-white px-6 py-4 group-hover:shadow-lg transition">
                  <span className="text-2xl">{social.icon}</span>
                  <span className="font-semibold text-gray-700 group-hover:text-gray-900">
                    {social.name}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
