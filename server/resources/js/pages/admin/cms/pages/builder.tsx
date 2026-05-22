import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import * as PageApprovalController from '@/actions/App/Http/Controllers/Admin/Cms/PageApprovalController';
import * as PageBuilderController from '@/actions/App/Http/Controllers/Admin/Cms/PageBuilderController';
import * as PageController from '@/actions/App/Http/Controllers/Admin/Cms/PageController';
import * as SectionTemplateController from '@/actions/App/Http/Controllers/Admin/Cms/SectionTemplateController';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ApprovalStatus, Section } from '@/features/page-builder';
import { PageBuilder } from '@/features/page-builder';
import AppLayout from '@/layouts/app-layout';
import { resolveLocalizedText } from '@/lib/localized-text';
import type { BreadcrumbItem } from '@/types';
import type { BuilderPageProps, PendingNavigation } from './builder.types';

const AUTO_SAVE_DEBOUNCE_MS = 5_000;
const AUTO_SAVE_MAX_WAIT_MS = 60_000;

export default function BuilderPage({
    page,
    sections,
    available_sections,
    available_block_relations,
    capabilities,
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
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [pendingNavigation, setPendingNavigation] =
        useState<PendingNavigation | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewUpdatedAt, setPreviewUpdatedAt] = useState<Date | null>(null);
    const [isPreviewRefreshing, setIsPreviewRefreshing] = useState(false);

    const autoSaveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const autoSaveMaxWaitRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const autoSaveAbortRef = useRef<AbortController | null>(null);
    const allowNavigationRef = useRef(false);
    const isFirstRender = useRef(true);
    const localSectionsRef = useRef(localSections);
    const pageVersionRef = useRef(pageVersion);
    localSectionsRef.current = localSections;
    pageVersionRef.current = pageVersion;

    const displayTitle = resolveLocalizedText(page.title);

    const refreshPreviewUrl = useCallback(
        async (options?: { openInNewTab?: boolean; silent?: boolean }) => {
            setIsPreviewRefreshing(true);

            try {
                const res = await fetch(
                    PageBuilderController.previewUrl.url(page.id),
                    {
                        headers: {
                            Accept: 'application/json',
                        },
                    },
                );

                if (!res.ok) {
                    throw new Error('Preview URL request failed.');
                }

                const data = (await res.json()) as { url?: string };
                if (!data.url) {
                    throw new Error('Preview URL missing.');
                }

                setPreviewUrl(data.url);
                setPreviewUpdatedAt(new Date());

                if (options?.openInNewTab) {
                    window.open(data.url, '_blank');
                }

                return data.url;
            } catch {
                if (!options?.silent) {
                    toast.error('Preview unavailable. Please try again.');
                }

                return null;
            } finally {
                setIsPreviewRefreshing(false);
            }
        },
        [page.id],
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'CMS', href: PageController.index.url() },
        { title: 'Pages', href: PageController.index.url() },
        { title: displayTitle, href: PageController.edit.url(page.id) },
        { title: 'Builder', href: '' },
    ];

    // Load the iframe preview token once the builder mounts.
    useEffect(() => {
        void refreshPreviewUrl({ silent: true });
    }, [refreshPreviewUrl]);

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
            el.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
            setTimeout(
                () =>
                    el.classList.remove(
                        'ring-2',
                        'ring-primary',
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

    const clearAutoSaveTimers = () => {
        if (autoSaveDebounceRef.current) {
            clearTimeout(autoSaveDebounceRef.current);
            autoSaveDebounceRef.current = null;
        }

        if (autoSaveMaxWaitRef.current) {
            clearTimeout(autoSaveMaxWaitRef.current);
            autoSaveMaxWaitRef.current = null;
        }
    };

    const cancelAutoSave = () => {
        clearAutoSaveTimers();
        autoSaveAbortRef.current?.abort();
        autoSaveAbortRef.current = null;
        setIsAutoSaving(false);
    };

    const runAutoSave = () => {
        autoSaveAbortRef.current?.abort();

        const controller = new AbortController();
        autoSaveAbortRef.current = controller;
        setIsAutoSaving(true);
        axios
            .put(
                PageBuilderController.autosave.url(page.id),
                {
                    snapshot: { sections: localSectionsRef.current },
                    expected_version: pageVersionRef.current,
                },
                { signal: controller.signal },
            )
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
                void refreshPreviewUrl({ silent: true });
            })
            .catch((err) => {
                if (axios.isCancel(err)) return;

                if (axios.isAxiosError(err) && err.response?.status === 409) {
                    toast.error(
                        'Conflict: this page was edited by another user. Refresh to load the latest version.',
                        { duration: 8000 },
                    );
                }
            })
            .finally(() => {
                if (autoSaveAbortRef.current === controller) {
                    autoSaveAbortRef.current = null;
                    setIsAutoSaving(false);
                }
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
    }, [hasUnsavedChanges, localSections, refreshPreviewUrl]);

    useEffect(
        () => () => {
            clearAutoSaveTimers();
            autoSaveAbortRef.current?.abort();
            autoSaveAbortRef.current = null;
        },
        [],
    );

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
        const removeHandler = router.on('before', (event) => {
            if (!hasUnsavedChanges) return;

            if (allowNavigationRef.current) {
                allowNavigationRef.current = false;
                return;
            }

            const url = event.detail.visit.url?.toString();
            setPendingNavigation(url ? { url } : null);
            setLeaveDialogOpen(true);

            return false;
        });
        return removeHandler;
    }, [hasUnsavedChanges]);

    const handleConfirmLeave = () => {
        const target = pendingNavigation?.url;

        setLeaveDialogOpen(false);
        setPendingNavigation(null);

        if (!target) return;

        allowNavigationRef.current = true;
        router.visit(target);
    };

    const handleSectionsChange = (updatedSections: Section[]) => {
        setLocalSections(updatedSections);
    };

    const handleSave = async (updatedSections: Section[]) => {
        setLocalSections(updatedSections);
        cancelAutoSave();
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
                    void refreshPreviewUrl({ silent: true });
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
        await refreshPreviewUrl({ openInNewTab: true });
    };

    const availableBlockRelations = capabilities.can_manage_custom_html
        ? available_block_relations
        : Object.fromEntries(
              Object.entries(available_block_relations).filter(
                  ([type]) => type !== 'custom_html',
              ),
          );

    const builderData = {
        page: {
            ...page,
            title: resolveLocalizedText(page.title),
            is_published: page.is_published ?? false,
        },
        sections: localSections,
        available_sections,
        available_block_relations: availableBlockRelations,
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
                    previewUrl={previewUrl}
                    isPreviewRefreshing={isPreviewRefreshing}
                    isPreviewStale={hasUnsavedChanges}
                    previewUpdatedAt={previewUpdatedAt}
                    onRefreshPreview={() => void refreshPreviewUrl()}
                    isSaving={isSaving || isAutoSaving}
                    isManualSaving={isSaving}
                    isAutoSaving={isAutoSaving}
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

            <AlertDialog
                open={leaveDialogOpen}
                onOpenChange={setLeaveDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved page builder changes. Leaving now
                            will discard edits that have not been saved yet.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setPendingNavigation(null)}
                        >
                            Stay
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmLeave}>
                            Leave page
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
