'use client';
import { useEffect, useState } from 'react';

interface HeaderClientProps {
    children: React.ReactNode;
    className?: string;
}

export function HeaderClient({ children, className = '' }: HeaderClientProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia('(min-width: 768px)');

        const handler = () => {
            setScrolled(mql.matches && window.scrollY > 20);
        };

        window.addEventListener('scroll', handler, { passive: true });
        handler();

        mql.addEventListener('change', handler);
        return () => {
            window.removeEventListener('scroll', handler);
            mql.removeEventListener('change', handler);
        };
    }, []);

    return (
        <header
            aria-label="Site header"
            className={`border-border bg-background/95 sticky top-0 z-50 border-b backdrop-blur transition-shadow duration-300 ${
                scrolled ? 'shadow-sm' : ''
            } ${className}`}
        >
            <div
                className={`transition-[padding] duration-300 ${
                    scrolled ? 'py-1' : 'py-3'
                }`}
            >
                {children}
            </div>
        </header>
    );
}
