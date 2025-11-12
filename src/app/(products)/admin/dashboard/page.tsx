// app/dashboard/page.tsx (hoặc nơi bạn đặt file DashboardPage)
"use client";

import { useEffect, useState } from "react";
// 1. Import hàm tạo client của bạn
import { supabaseBrowser } from "@/libs/supabase/supabase-client"; // <-- Cập nhật đường dẫn này cho đúng

// 2. (Nên có) Định nghĩa Type cho dữ liệu đơn hàng dựa trên SQL của bạn
// Chúng ta chỉ lấy một vài cột để hiển thị
type Order = {
  order_code: number;
  status: string | null;
  amount: number;
  currency: string | null;
  created_at: string;
};

export default function DashboardPage() {
  // 3. Tạo các state để lưu trữ dữ liệu, trạng thái loading và lỗi
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 4. Khởi tạo client
  // (Chúng ta có thể gọi nó ở đây vì nó không phải là hook)
  const supabase = supabaseBrowser();

  // 5. Sử dụng useEffect để fetch dữ liệu khi component được mount
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);

      // 6. Đây là câu query Supabase!
      const { data, error } = await supabase
        .from("orders") // Tên bảng của bạn
        .select("order_code, status, amount, currency, created_at") // Các cột bạn muốn
        .order("created_at", { ascending: false }) // Sắp xếp mới nhất lên đầu
        .limit(50); // Giới hạn 50 kết quả

      if (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
        setError(error.message);
        setOrders([]);
      } else if (data) {
        setOrders(data as Order[]);
      }

      setLoading(false);
    }

    fetchOrders();
  }, [supabase]); // Thêm supabase vào dependency array nếu bạn khởi tạo nó bên ngoài

  // 7. Hiển thị trạng thái tải (loading)
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-600 mb-4">Dashboard</h1>
        <p>Đang tải dữ liệu đơn hàng...</p>
      </div>
    );
  }

  // 8. Hiển thị lỗi (nếu có)
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-600 mb-4">Dashboard</h1>
        <p className="text-red-500">Lỗi: {error}</p>
      </div>
    );
  }

  // 9. Hiển thị bảng dữ liệu
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-600 mb-4">
        Dashboard
      </h1>
      <p className="mb-4">
        Hiển thị 50 đơn hàng mới nhất.
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="ltr:text-left rtl:text-right bg-gray-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
                Mã Đơn Hàng
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
                Trạng Thái
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
                Số Tiền
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
                Ngày Tạo
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.order_code}>
                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  {order.order_code}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                  {order.status}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                  {/* Định dạng tiền tệ */}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: order.currency || "VND",
                  }).format(order.amount)}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                  {/* Định dạng ngày giờ */}
                  {new Date(order.created_at).toLocaleString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <p className="text-gray-500 mt-4">Không tìm thấy đơn hàng nào.</p>
      )}
    </div>
  );
}