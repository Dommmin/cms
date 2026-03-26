import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { PageBuilder } from '@/features/page-builder';
import type { PreviewDevice, Section } from '@/features/page-builder';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { BuilderPageProps } from './builder.types';

export default function BuilderPage({
    page,
    sections,
    available_sections,
    available_block_relations,
}: BuilderPageProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [isSplitView, setIsSplitView] = useState(false);
    const [previewDevice, setPreviewDevice] =
        useState<PreviewDevice>('desktop');
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [localSections, setLocalSections] = useState<Section[]>(sections);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'CMS', href: '/admin/cms' },
        { title: 'Pages', href: '/admin/cms/pages' },
        { title: page.title, href: `/admin/cms/pages/${page.id}` },
        { title: 'Builder', href: '' },
    ];

    // Scroll to block when ?block={id} is in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const blockId = params.get('block');
        if (!blockId) return;

        const tryScroll = () => {
            const el = document.querySelector<HTMLElement>(
                `[data-block-id="${blockId}"]`,
            );
            if (!el) return false;
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2');
            setTimeout(
                () =>
                    el.classList.remove(
                        'ring-2',
                        'ring-indigo-500',
                        'ring-offset-2',
                    ),
                2500,
            );
            return true;
        };

        // Retry a few times — the block cards render after sections are mounted
        let attempts = 0;
        const interval = setInterval(() => {
            if (tryScroll() || ++attempts >= 10) clearInterval(interval);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    // Auto-save with debounce when in split view

    useEffect(() => {
        if (!isSplitView) return;

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
            setIsAutoSaving(true);
            router.put(
                `/admin/cms/pages/${page.id}/builder`,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { sections: localSections as any },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        iframeRef.current?.contentWindow?.location.reload();
                    },
                    onFinish: () => {
                        setIsAutoSaving(false);
                    },
                },
            );
        }, 1500);

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [localSections, isSplitView]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSectionsChange = (updatedSections: Section[]) => {
        setLocalSections(updatedSections);
    };

    const handleSave = async (updatedSections: Section[]) => {
        setLocalSections(updatedSections);
        setIsSaving(true);

        router.put(
            `/admin/cms/pages/${page.id}/builder`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { sections: updatedSections as any },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Page builder saved successfully');
                    if (isSplitView) {
                        iframeRef.current?.contentWindow?.location.reload();
                    }
                },
                onError: (errors) => {
                    toast.error(
                        'Failed to save page builder. Please try again.',
                    );
                    console.error('Save errors:', errors);
                },
                onFinish: () => {
                    setIsSaving(false);
                },
            },
        );
    };

    const handlePreview = () => {
        window.open(`/admin/cms/pages/${page.id}/preview`, '_blank');
    };

    const handleToggleSplitView = () => {
        setIsSplitView((prev) => !prev);
    };

    // Always use localSections so unsaved changes survive split-view toggle
    const builderData = {
        page: { ...page, is_published: page.is_published ?? false },
        sections: localSections,
        available_sections,
        available_block_relations,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Builder - ${page.title}`} />

            {/*
             * Single layout — PageBuilder is never unmounted when toggling split
             * view. The container CSS changes but the component stays mounted,
             * preserving all unsaved state (sections, expanded panels, etc.).
             */}
            <div
                className={
                    isSplitView
                        ? 'flex h-[calc(100vh-4rem)] overflow-hidden'
                        : ''
                }
            >
                {/* Builder panel */}
                <div
                    className={
                        isSplitView ? 'w-[45%] overflow-y-auto border-r' : ''
                    }
                >
                    <PageBuilder
                        data={builderData}
                        onSave={handleSave}
                        onPreview={handlePreview}
                        onChange={handleSectionsChange}
                        isSplitView={isSplitView}
                        isSaving={isSaving || isAutoSaving}
                        previewDevice={previewDevice}
                        onToggleSplitView={handleToggleSplitView}
                        onChangeDevice={setPreviewDevice}
                    />
                </div>

                {/* Preview iframe (only rendered in split view) */}
                {isSplitView && (
                    <div className="relative flex w-[55%] flex-col items-center overflow-y-auto bg-muted/30">
                        {isAutoSaving && (
                            <div className="absolute top-3 right-3 z-10 rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground shadow backdrop-blur">
                                Auto-saving...
                            </div>
                        )}
                        <div
                            className={[
                                'h-full w-full transition-all duration-300',
                                previewDevice === 'tablet' && 'max-w-[768px]',
                                previewDevice === 'mobile' && 'max-w-[390px]',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            <iframe
                                ref={iframeRef}
                                src={`/admin/cms/pages/${page.id}/preview`}
                                className="h-full w-full border-0"
                                title="Page Preview"
                            />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
