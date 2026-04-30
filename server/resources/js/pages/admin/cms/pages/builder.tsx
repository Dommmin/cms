import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import * as PageApprovalController from '@/actions/App/Http/Controllers/Admin/Cms/PageApprovalController';
import * as PageBuilderController from '@/actions/App/Http/Controllers/Admin/Cms/PageBuilderController';
import * as PageController from '@/actions/App/Http/Controllers/Admin/Cms/PageController';
import * as SectionTemplateController from '@/actions/App/Http/Controllers/Admin/Cms/SectionTemplateController';
import type { ApprovalStatus, Section } from '@/features/page-builder';
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

    const handlePreview = async () => {
        const token = (
            document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
        )?.content;
        const res = await fetch(PageBuilderController.previewUrl.url(page.id), {
            headers: {
                'X-CSRF-TOKEN': token ?? '',
                Accept: 'application/json',
            },
        });
        if (res.ok) {
            const data = (await res.json()) as { url: string };
            window.open(data.url, '_blank');
        }
    };

    // Always use localSections so unsaved changes survive any state toggle
    const builderData = {
        page: { ...page, is_published: page.is_published ?? false },
        sections: localSections,
        available_sections,
        available_block_relations,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Builder - ${page.title}`} />

            <div>
                <PageBuilder
                    data={builderData}
                    onSave={handleSave}
                    onPreview={handlePreview}
                    onChange={handleSectionsChange}
                    isSaving={isSaving || isAutoSaving}
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
        </AppLayout>
    );
}
