import Link from 'next/link';

export default function OfflinePage() {
    return (
        <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-2xl font-semibold text-white">
                !
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
                You are offline
            </h1>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
                Check your connection and try again. Some previously opened
                pages may still be available.
            </p>
            <Link
                href="/"
                className="mt-8 rounded-md bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700"
            >
                Back to store
            </Link>
        </section>
    );
}
