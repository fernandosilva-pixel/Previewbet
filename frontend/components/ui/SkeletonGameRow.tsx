export function SkeletonGameRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
      <div className="skeleton h-4 w-16 rounded" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-32 rounded" />
        <div className="skeleton h-3 w-28 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-10 w-16 rounded" />
        <div className="skeleton h-10 w-16 rounded" />
        <div className="skeleton h-10 w-16 rounded" />
      </div>
      <div className="skeleton h-4 w-20 rounded" />
    </div>
  );
}

export function SkeletonGameList() {
  return (
    <div className="bg-bg-card rounded-lg overflow-hidden">
      <div className="skeleton h-8 w-full rounded-none" />
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonGameRow key={i} />
      ))}
    </div>
  );
}
