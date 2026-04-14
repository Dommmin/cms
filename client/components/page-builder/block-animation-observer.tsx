'use client';
import { useEffect } from 'react';

export function BlockAnimationObserver() {
    useEffect(() => {
        const blocks =
            document.querySelectorAll<HTMLElement>('[data-animation]');

        const applyInstant = (el: HTMLElement) => {
            if (el.dataset.animationTrigger === 'on-load') {
                const delay = parseInt(el.dataset.animationDelay ?? '0');
                setTimeout(() => el.classList.add('pb-animated'), delay);
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target as HTMLElement;
                        if (el.dataset.animationTrigger !== 'on-load') {
                            const delay = parseInt(
                                el.dataset.animationDelay ?? '0',
                            );
                            setTimeout(
                                () => el.classList.add('pb-animated'),
                                delay,
                            );
                            observer.unobserve(el);
                        }
                    }
                });
            },
            { threshold: 0.1 },
        );

        blocks.forEach((block) => {
            const trigger = block.dataset.animationTrigger ?? 'on-scroll';
            if (trigger === 'on-load') {
                applyInstant(block);
            } else {
                observer.observe(block);
            }
        });

        return () => observer.disconnect();
    }, []);

    return null;
}
