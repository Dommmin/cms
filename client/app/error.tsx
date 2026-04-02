'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <AlertCircle className="text-destructive mb-4 h-12 w-12" />
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground mt-2 max-w-md">
                An unexpected error occurred. Please try again or contact
                support if the problem persists.
            </p>
            <button
                onClick={reset}
                className="bg-primary text-primary-foreground mt-6 rounded-xl px-6 py-2.5 font-semibold hover:opacity-90"
            >
                Try again
            </button>
        </div>
    );
}
