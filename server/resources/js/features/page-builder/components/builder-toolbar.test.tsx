import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BuilderToolbar } from './builder-toolbar';

vi.mock('@inertiajs/react', () => ({
    Link: ({
        href,
        children,
        ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    usePage: () => ({
        props: {
            adminTranslations: {},
        },
    }),
}));

vi.mock('@/actions/App/Http/Controllers/Admin/Cms/PageController', () => ({
    index: { url: () => '/admin/cms/pages' },
}));

const baseProps: React.ComponentProps<typeof BuilderToolbar> = {
    pageId: 1,
    pageTitle: 'Landing page',
    isPublished: false,
    isSaving: false,
    isManualSaving: false,
    isAutoSaving: false,
    canUndo: false,
    canRedo: false,
    hasUnsavedChanges: false,
    lastSavedAt: null,
    scheduledPublishAt: null,
    scheduledUnpublishAt: null,
    approvalStatus: 'draft',
    sections: [],
    onAddSection: vi.fn(),
    onOpenTemplates: vi.fn(),
    onSave: vi.fn(),
    onPreview: vi.fn(),
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onScheduleSave: vi.fn(),
    onSaveTemplate: vi.fn(),
    onSubmitForReview: vi.fn(),
    onApprove: vi.fn(),
    onReject: vi.fn(),
    viewMode: 'cards',
    editorMode: 'advanced',
};

describe('BuilderToolbar editor mode control', () => {
    it('switches between simple and advanced modes', async () => {
        const user = userEvent.setup();
        const onEditorModeChange = vi.fn();

        render(
            <BuilderToolbar
                {...baseProps}
                onEditorModeChange={onEditorModeChange}
            />,
        );

        await user.click(screen.getByRole('button', { name: /simple/i }));
        await user.click(screen.getByRole('button', { name: /advanced/i }));

        expect(onEditorModeChange).toHaveBeenNthCalledWith(1, 'simple');
        expect(onEditorModeChange).toHaveBeenNthCalledWith(2, 'advanced');
    });
});
