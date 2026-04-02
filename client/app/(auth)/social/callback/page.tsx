'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import type { SocialProvider } from '@/api/auth';
import { useSocialCallback } from '@/hooks/use-auth';
import { useLocalePath } from '@/hooks/use-locale';

export default function SocialCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const lp = useLocalePath();
    const called = useRef(false);

    const provider = (searchParams.get('provider') ??
        'google') as SocialProvider;
    const code = searchParams.get('code') ?? '';

    const { mutate: handleCallback, error } = useSocialCallback(provider);

    useEffect(() => {
        if (!code || called.current) return;
        called.current = true;

        handleCallback(code, {
            onSuccess: () => {
                router.push(lp('/account'));
            },
            onError: () => {
                router.push(lp('/login'));
            },
        });
    }, [code, handleCallback, lp, router]);

    if (error) {
        return (
            <div className="mx-auto max-w-sm px-4 py-24 text-center">
                <p className="text-destructive">
                    Authentication failed. Redirecting…
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-sm px-4 py-24 text-center">
            <Loader2 className="text-muted-foreground mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">Signing you in…</p>
        </div>
    );
}
