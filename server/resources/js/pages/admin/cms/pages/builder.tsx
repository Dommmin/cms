import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import * as PageApprovalController from '@/actions/App/Http/Controllers/Admin/Cms/PageApprovalController';
import * as PageBuilderController from '@/actions/App/Http/Controllers/Admin/Cms/PageBuilderController';
import * as PageController from '@/actions/App/Http/Controllers/Admin/Cms/PageController';
import * as SectionTemplateController from '@/actions/App/Http/Controllers/Admin/Cms/SectionTemplateController';
import type {
    ApprovalStatus,
    PreviewDevice,
    Section,
} from '@/features/page-builder';
import { PageBuilder } from '@/features/page-builder';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { BuilderPageProps } from './builder.types';

const AUTO_SAVE_DELAY_MS = 30_000;

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
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [scheduledPublishAt, setScheduledPublishAt] = useState<string | null>(
        page.scheduled_publish_at ?? null,
    );
    const [scheduledUnpublishAt, setScheduledUnpublishAt] = useState<
        string | null
    >(page.scheduled_unpublish_at ?? null);
    const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(
        (page.approval_status as ApprovalStatus) ?? 'draft',
    );

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Track whether sections have been changed since mount (skip first render)
    const isFirstRender = useRef(true);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'CMS', href: PageController.index.url() },
        { title: 'Pages', href: PageController.index.url() },
        { title: page.title, href: PageController.edit.url(page.id) },
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

    // Mark unsaved changes whenever sections change (skip initial mount)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setHasUnsavedChanges(true);
    }, [localSections]);

    // Auto-save every 30s when there are unsaved changes
    useEffect(() => {
        if (!hasUnsavedChanges) return;

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
            setIsAutoSaving(true);
            router.put(
                PageBuilderController.update.url(page.id),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { sections: localSections as any },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setHasUnsavedChanges(false);
                        setLastSavedAt(new Date());
                        if (isSplitView) {
                            iframeRef.current?.contentWindow?.location.reload();
                        }
                    },
                    onFinish: () => {
                        setIsAutoSaving(false);
                    },
                },
            );
        }, AUTO_SAVE_DELAY_MS);

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [hasUnsavedChanges, localSections]); // eslint-disable-line react-hooks/exhaustive-deps

    // Split-view debounce auto-save (separate from the 30s timer)
    const splitViewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    useEffect(() => {
        if (!isSplitView) return;

        if (splitViewTimerRef.current) {
            clearTimeout(splitViewTimerRef.current);
        }

        splitViewTimerRef.current = setTimeout(() => {
            router.put(
                PageBuilderController.update.url(page.id),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { sections: localSections as any },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        iframeRef.current?.contentWindow?.location.reload();
                    },
                },
            );
        }, 1500);

        return () => {
            if (splitViewTimerRef.current) {
                clearTimeout(splitViewTimerRef.current);
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
            PageBuilderController.update.url(page.id),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { sections: updatedSections as any },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Page builder saved successfully');
                    setHasUnsavedChanges(false);
                    setLastSavedAt(new Date());
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

    const handleScheduleSave = (
        publishAt: string | null,
        unpublishAt: string | null,
    ) => {
        router.put(
            PageBuilderController.schedule.url(page.id),
            {
                scheduled_publish_at: publishAt,
                scheduled_unpublish_at: unpublishAt,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setScheduledPublishAt(publishAt);
                    setScheduledUnpublishAt(unpublishAt);
                    toast.success('Schedule saved.');
                },
                onError: () => {
                    toast.error('Failed to save schedule.');
                },
            },
        );
    };

    const handleSaveTemplate = (
        name: string,
        description: string,
        category: string,
        isGlobal: boolean,
    ) => {
        router.post(
            SectionTemplateController.store.url(),
            {
                name,
                description,
                category,
                is_global: isGlobal,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                snapshot: JSON.parse(JSON.stringify(localSections)) as any,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Template saved!');
                },
                onError: () => {
                    toast.error('Failed to save template.');
                },
            },
        );
    };

    const handleSubmitForReview = () => {
        router.post(
            PageApprovalController.submitForReview.url(page.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setApprovalStatus('in_review');
                    toast.success('Submitted for review.');
                },
                onError: () => toast.error('Failed to submit for review.'),
            },
        );
    };

    const handleApprove = () => {
        router.post(
            PageApprovalController.approve.url(page.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setApprovalStatus('approved');
                    toast.success('Page approved.');
                },
                onError: () => toast.error('Failed to approve page.'),
            },
        );
    };

    const handleReject = (note: string) => {
        router.post(
            PageApprovalController.reject.url(page.id),
            { note },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setApprovalStatus('draft');
                    toast.success('Page rejected and returned to draft.');
                },
                onError: () => toast.error('Failed to reject page.'),
            },
        );
    };

    const handlePreview = () => {
        window.open(PageBuilderController.preview.url(page.id), '_blank');
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
                        hasUnsavedChanges={hasUnsavedChanges}
                        lastSavedAt={lastSavedAt}
                        scheduledPublishAt={scheduledPublishAt}
                        scheduledUnpublishAt={scheduledUnpublishAt}
                        approvalStatus={approvalStatus}
                        onScheduleSave={handleScheduleSave}
                        onSaveTemplate={handleSaveTemplate}
                        onSubmitForReview={handleSubmitForReview}
                        onApprove={handleApprove}
                        onReject={handleReject}
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
                                src={PageBuilderController.preview.url(page.id)}
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
