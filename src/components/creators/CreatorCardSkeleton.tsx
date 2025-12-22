export const CreatorCardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 rounded shimmer" />
            <div className="h-4 w-24 rounded shimmer" />
            <div className="h-3 w-28 rounded shimmer" />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="px-6 pb-4 space-y-2">
        <div className="h-4 w-full rounded shimmer" />
        <div className="h-4 w-3/4 rounded shimmer" />
      </div>

      {/* Badge */}
      <div className="px-6 pb-4">
        <div className="h-6 w-20 rounded-full shimmer" />
      </div>

      {/* Stats */}
      <div className="px-6 pb-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full shimmer" />
          <div className="space-y-1">
            <div className="h-5 w-16 rounded shimmer" />
            <div className="h-3 w-12 rounded shimmer" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full shimmer" />
          <div className="space-y-1">
            <div className="h-5 w-12 rounded shimmer" />
            <div className="h-3 w-16 rounded shimmer" />
          </div>
        </div>
      </div>

      {/* Platforms */}
      <div className="px-6 pb-4">
        <div className="flex gap-3">
          <div className="h-4 w-16 rounded shimmer" />
          <div className="h-4 w-16 rounded shimmer" />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 rounded shimmer" />
          <div className="h-5 w-16 rounded shimmer" />
        </div>
      </div>
    </div>
  );
};
