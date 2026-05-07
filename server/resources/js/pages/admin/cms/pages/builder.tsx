import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import * as PageApprovalController from '@/actions/App/Http/Controllers/Admin/Cms/PageApprovalController';
import * as PageBuilderController from '@/actions/App/Http/Controllers/Admin/Cms/PageBuilderController';
import * as PageController from '@/actions/App/Http/Controllers/Admin/Cms/PageController';
import * as SectionTemplateController from '@/actions/App/Http/Controllers/Admin/Cms/SectionTemplateController';
import type { ApprovalStatus, Section } from '@/features/page-builder';
import { PageBuilder } from '@/features/page-builder';
import AppLayout from '@/layouts/app-layout';
import { resolveLocalizedText } from '@/lib/localized-text';
import type { BreadcrumbItem } from '@/types';
import type { BuilderPageProps } from './builder.types';

const AUTO_SAVE_DEBOUNCE_MS = 5_000;
const AUTO_SAVE_MAX_WAIT_MS = 60_000;

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
    const [pageVersion, setPageVersion] = useState<number>(page.version ?? 0);
    const [scheduledPublishAt, setScheduledPublishAt] = useState<string | null>(
        page.scheduled_publish_at ?? null,
    );
    const [scheduledUnpublishAt, setScheduledUnpublishAt] = useState<
        string | null
    >(page.scheduled_unpublish_at ?? null);
    const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(
        (page.approval_status as ApprovalStatus) ?? 'draft',
    );

    const autoSaveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const autoSaveMaxWaitRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const isFirstRender = useRef(true);
    const localSectionsRef = useRef(localSections);
    localSectionsRef.current = localSections;

    const displayTitle = resolveLocalizedText(page.title);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'CMS', href: PageController.index.url() },
        { title: 'Pages', href: PageController.index.url() },
        { title: displayTitle, href: PageController.edit.url(page.id) },
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

    const runAutoSave = () => {
        setIsAutoSaving(true);
        axios
            .put(PageBuilderController.autosave.url(page.id), {
                snapshot: { sections: localSectionsRef.current },
                expected_version: pageVersion,
            })
            .then((res) => {
                const data = res.data as {
                    version?: number;
                    saved_at?: string;
                };
                setHasUnsavedChanges(false);
                setLastSavedAt(new Date());
                if (data.version !== undefined) {
                    setPageVersion(data.version);
                }
            })
            .catch((err) => {
                if (axios.isAxiosError(err) && err.response?.status === 409) {
                    toast.error(
                        'Conflict: this page was edited by another user. Refresh to load the latest version.',
                        { duration: 8000 },
                    );
                }
            })
            .finally(() => {
                setIsAutoSaving(false);
            });
    };

    // Auto-save: debounce 5s + maxWait 60s
    useEffect(() => {
        if (!hasUnsavedChanges) return;

        // Debounce timer — resets on every change
        if (autoSaveDebounceRef.current) {
            clearTimeout(autoSaveDebounceRef.current);
        }
        autoSaveDebounceRef.current = setTimeout(() => {
            if (autoSaveMaxWaitRef.current) {
                clearTimeout(autoSaveMaxWaitRef.current);
                autoSaveMaxWaitRef.current = null;
            }
            runAutoSave();
        }, AUTO_SAVE_DEBOUNCE_MS);

        // Max-wait timer — fires even if user keeps typing
        if (!autoSaveMaxWaitRef.current) {
            autoSaveMaxWaitRef.current = setTimeout(() => {
                if (autoSaveDebounceRef.current) {
                    clearTimeout(autoSaveDebounceRef.current);
                    autoSaveDebounceRef.current = null;
                }
                runAutoSave();
            }, AUTO_SAVE_MAX_WAIT_MS);
        }

        return () => {
            if (autoSaveDebounceRef.current) {
                clearTimeout(autoSaveDebounceRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasUnsavedChanges, localSections]);

    // Warn on browser close/refresh when there are unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!hasUnsavedChanges) return;
            e.preventDefault();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Block Inertia SPA navigation when there are unsaved changes
    useEffect(() => {
        const removeHandler = router.on('before', () => {
            if (!hasUnsavedChanges) return;
            return window.confirm('You have unsaved changes. Leave this page?');
        });
        return removeHandler;
    }, [hasUnsavedChanges]);

    const handleSectionsChange = (updatedSections: Section[]) => {
        setLocalSections(updatedSections);
    };

    const handleSave = async (updatedSections: Section[]) => {
        setLocalSections(updatedSections);
        setIsSaving(true);

        router.put(
            PageBuilderController.update.url(page.id),
            {
                snapshot: { sections: updatedSections },
                expected_version: pageVersion,
            } as Parameters<typeof router.put>[1],
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Page builder saved successfully');
                    setHasUnsavedChanges(false);
                    setLastSavedAt(new Date());
                    setPageVersion((v) => v + 1);
                },
                onError: (errors) => {
                    if (
                        (errors as Record<string, unknown>).status === 409 ||
                        Object.keys(errors).length === 0
                    ) {
                        toast.error(
                            'Conflict: this page was modified by another editor. Please refresh.',
                            { duration: 8000 },
                        );
                    } else {
                        toast.error(
                            'Failed to save page builder. Please try again.',
                        );
                    }
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
        const csrfMeta = document.querySelector<HTMLMetaElement>(
            'meta[name="csrf-token"]',
        );
        if (!csrfMeta?.content) {
            toast.error(
                'Preview unavailable: CSRF token missing. Please refresh.',
            );
            return;
        }
        const res = await fetch(PageBuilderController.previewUrl.url(page.id), {
            headers: {
                'X-CSRF-TOKEN': csrfMeta.content,
                Accept: 'application/json',
            },
        });
        if (res.ok) {
            const data = (await res.json()) as { url: string };
            window.open(data.url, '_blank');
        }
    };

    const builderData = {
        page: {
            ...page,
            title: resolveLocalizedText(page.title),
            is_published: page.is_published ?? false,
        },
        sections: localSections,
        available_sections,
        available_block_relations,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Builder - ${displayTitle}`} />

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
