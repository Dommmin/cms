'use client';
import { useEffect, useState } from 'react';

interface HeaderClientProps {
    children: React.ReactNode;
    className?: string;
}

export function HeaderClient({ children, className = '' }: HeaderClientProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    return (
        <header
            aria-label="Site header"
            className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-background/90 border-border border-b shadow-sm backdrop-blur-xl'
                    : 'bg-background/95 border-border border-b backdrop-blur'
            } ${className}`}
        >
            {children}
        </header>
    );
}
