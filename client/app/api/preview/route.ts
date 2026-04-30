import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

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
        maxAge: 30 * 60, // 30 minutes
        path: '/',
        sameSite: 'lax',
    });

    const locale = cookieStore.get('locale')?.value ?? 'en';
    return NextResponse.redirect(new URL(`/${locale}/${slug}`, request.url));
}
