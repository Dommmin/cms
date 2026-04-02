'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';

import { useMe } from '@/hooks/use-auth';
import { useLocalePath } from '@/hooks/use-locale';
import { useWishlist } from '@/hooks/use-wishlist';

export function WishlistButton() {
    const { data: user } = useMe();
    const { data: wishlist } = useWishlist();
    const lp = useLocalePath();
    const count = wishlist?.items?.length ?? 0;

    if (!user) return null;

    return (
        <Link
            href={lp('/account/wishlist')}
            className="hover:bg-accent relative inline-flex h-9 w-9 items-center justify-center rounded-md"
            aria-label={`Wishlist${count > 0 ? ` (${count})` : ''}`}
        >
            <Heart className="h-5 w-5" />
            {count > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] leading-none font-bold">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}
