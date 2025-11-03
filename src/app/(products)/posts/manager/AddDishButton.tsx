"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import DishForm from "@/components/home/DishForm";

type Category = { id: string; name: string };

export default function AddDishButton({
  categories,
  action,
}: {
  categories: Category[];
  action: (formData: FormData) => Promise<void> | void;
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
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl transition"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Đăng món mới
      </button>

      <dialog
        ref={dialogRef}
        className="backdrop:bg-black/60 backdrop:backdrop-blur-sm rounded-3xl w-[92vw] max-w-2xl p-0 shadow-2xl
                   fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   m-0 max-h-[90vh]"
        onClose={() => {
          setOpen(false);
          setSubmitted(false);
        }}
      >
        <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-3xl border bg-white">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-500/30">
                🍳
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Đăng món mới
              </h2>
            </div>
            <button
              className="rounded-xl border-2 border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
            >
              ✕ Đóng
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 overflow-y-auto">
            <DishForm
              action={async (fd) => {
                await action(fd);
                setSubmitted(true);
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
