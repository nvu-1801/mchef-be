export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6">
      <div className="text-center bg-white shadow-lg rounded-2xl p-10 border border-gray-200 max-w-md w-full">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-10 h-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0 3.75h.007v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800">403 – Forbidden</h1>
        <p className="mt-3 text-gray-600 leading-relaxed">
          Bạn không có quyền truy cập vào khu vực quản trị.  
          Vui lòng quay lại trang chính hoặc đăng nhập bằng tài khoản quản trị.
        </p>

        <div className="mt-6">
          <a
            href="/"
            className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-medium px-5 py-2 rounded-lg shadow-md transition-all duration-200"
          >
            ← Quay về trang chủ
          </a>
        </div>
      </div>
    </main>
  );
}
