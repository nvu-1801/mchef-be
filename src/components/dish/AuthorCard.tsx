"use client";
import React from "react";
import Image from "next/image";

type Creator = {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
};

type Props = {
  avatar: string;
  creator: Creator;
};

export default function AuthorCard({ avatar, creator }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-violet-200 shadow-lg flex-shrink-0">
          <Image
            src={avatar}
            alt={creator.display_name ?? "Chef"}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">Đầu bếp</div>
          <div className="font-bold text-gray-900">
            {creator.display_name ?? "Anonymous"}
          </div>
        </div>
        <button className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-xl transition">
          Follow
        </button>
      </div>
    </div>
  );
}
