import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

function getPublicBaseUrl(request: NextRequest): string {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL;
    }

    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') ?? 'http';

    if (host) {
        return `${protocol}://${host}`;
    }

    return `http://localhost:3000`;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const slug = searchParams.get('slug');

    if (!token || !slug) {
        return NextResponse.json(
            { error: 'Missing token or slug' },
            { status: 400 },
        );
    }

    const cookieStore = await cookies();
    cookieStore.set('page_preview_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 60,
        path: '/',
        sameSite: 'lax',
    });

    const locale = cookieStore.get('locale')?.value ?? 'en';
    const baseUrl = getPublicBaseUrl(request);
    return NextResponse.redirect(new URL(`/${locale}/${slug}`, baseUrl));
}
