'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { useLocalePath } from '@/hooks/use-locale';
import { useWishlist } from '@/hooks/use-wishlist';

export function WishlistButton() {
    const { data: wishlist } = useWishlist();
    const lp = useLocalePath();
    const count = wishlist?.items?.length ?? 0;
    const [bounce, setBounce] = useState(false);
    const prevCount = useRef(count);

    useEffect(() => {
        if (count > prevCount.current) {
            const startId = setTimeout(() => setBounce(true), 0);
            const endId = setTimeout(() => setBounce(false), 600);
            prevCount.current = count;
            return () => {
                clearTimeout(startId);
                clearTimeout(endId);
            };
        }
        prevCount.current = count;
    }, [count]);

    return (
        <Link
            href={lp('/wishlist')}
            className="hover:bg-accent relative inline-flex h-9 w-9 items-center justify-center rounded-md"
            aria-label={`Wishlist${count > 0 ? ` (${count})` : ''}`}
        >
            <Heart className="h-5 w-5" aria-hidden="true" />
            {count > 0 && (
                <span
                    className={`bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] leading-none font-bold transition-transform duration-150 ${bounce ? 'scale-125' : 'scale-100'}`}
                >
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}
