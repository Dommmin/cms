'use client';
import { useEffect, useState } from 'react';

interface HeaderClientProps {
    top: React.ReactNode;
    bottom: React.ReactNode;
    className?: string;
}

export function HeaderClient({
    top,
    bottom,
    className = '',
}: HeaderClientProps) {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia('(min-width: 768px)');

        const handler = () => {
            setCollapsed(mql.matches && window.scrollY > 20);
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
                collapsed ? 'shadow-sm' : ''
            } ${className}`}
        >
            <div className="relative" style={{ zIndex: 60 }}>
                <div
                    className={`transition-[padding] duration-300 ${
                        collapsed ? 'py-1' : 'py-3'
                    }`}
                >
                    {top}
                </div>
            </div>
            <div className="relative" style={{ zIndex: 10 }}>
                <div
                    className="transition-[grid-template-rows] duration-300 ease-out"
                    style={{
                        display: 'grid',
                        gridTemplateRows: collapsed ? '0fr' : '1fr',
                    }}
                >
                    <div className="min-h-0 overflow-hidden">{bottom}</div>
                </div>
            </div>
        </header>
    );
}
