import Link from "next/link";

export const metadata = {
  title: "Giới thiệu - Master Chef",
  description:
    "Nền tảng chia sẻ công thức nấu ăn và kết nối đầu bếp chuyên nghiệp",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-100 via-transparent to-transparent opacity-50" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-pink-200 to-violet-200 opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-sky-200 to-indigo-200 opacity-30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200 px-4 py-2 mb-6">
              <span className="text-2xl">👨‍🍳</span>
              <span className="text-sm font-semibold text-violet-700">
                About Master Chef
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                Nền tảng chia sẻ
              </span>
              <br />
              <span className="text-gray-900">công thức nấu ăn hàng đầu</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg lg:text-xl text-gray-600 leading-relaxed mb-8">
              Kết nối đầu bếp chuyên nghiệp với người yêu thích ẩm thực. Chia sẻ
              kiến thức, truyền cảm hứng và xây dựng cộng đồng nấu ăn sáng tạo.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-xl transition"
              >
                Bắt đầu ngay
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/home"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-base font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Khám phá món ăn
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Công thức", icon: "📖" },
              { value: "5K+", label: "Đầu bếp", icon: "👨‍🍳" },
              { value: "50K+", label: "Người dùng", icon: "👥" },
              { value: "4.9★", label: "Đánh giá", icon: "⭐" },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-5xl mb-3 group-hover:scale-110 transition">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-violet-200 to-pink-200 opacity-20 blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] bg-gradient-to-br from-violet-100 via-fuchsia-100 to-pink-100 flex items-center justify-center">
                  <span className="text-9xl opacity-30">🍳</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Sứ mệnh của chúng tôi
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Master Chef được tạo ra với niềm tin rằng{" "}
                <strong className="text-violet-600">
                  mỗi món ăn đều kể một câu chuyện
                </strong>
                . Chúng tôi kết nối đầu bếp tài năng với hàng triệu người yêu ẩm
                thực, tạo nên một cộng đồng học hỏi và chia sẻ không giới hạn.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Từ những công thức truyền thống đến sáng tạo hiện đại, chúng tôi
                tin rằng{" "}
                <strong className="text-pink-600">sức khỏe là vàng</strong>
                và bữa ăn ngon miệng là món quà tuyệt vời nhất.
              </p>

              <div className="space-y-4">
                {[
                  { icon: "✨", text: "Công thức đa dạng từ khắp nơi" },
                  { icon: "🎓", text: "Học hỏi từ đầu bếp chuyên nghiệp" },
                  { icon: "🤝", text: "Cộng đồng hỗ trợ nhiệt tình" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center text-2xl">
                      {item.icon}
                    </div>
                    <div className="text-base font-medium text-gray-700">
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-violet-50 via-white to-pink-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những nguyên tắc định hướng cách chúng tôi xây dựng cộng đồng
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎨",
                title: "Sáng tạo",
                desc: "Khuyến khích thử nghiệm và đổi mới trong mỗi món ăn",
                gradient: "from-violet-500 to-purple-500",
              },
              {
                icon: "🤝",
                title: "Cộng đồng",
                desc: "Xây dựng môi trường hỗ trợ, chia sẻ và cùng phát triển",
                gradient: "from-pink-500 to-rose-500",
              },
              {
                icon: "🏆",
                title: "Chất lượng",
                desc: "Cam kết mang đến nội dung giá trị và chính xác",
                gradient: "from-amber-500 to-orange-500",
              },
              {
                icon: "🌱",
                title: "Bền vững",
                desc: "Khuyến khích sử dụng nguyên liệu địa phương và thân thiện",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                icon: "📚",
                title: "Học hỏi",
                desc: "Không ngừng phát triển kỹ năng và kiến thức ẩm thực",
                gradient: "from-sky-500 to-blue-500",
              },
              {
                icon: "❤️",
                title: "Đam mê",
                desc: "Yêu thích và tận hưởng mỗi khoảnh khắc trong bếp",
                gradient: "from-fuchsia-500 to-pink-500",
              },
            ].map((value, i) => (
              <div key={i} className="group relative">
                <div
                  className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${value.gradient} opacity-0 group-hover:opacity-20 blur-xl transition`}
                />
                <div className="relative h-full rounded-2xl border bg-white p-8 hover:shadow-xl transition">
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${value.gradient} text-3xl text-white shadow-lg mb-4`}
                  >
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 p-12 text-center shadow-2xl">
            <div className="absolute top-0 left-0 h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

            <div className="relative">
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Sẵn sàng bắt đầu hành trình ẩm thực?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
                Tham gia cộng đồng Master Chef ngay hôm nay và khám phá hàng
                ngàn công thức tuyệt vời
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-violet-600 shadow-xl hover:scale-105 transition"
              >
                Đăng ký miễn phí
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
