export default function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-slate-800 animate-pulse h-72">
      <div className="h-48 bg-slate-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-700 rounded w-1/2" />
        <div className="h-3 bg-slate-700 rounded w-2/3" />
      </div>
    </div>
  );
}
