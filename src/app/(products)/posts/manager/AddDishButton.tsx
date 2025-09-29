"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import DishForm from "@/components/dishes/DishForm";

type Category = { id: string; name: string };

export default function AddDishButton({
  categories,
  action,
}: {
  categories: Category[];
  action: (formData: FormData) => Promise<void> | void; // server action (Promise<void>)
}) {
  const [open, setOpen] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm px-3 py-1.5 rounded-full border shadow-sm hover:shadow bg-black text-white hover:bg-black/90"
      >
        + Đăng món mới
      </button>

      <dialog
        ref={dialogRef}
        // backdrop mờ + dialog bo tròn
        className="backdrop:bg-black/40 rounded-2xl w-[92vw] max-w-2xl p-0"
        onClose={() => {
          setOpen(false);
          setSubmitted(false);
        }}
      >
        {/* card container để kiểm soát chiều cao + cuộn nội dung */}
        <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border bg-white shadow-xl">
          {/* header dính trên */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-rose-50 to-sky-50">
            <h2 className="font-semibold text-gray-900">Đăng món mới</h2>
            <button
              className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
            >
              Đóng
            </button>
          </div>

          {/* body có thể cuộn */}
          <div className="px-4 py-4 overflow-y-auto">
            <DishForm
              action={async (fd) => {
                // gọi server action thật
                await action(fd);
                // đánh dấu đã submit để auto-close
                setSubmitted(true);
                // đóng & refresh sau một nhịp nhỏ cho cảm giác mượt
                setTimeout(() => {
                  setOpen(false);
                  router.refresh();
                }, 80);
              }}
              categories={categories}
              submitText="Đăng món"
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
