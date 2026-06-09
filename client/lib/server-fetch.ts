/**
 * Server-side fetch utility for Next.js Server Components.
 *
 * Resolution order:
 *  1. API_URL — Docker/k8s internal URL (e.g. http://cms-server.cms-prod.svc.cluster.local/api/v1)
 *  2. NEXT_PUBLIC_API_URL — public backend URL, baked in at build time
 *  3. Fallback for local dev without Docker
 *
 * Never import this file in Client Components ("use client").
 */

const BASE_URL =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost/api/v1';

export async function serverFetch<T>(
    path: string,
    options?: {
        locale?: string;
        /** Seconds to cache via ISR, or false for no-store. Default: 60 */
        revalidate?: number | false;
        tags?: string[];
    },
): Promise<T> {
    const locale = options?.locale;
    const separator = path.includes('?') ? '&' : '?';
    const localizedPath = locale ? `${path}${separator}locale=${locale}` : path;
    const url = `${BASE_URL}${localizedPath}`;

    const nextOpts: { revalidate?: number; tags?: string[] } = {};
    let cacheDirective: RequestInit['cache'] | undefined;

    if (options?.revalidate === false) {
        cacheDirective = 'no-store';
    } else {
        nextOpts.revalidate = options?.revalidate ?? 60;
        if (options?.tags?.length) nextOpts.tags = options.tags;
    }

    const res = await fetch(url, {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(locale ? { 'Accept-Language': locale } : {}),
        },
        signal: AbortSignal.timeout(5000),
        ...(cacheDirective ? { cache: cacheDirective } : { next: nextOpts }),
    });

    if (!res.ok) {
        throw new Error(`API error ${res.status} for ${path}`);
    }

    return res.json() as Promise<T>;
}
