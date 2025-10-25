"use client";

import { useState } from "react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Tài khoản & Đăng ký",
      icon: "👤",
      items: [
        {
          q: "Làm sao để tạo tài khoản Master Chef?",
          a: "Nhấn vào nút 'Đăng nhập' ở góc trên bên phải, sau đó chọn 'Đăng ký'. Điền email, mật khẩu và xác nhận email để hoàn tất. Bạn cũng có thể đăng ký nhanh bằng Google hoặc Facebook.",
        },
        {
          q: "Tôi quên mật khẩu, phải làm sao?",
          a: "Tại trang đăng nhập, chọn 'Quên mật khẩu?'. Nhập email đã đăng ký và chúng tôi sẽ gửi link đặt lại mật khẩu. Kiểm tra cả hộp thư spam nếu không thấy email.",
        },
        {
          q: "Có thể thay đổi thông tin cá nhân không?",
          a: "Có! Vào Profile > Settings để cập nhật tên, avatar, bio và các thông tin khác. Thay đổi sẽ được lưu tự động.",
        },
      ],
    },
    {
      category: "Đăng công thức",
      icon: "📝",
      items: [
        {
          q: "Làm sao để đăng một công thức mới?",
          a: "Vào 'My Posts' > nhấn 'Đăng món mới'. Điền đầy đủ thông tin: tên món, ảnh, nguyên liệu, các bước thực hiện. Bạn có thể chọn 'Lưu nháp' hoặc 'Công khai ngay'.",
        },
        {
          q: "Tôi có thể chỉnh sửa bài đăng sau khi xuất bản không?",
          a: "Hoàn toàn được! Tại 'My Posts', chọn món cần sửa và nhấn 'Sửa'. Mọi thay đổi sẽ được cập nhật ngay lập tức.",
        },
        {
          q: "Có giới hạn số lượng công thức đăng không?",
          a: "Tài khoản miễn phí không giới hạn số bài đăng. Tuy nhiên, nâng cấp lên Premium sẽ mở khóa thêm nhiều tính năng như analytics, ưu tiên hiển thị và hỗ trợ video HD.",
        },
        {
          q: "Làm sao để ảnh món ăn hiển thị đẹp?",
          a: "Chúng tôi khuyên bạn upload ảnh có độ phân giải tối thiểu 1200x800px, định dạng JPG hoặc PNG. Chụp ảnh dưới ánh sáng tự nhiên và từ góc 45° để món ăn trông hấp dẫn nhất.",
        },
      ],
    },
    {
      category: "Tương tác & Cộng đồng",
      icon: "💬",
      items: [
        {
          q: "Làm sao để follow một đầu bếp?",
          a: "Truy cập profile của đầu bếp và nhấn nút 'Follow'. Bạn sẽ nhận thông báo mỗi khi họ đăng món mới. Quản lý danh sách follow tại Profile > Following.",
        },
        {
          q: "Tôi có thể bình luận và đánh giá không?",
          a: "Có! Mỗi công thức đều có mục comment và rating (1-5 sao). Chia sẻ kinh nghiệm của bạn để giúp cộng đồng. Hãy luôn tôn trọng và xây dựng.",
        },
        {
          q: "Có thể lưu công thức yêu thích không?",
          a: "Nhấn icon 💾 'Save' trên bất kỳ món nào. Danh sách món đã lưu có thể xem tại Profile > Saved. Bạn cũng có thể tạo collections để phân loại.",
        },
      ],
    },
    {
      category: "Premium & Thanh toán",
      icon: "💎",
      items: [
        {
          q: "Premium có những lợi ích gì?",
          a: "Premium mở khóa: Analytics chi tiết, video HD, ưu tiên hiển thị, badges độc quyền, không quảng cáo và hỗ trợ ưu tiên 24/7. Xem chi tiết tại trang Upgrade.",
        },
        {
          q: "Có thể hủy Premium bất cứ lúc nào không?",
          a: "Có! Bạn có thể hủy bất cứ lúc nào tại Settings > Subscription. Quyền lợi Premium sẽ vẫn có hiệu lực đến hết chu kỳ đã thanh toán.",
        },
        {
          q: "Các phương thức thanh toán nào được chấp nhận?",
          a: "Chúng tôi chấp nhận thẻ Visa/Mastercard, MoMo, ZaloPay, chuyển khoản ngân hàng và PayPal. Mọi giao dịch đều được mã hóa bảo mật.",
        },
      ],
    },
    {
      category: "Bảo mật & Quyền riêng tư",
      icon: "🔒",
      items: [
        {
          q: "Thông tin cá nhân có được bảo mật không?",
          a: "Chúng tôi tuân thủ GDPR và các quy định bảo mật quốc tế. Dữ liệu được mã hóa, không bán cho bên thứ ba. Đọc thêm tại Privacy Policy.",
        },
        {
          q: "Làm sao để xóa tài khoản?",
          a: "Vào Settings > Account > Delete Account. Lưu ý: hành động này không thể hoàn tác và tất cả dữ liệu sẽ bị xóa vĩnh viễn sau 30 ngày.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-transparent to-transparent opacity-50" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-sky-200 to-indigo-200 opacity-30 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 px-4 py-2 mb-6">
            <span className="text-2xl">❓</span>
            <span className="text-sm font-semibold text-sky-700">
              Frequently Asked Questions
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Câu hỏi thường gặp
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-8">
            Tìm câu trả lời nhanh chóng cho các thắc mắc phổ biến. Không tìm
            thấy?{" "}
            <a
              href="/contact"
              className="text-sky-600 font-semibold hover:underline"
            >
              Liên hệ chúng tôi
            </a>
          </p>

          {/* Search (optional) */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 text-base text-gray-900 placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 space-y-12">
          {faqs.map((category, catIdx) => (
            <div key={catIdx}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center text-2xl">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {category.category}
                </h2>
              </div>

              <div className="space-y-4">
                {category.items.map((item, itemIdx) => {
                  const globalIdx = catIdx * 100 + itemIdx;
                  const isOpen = openIndex === globalIdx;

                  return (
                    <div
                      key={itemIdx}
                      className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md transition"
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                        className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 group"
                      >
                        <span className="text-lg font-semibold text-gray-900 group-hover:text-sky-600 transition">
                          {item.q}
                        </span>
                        <svg
                          className={`w-6 h-6 text-gray-400 group-hover:text-sky-600 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? "max-h-96" : "max-h-0"
                        }`}
                      >
                        <div className="px-6 pb-5 text-base text-gray-600 leading-relaxed border-t pt-4">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-sky-50 via-indigo-50 to-violet-50">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="text-5xl mb-6">🤔</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Vẫn còn thắc mắc?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn 24/7
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-sky-500/30 hover:shadow-xl transition"
          >
            Liên hệ ngay
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
