export default function BlogPostLoading() {
    return (
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-3">
                <div className="bg-muted inline-block h-6 w-24 animate-pulse rounded-full" />
            </div>

            <div className="bg-muted h-10 w-3/4 animate-pulse rounded" />

            <div className="mt-3 flex items-center gap-4 text-sm">
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                <div className="bg-muted h-4 w-16 animate-pulse rounded" />
            </div>

            <div className="bg-muted mt-2 h-4 w-40 animate-pulse rounded" />

            <div className="bg-muted mt-8 aspect-video animate-pulse rounded-xl" />

            <div className="border-border mt-8 border-y bg-gray-100 py-4 dark:bg-gray-800">
                <div className="space-y-2">
                    <div className="bg-muted h-3 w-48 animate-pulse rounded" />
                    <div className="bg-muted h-3 w-36 animate-pulse rounded" />
                    <div className="bg-muted ml-4 h-3 w-40 animate-pulse rounded" />
                </div>
            </div>

            <div className="mt-8 space-y-5">
                <div className="space-y-2">
                    <div className="bg-muted h-4 w-full animate-pulse rounded" />
                    <div className="bg-muted h-4 w-full animate-pulse rounded" />
                    <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
                </div>

                <div className="bg-muted h-6 w-1/3 animate-pulse rounded" />

                <div className="space-y-2">
                    <div className="bg-muted h-4 w-full animate-pulse rounded" />
                    <div className="bg-muted h-4 w-full animate-pulse rounded" />
                    <div className="bg-muted h-4 w-4/5 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
                </div>

                <div className="bg-muted h-6 w-1/2 animate-pulse rounded" />

                <div className="space-y-2">
                    <div className="bg-muted h-4 w-full animate-pulse rounded" />
                    <div className="bg-muted h-4 w-full animate-pulse rounded" />
                    <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                </div>
            </div>

            <div className="border-border mt-10 border-t pt-6">
                <div className="bg-muted h-4 w-14 animate-pulse rounded" />
                <div className="bg-muted mt-1 h-5 w-32 animate-pulse rounded" />
                <div className="bg-muted mt-1 h-4 w-40 animate-pulse rounded" />
            </div>
        </article>
    );
}
