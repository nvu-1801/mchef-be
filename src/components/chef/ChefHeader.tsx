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
    <header className="rounded-2xl border shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 h-24" />
      <div className="p-4 sm:p-6 -mt-10 flex items-start gap-4">
        <img
          src={avatar}
          className="h-20 w-20 rounded-full border-4 border-white shadow-md bg-white"
          alt=""
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-semibold">{name}</h1>
            {chef.verified_at && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                Verified
              </span>
            )}
          </div>

          <div className="mt-1 text-sm text-gray-600">
            <span title={`${avg.toFixed(1)}/5`}>
              {stars} {avg.toFixed(1)}
            </span>
            <span className="mx-2">·</span>
            <span>{chef.rating_count ?? 0} ratings</span>
            <span className="mx-2">·</span>
            <span>{chef.dishes_count ?? 0} dishes</span>
            <span className="mx-2">·</span>
            <span>{chef.comments_count ?? 0} comments</span>
          </div>

          {chef.bio && (
            <p className="mt-2 max-w-3xl text-sm text-gray-700">{chef.bio}</p>
          )}
        </div>
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
