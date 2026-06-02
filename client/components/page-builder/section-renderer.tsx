'use client';

import { useEffect, useRef, useState } from 'react';

import { AnimatedSection } from './animated-section';
import { BlockRenderer } from './block-renderer';
import { BlockErrorBoundary } from './error-boundary';
import type { SectionRendererProps } from './section-renderer.types';

function sanitizeCss(css: string): string {
    return css
        .replace(/<\s*\/\s*style\b[^>]*>/gi, '')
        .replace(/<\s*script\b[^>]*>/gi, '')
        .replace(/@import\b/gi, '')
        .replace(/behavior\s*:/gi, '')
        .replace(/expression\s*\(/gi, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/vbscript\s*:/gi, '')
        .replace(/url\s*\(\s*['"]?\s*data\s*:/gi, 'url(');
}

const variantStyles: Record<string, string> = {
    light: 'bg-[var(--background)] text-[var(--foreground)]',
    dark: 'bg-[var(--section-dark-bg,var(--foreground))] text-[var(--section-dark-text,var(--background))]',
    muted: 'bg-[var(--muted)] text-[var(--foreground)]',
    brand: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
    hero: 'bg-[var(--section-dark-bg,var(--foreground))] text-[var(--section-dark-text,var(--background))]',
};

const layoutContainerStyles: Record<string, string> = {
    contained:
        'mx-auto max-w-[var(--container-max-width,80rem)] px-4 sm:px-6 lg:px-8',
    'full-width': 'w-full',
    flush: 'w-full',
    'two-col':
        'mx-auto max-w-[var(--container-max-width,80rem)] px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8',
    'three-col':
        'mx-auto max-w-[var(--container-max-width,80rem)] px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8',
};

const sectionPaddingStyles: Record<string, string> = {
    none: 'py-0',
    sm: 'py-6',
    md: 'py-12',
    lg: 'py-[var(--section-padding-y,5rem)]',
    xl: 'py-28',
};

function SectionContent({
    section,
    isPreview,
    pageId,
    adminBaseUrl,
}: SectionRendererProps) {
    const variant = section.variant ?? 'light';
    const layout = section.layout ?? 'contained';

    const settings = section.settings as Record<string, string> | null;
    const padding = settings?.padding ?? 'lg';
    const animation = settings?.animation ?? 'none';

    const sectionBg = variantStyles[variant] ?? '';
    const sectionPadding =
        layout === 'flush' ? '' : (sectionPaddingStyles[padding] ?? 'py-12');

    const containerClass =
        layoutContainerStyles[layout] ?? layoutContainerStyles.contained;

    const activeBlocks = section.blocks.filter((b) => b.is_active);

    const sectionClassName = sectionBg + ' ' + sectionPadding;
    const sectionProps = {
        'data-section-type': section.section_type,
        'data-section-id': section.id,
    };

    const inner = (
        <div className={containerClass}>
            {activeBlocks.map((block) =>
                isPreview && pageId && adminBaseUrl ? (
                    <div
                        key={block.id}
                        className="w-full"
                        id={
                            (block.configuration._custom_id as string) ||
                            undefined
                        }
                    >
                        <BlockErrorBoundary blockName={block.type}>
                            <BlockRenderer block={block} />
                        </BlockErrorBoundary>
                    </div>
                ) : (
                    <div
                        key={block.id}
                        className={
                            'w-full ' +
                            ((block.configuration._custom_classes as string) ||
                                '')
                        }
                        id={
                            (block.configuration._custom_id as string) ||
                            undefined
                        }
                        data-animation={
                            ((
                                block.configuration._animation as Record<
                                    string,
                                    unknown
                                >
                            )?.type as string) || undefined
                        }
                        data-animation-duration={
                            ((
                                block.configuration._animation as Record<
                                    string,
                                    unknown
                                >
                            )?.duration as string) || undefined
                        }
                        data-animation-delay={
                            ((
                                block.configuration._animation as Record<
                                    string,
                                    unknown
                                >
                            )?.delay as number) > 0
                                ? String(
                                      (
                                          block.configuration
                                              ._animation as Record<
                                              string,
                                              unknown
                                          >
                                      )?.delay,
                                  )
                                : undefined
                        }
                        data-animation-trigger={
                            ((
                                block.configuration._animation as Record<
                                    string,
                                    unknown
                                >
                            )?.trigger as string) || undefined
                        }
                    >
                        {(block.configuration._custom_css as string) && (
                            <style
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeCss(
                                        block.configuration
                                            ._custom_css as string,
                                    ),
                                }}
                            />
                        )}
                        <BlockErrorBoundary blockName={block.type}>
                            <BlockRenderer block={block} />
                        </BlockErrorBoundary>
                    </div>
                ),
            )}
        </div>
    );

    if (animation && animation !== 'none') {
        return (
            <AnimatedSection
                animation={animation}
                className={sectionClassName}
                {...sectionProps}
            >
                {inner}
            </AnimatedSection>
        );
    }

    return (
        <section className={sectionClassName} {...sectionProps}>
            {inner}
        </section>
    );
}

export function SectionLazyWrapper(props: SectionRendererProps) {
    const section = props.section;
    const settings = section.settings as Record<string, string> | null;
    const lazyLoad =
        settings?.lazy_load === 'true' || settings?.lazy_load === '1';

    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!lazyLoad) return;
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' },
        );

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [lazyLoad]);

    if (!lazyLoad) {
        return <SectionContent {...props} />;
    }

    const variant = section.variant ?? 'light';
    const layout = section.layout ?? 'contained';
    const padding = settings?.padding ?? 'lg';
    const sectionBg = variantStyles[variant] ?? '';
    const sectionPad =
        layout === 'flush' ? '' : (sectionPaddingStyles[padding] ?? 'py-12');
    const minHeight = settings?.min_height ?? '200px';

    if (!isVisible) {
        return (
            <section
                ref={ref}
                className={sectionBg + ' ' + sectionPad}
                style={{ minHeight }}
                data-section-type={section.section_type}
                data-section-id={section.id}
            />
        );
    }

    return <SectionContent {...props} />;
}

export { SectionContent as SectionRenderer };
