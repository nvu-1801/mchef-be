// components/upgrade/PillTab.tsx
"use client";

export default function PillTab({
  items,
  value,
  onChange,
}: {
  items: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-xl bg-gray-100 p-1">
      {items.map((it) => {
        const active = value === it.key;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              active ? "bg-white shadow-sm text-violet-700" : "text-gray-600 hover:text-black"
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
