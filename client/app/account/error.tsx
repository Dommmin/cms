'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { useLocalePath } from '@/hooks/use-locale';

export default function AccountError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const lp = useLocalePath();

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
            <AlertCircle className="text-destructive mb-4 h-10 w-10" />
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground mt-2">
                Could not load your account information. Please try again.
            </p>
            <div className="mt-6 flex gap-3">
                <button
                    onClick={reset}
                    className="bg-primary text-primary-foreground rounded-xl px-5 py-2 text-sm font-semibold hover:opacity-90"
                >
                    Try again
                </button>
                <Link
                    href={lp('/login')}
                    className="border-border hover:bg-accent rounded-xl border px-5 py-2 text-sm font-semibold"
                >
                    Sign in again
                </Link>
            </div>
        </div>
    );
}
