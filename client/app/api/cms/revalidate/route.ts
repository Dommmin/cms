import { Buffer } from 'node:buffer';
import { createHmac, timingSafeEqual } from 'node:crypto';

import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type CmsWebhookPayload = {
    event?: string;
    data?: {
        slug?: string;
        slug_translations?: Record<string, string>;
        path?: string;
    };
};

const PAGE_EVENTS = new Set(['page.published', 'page.unpublished']);

export async function POST(request: NextRequest) {
    const secret = process.env.CMS_REVALIDATION_SECRET;

    if (!secret) {
        return NextResponse.json(
            { error: 'Revalidation secret is not configured' },
            { status: 503 },
        );
    }

    const body = await request.text();

    if (!hasValidSignature(body, secret, request.headers)) {
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 },
        );
    }

    const payload = parsePayload(body);

    if (!payload || !payload.event || !PAGE_EVENTS.has(payload.event)) {
        return NextResponse.json(
            { error: 'Unsupported webhook event' },
            { status: 400 },
        );
    }

    const tags = getPageTags(payload);
    const paths = getPagePaths(payload);

    for (const tag of tags) {
        revalidateTag(tag, 'max');
    }

    for (const path of paths) {
        revalidatePath(path);
    }

    return NextResponse.json({
        revalidated: true,
        event: payload.event,
        tags: [...tags],
        paths: [...paths],
    });
}

function hasValidSignature(
    body: string,
    secret: string,
    headers: Headers,
): boolean {
    const signature = headers.get('x-webhook-signature');

    if (!signature?.startsWith('sha256=')) {
        return false;
    }

    const expected = createHmac('sha256', secret).update(body).digest('hex');
    const actual = signature.slice('sha256='.length);

    try {
        return timingSafeEqual(
            Buffer.from(actual, 'hex'),
            Buffer.from(expected, 'hex'),
        );
    } catch {
        return false;
    }
}

function parsePayload(body: string): CmsWebhookPayload | null {
    try {
        return JSON.parse(body) as CmsWebhookPayload;
    } catch {
        return null;
    }
}

function getPageTags(payload: CmsWebhookPayload): Set<string> {
    const tags = new Set<string>();
    const slugs = getSlugs(payload);

    for (const slug of slugs) {
        tags.add(`page:${slug}`);
    }

    return tags;
}

function getPagePaths(payload: CmsWebhookPayload): Set<string> {
    const paths = new Set<string>();
    const data = payload.data;

    if (data?.path) {
        paths.add(normalizePath(data.path));
    }

    if (data?.slug) {
        paths.add(normalizePath(data.slug));
    }

    for (const [locale, slug] of Object.entries(
        data?.slug_translations ?? {},
    )) {
        paths.add(normalizePath(`${locale}/${slug}`));
    }

    return paths;
}

function getSlugs(payload: CmsWebhookPayload): Set<string> {
    const slugs = new Set<string>();
    const data = payload.data;

    if (data?.slug) {
        slugs.add(data.slug);
    }

    for (const slug of Object.values(data?.slug_translations ?? {})) {
        slugs.add(slug);
    }

    return slugs;
}

function normalizePath(path: string): string {
    return path.startsWith('/') ? path : `/${path}`;
}
