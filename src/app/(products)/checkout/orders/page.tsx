// app/(products)/checkout/orders/page.tsx
/**
 * Trang xem lịch sử thanh toán / hóa đơn
 * Hiển thị tất cả các giao dịch (thành công hay thất bại)
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// ⛔️ Đã XÓA: import type { UserTransaction } from "@/libs/types/payment";

// 👇 SỬA 1: ĐỊNH NGHĨA TYPE DỮ LIỆU MÀ API THỰC SỰ TRẢ VỀ
type MappedTransaction = {
  id: string;
  orderCode: number | null;
  planTitle: string | null;
  amount: number;
  currency: string;
  method: string;
  type: string;
  status: string;
  reference: string | null;
  createdAt: string;
  note: string | null;
};

interface TransactionResponse {
  transactions: MappedTransaction[]; // 👈 SỬA 2: Dùng MappedTransaction
  pagination: {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
    currentPage: number;
  };
  stats: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
  };
}

export default function OrdersPage() {
  const [transactions, setTransactions] = useState<MappedTransaction[]>([]); // 👈 SỬA 3: Dùng MappedTransaction
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          limit: pagination.limit.toString(),
          offset: pagination.offset.toString(),
        });
        if (filterStatus) {
          params.append("status", filterStatus);
        }

        const res = await fetch(`/api/me/transactions?${params}`);
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const data: TransactionResponse = await res.json();

        setTransactions(data.transactions || []);
        setPagination(data.pagination);
        setStats(data.stats);
      } catch (err) {
        setError((err as Error)?.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [pagination.offset, filterStatus]); // Bỏ pagination.limit khỏi dependency array

  // (Hàm getStatusBadge không đổi)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-600"></span>
            Thành công
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
            <span className="h-2 w-2 rounded-full bg-red-600"></span>
            Thất bại
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-600"></span>
            Thành công
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
            {status}
          </span>
        );
    }
  };

  // (Hàm formatDate không đổi)
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  // (Hàm formatPrice không đổi)
  const formatPrice = (amount: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-8 px-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lịch Sử Thanh Toán</h1>
        <p className="mt-2 text-gray-600">
          Xem tất cả các giao dịch của bạn (thành công hoặc thất bại)
        </p>
      </div>

      {/* Back Link */}
      <Link
        href="/profile/me"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
      >
        ← Quay lại hồ sơ
      </Link>

      {/* Stats Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">Tổng cộng</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-700">✅ Thành công</p>
            <p className="text-2xl font-bold text-green-800">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">❌ Thất bại</p>
            <p className="text-2xl font-bold text-red-800">{stats.failed}</p>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-700">⏳ Chờ xử lý</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.completed}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 items-center">
        <label className="text-sm font-semibold text-gray-700">
          Lọc theo trạng thái:
        </label>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPagination({ ...pagination, offset: 0 }); // Reset về trang 1 khi lọc
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Tất cả</option>
          <option value="PENDING">✅ Thành công</option>
          <option value="FAILED">❌ Thất bại</option>
          <option value="COMPLETED">⏳ Chờ xử lý</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <div className="inline-flex gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-600 animate-bounce"></div>
            <div
              className="h-3 w-3 rounded-full bg-blue-600 animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="h-3 w-3 rounded-full bg-blue-600 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <p className="mt-3 text-gray-600">Đang tải lịch sử thanh toán...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">❌ Lỗi: {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && transactions.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">
            {filterStatus
              ? "Không có giao dịch nào với trạng thái này"
              : "Bạn chưa có giao dịch nào"}
          </p>
          <Link
            href="/upgrade"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Nâng cấp ngay
          </Link>
        </div>
      )}

      {/* Transactions Table */}
      {!loading && !error && transactions.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Ngày
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Mã Tham Chiếu
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Số Tiền
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Loại
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Trạng Thái
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Ghi Chú
                </th>
              </tr>
            </thead>
            {/* 👇 SỬA 4: CẬP NHẬT TÊN TRƯỜNG TRONG BẢNG 👇 */}
            <tbody>
              {transactions.map((trans, idx) => (
                <tr
                  key={trans.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDate(trans.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">
                    {trans.reference || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {formatPrice(trans.amount, trans.currency)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {trans.type === "UPGRADE" && "📦 Nâng cấp"}
                    {trans.type === "REFUND" && "↩️ Hoàn tiền"}
                    {trans.type === "MANUAL" && "📝 Thủ công"}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(trans.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {trans.note || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* 👆 KẾT THÚC SỬA BẢNG 👆 */}
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && transactions.length > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">
            Trang {pagination.currentPage} / {pagination.totalPages} (
            {pagination.total} tổng cộng)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  offset: Math.max(0, pagination.offset - pagination.limit),
                })
              }
              disabled={pagination.offset === 0}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              ← Trước
            </button>
            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  offset: pagination.offset + pagination.limit,
                })
              }
              disabled={pagination.currentPage >= pagination.totalPages}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              Tiếp →
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">💡 Hướng dẫn:</p>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>
            ✅ <strong>Thành công</strong> - Thanh toán đã hoàn tất, gói nâng
            cấp kích hoạt
          </li>
          <li>
            ❌ <strong>Thất bại</strong> - Thanh toán không thành công, vui lòng
            thử lại
          </li>
          <li>⏳ <strong>Chờ xử lý</strong> - Thanh toán đang được xử lý</li>
        </ul>
      </div>
    </div>
  );
}