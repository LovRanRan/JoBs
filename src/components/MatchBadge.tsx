export default function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? "bg-green-100 text-green-700"
      : score >= 80
      ? "bg-brand-50 text-brand-700"
      : score >= 70
      ? "bg-amber-100 text-amber-700"
      : "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {score}% match
    </span>
  );
}
