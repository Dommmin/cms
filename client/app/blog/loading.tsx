import { Skeleton } from '@/components/ui/skeleton';

export default function BlogLoading() {
    return (
        <div className="store-wide-shell animate-fade-in mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
            {/* Title / Subtitle Skeleton */}
            <div className="mb-10 text-center">
                <h1 className="flex justify-center text-4xl font-bold">
                    <Skeleton className="h-10 w-24" />
                </h1>
                <p className="mt-3 flex justify-center">
                    <Skeleton className="h-5 w-64" />
                </p>
            </div>

            {/* Categories Filter Skeletons */}
            <div className="border-border mb-8 flex flex-wrap justify-between gap-4 border-b pb-6">
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-9 w-16 rounded-full" />
                    <Skeleton className="h-9 w-24 rounded-full" />
                    <Skeleton className="h-9 w-20 rounded-full" />
                    <Skeleton className="h-9 w-28 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-10" />
                    <div className="flex gap-1">
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                </div>
            </div>

            {/* Blog Post Grid Skeletons */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="border-border bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm"
                    >
                        {/* Featured Image aspect-video */}
                        <Skeleton className="aspect-video w-full rounded-b-none" />

                        <div className="flex flex-1 flex-col gap-3 p-5">
                            {/* Category Badge */}
                            <Skeleton className="h-3 w-1/4 rounded-full" />

                            {/* Title lines */}
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-[92%]" />
                                <Skeleton className="h-5 w-[70%]" />
                            </div>

                            {/* Excerpt/Description lines */}
                            <div className="mt-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[95%]" />
                                <Skeleton className="h-4 w-[60%]" />
                            </div>

                            {/* Date */}
                            <Skeleton className="mt-auto h-3.5 w-28 pt-4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
