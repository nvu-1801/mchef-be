// app/chefs/[id]/ui/RatingItem.tsx
"use client";

type Props = {
  rating: {
    stars: number | null;
    comment: string | null;
    created_at: string | null;
    rater:
      | { id: string; display_name: string | null; avatar_url: string | null }
      | null;
  };
};

export default function RatingItem({ rating }: Props) {
  const s = Math.max(0, Math.min(5, Number(rating.stars ?? 0)));
  const avatar =
    rating.rater?.avatar_url && /^https?:\/\//i.test(rating.rater.avatar_url)
      ? rating.rater.avatar_url
      : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
          rating.rater?.display_name ?? "U"
        )}`;

  return (
    <li className="rounded-xl border p-4">
      <div className="flex items-start gap-3">
        <img src={avatar} className="h-9 w-9 rounded-full border" alt="" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">
              {rating.rater?.display_name ?? "User"}
            </div>
            <div className="text-xs text-amber-600">{"★".repeat(s)}{"☆".repeat(5 - s)}</div>
            {rating.created_at && (
              <time className="text-xs text-gray-500">
                {new Date(rating.created_at).toLocaleDateString()}
              </time>
            )}
          </div>
          {rating.comment && (
            <p className="mt-1 text-sm text-gray-700">{rating.comment}</p>
          )}
        </div>
      </div>
    </li>
  );
}
