// app/chefs/ui/PublicChefs.tsx
"use client";

import { useMemo, useState } from "react";

type UserObj = { id: string; display_name: string | null; avatar_url: string | null };
type UserMini = UserObj | UserObj[] | null | undefined;

type ChefRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  can_post: boolean | null;
  is_active: boolean | null;
  verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  user?: UserMini; // có thể là object hoặc array
};

// helper: chuẩn hoá user về object
function asUser(u: UserMini): UserObj | null {
  if (!u) return null;
  return Array.isArray(u) ? (u[0] ?? null) : u;
}

export default function PublicChefs({ items }: { items: ChefRow[] }) {
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return items;
    return items.filter((c) => {
      const u = asUser(c.user);
      const name = c.display_name ?? u?.display_name ?? "";
      return name.toLowerCase().includes(key);
    });
  }, [q, items]);

  return (
    <>
      <div className="mt-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search chefs…"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <ChefCard key={c.id} c={c} />
        ))}
        {list.length === 0 && (
          <div className="col-span-full rounded-xl border p-6 text-sm text-gray-600">
            No chefs found.
          </div>
        )}
      </div>
    </>
  );
}

function ChefCard({ c }: { c: ChefRow }) {
  const u = asUser(c.user);

  const avatar =
    (c?.avatar_url && /^https?:\/\//i.test(c.avatar_url))
      ? c.avatar_url
      : (u?.avatar_url && /^https?:\/\//i.test(u.avatar_url))
      ? u.avatar_url
      : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
          c.display_name ?? u?.display_name ?? "C"
        )}`;

  const name = c.display_name ?? u?.display_name ?? "Chef";

  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <img src={avatar} className="h-12 w-12 rounded-full border" alt="" />
        <div className="min-w-0">
          <div className="truncate font-medium">{name}</div>
          {c.verified_at && (
            <div className="mt-0.5 text-xs text-emerald-600">Verified</div>
          )}
        </div>
      </div>

      {c.bio && (
        <div className="px-4 pb-3 text-sm text-gray-700 line-clamp-3">{c.bio}</div>
      )}

      <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
        <div className="text-xs text-gray-500">
          {c.can_post ? "Can post" : "Read only"}
        </div>
        <a
          href={`/chefs/${c.id}`}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-white"
        >
          View
        </a>
      </div>
    </div>
  );
}
