// app/chefs/[id]/ui/ChefHeader.tsx
"use client";

type Props = {
  chef: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    verified_at: string | null;
    rating_avg: number | null;
    rating_count: number | null;
    dishes_count: number | null;
    comments_count: number | null;
  };
};

export default function ChefHeader({ chef }: Props) {
  const avatar =
    chef.avatar_url && /^https?:\/\//i.test(chef.avatar_url)
      ? chef.avatar_url
      : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
          chef.display_name ?? "C"
        )}`;

  const name = chef.display_name ?? "Chef";
  const avg = Number(chef.rating_avg ?? 0);
  const stars = toStars(avg);

  return (
    <header className="rounded-3xl border border-gray-200 shadow-lg overflow-hidden bg-white">
      <div className="bg-gradient-to-r from-orange-400 via-yellow-300 to-rose-300 h-28 relative">
        <div className="absolute bottom-0 py-2 left-6 flex items-center gap-4">
          <img
            src={avatar}
            className="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
            alt={`${name}'s avatar`}
          />
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow">{name}</h1>
            {chef.verified_at && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-100 bg-emerald-600 px-2 py-0.5 rounded-full shadow">
                ✅ Verified Chef
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 px-6 pb-4">
        <div className="text-sm text-gray-700 flex flex-wrap gap-3 items-center">
          <span title={`${avg.toFixed(1)}/5`} className="flex items-center gap-1">
            ⭐ {stars} <span className="font-medium">{avg.toFixed(1)}</span>
          </span>
          <span>· {chef.rating_count ?? 0} ratings</span>
          <span>· {chef.dishes_count ?? 0} dishes</span>
          <span>· {chef.comments_count ?? 0} comments</span>
        </div>

        {chef.bio && (
          <p className="mt-3 text-sm text-gray-600 italic max-w-3xl">
            “{chef.bio}”
          </p>
        )}
      </div>
    </header>
  );
}

function toStars(avg: number) {
  const full = Math.floor(avg);
  const half = avg - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}
