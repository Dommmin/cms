export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="bg-muted mx-auto h-10 w-24 animate-pulse rounded" />
        <div className="bg-muted mx-auto mt-2 h-5 w-56 animate-pulse rounded" />
      </div>

      <div className="mb-8 flex justify-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-8 w-20 animate-pulse rounded-full" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-border bg-card overflow-hidden rounded-xl border">
            <div className="bg-muted aspect-video animate-pulse" />
            <div className="space-y-2 p-4">
              <div className="bg-muted h-3 w-1/4 animate-pulse rounded" />
              <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
              <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
              <div className="bg-muted mt-2 h-3 w-1/3 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
