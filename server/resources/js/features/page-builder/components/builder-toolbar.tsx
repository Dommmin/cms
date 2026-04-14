/**
 * Builder Toolbar Component
 * Action buttons for page builder
 * Follows Interface Segregation Principle - minimal props
 */

import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookmarkPlus,
    Calendar,
    Columns2,
    Eye,
    LayoutTemplate,
    Loader2,
    Monitor,
    Plus,
    Redo2,
    Save,
    Smartphone,
    Tablet,
    Undo2,
} from 'lucide-react';
import * as PageController from '@/actions/App/Http/Controllers/Admin/Cms/PageController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { BuilderToolbarProps } from './builder-toolbar.types';

// ── Auto-save indicator ────────────────────────────────────────────────────

function AutoSaveIndicator({
    isSaving,
    hasUnsavedChanges,
    lastSavedAt,
    timeSince,
}: {
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    lastSavedAt: Date | null;
    timeSince?: string | null;
}) {
    if (isSaving) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
            </div>
        );
    }

    if (hasUnsavedChanges) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Unsaved changes</span>
            </div>
        );
    }

    if (lastSavedAt) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span>Saved {timeSince ?? 'just now'}</span>
            </div>
        );
    }

    return null;
}

// ── Schedule popover ──────────────────────────────────────────────────────

function SchedulePopover({
    scheduledPublishAt,
    scheduledUnpublishAt,
    onSave,
}: {
    scheduledPublishAt: string | null;
    scheduledUnpublishAt: string | null;
    onSave: (publishAt: string | null, unpublishAt: string | null) => void;
}) {
    const toLocalDateTimeValue = (iso: string | null): string => {
        if (!iso) return '';
        // Convert ISO to datetime-local format (YYYY-MM-DDTHH:mm)
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().slice(0, 16);
    };

    const [publishAt, setPublishAt] = useState(
        toLocalDateTimeValue(scheduledPublishAt),
    );
    const [unpublishAt, setUnpublishAt] = useState(
        toLocalDateTimeValue(scheduledUnpublishAt),
    );
    const [open, setOpen] = useState(false);

    const handleSave = () => {
        onSave(publishAt || null, unpublishAt || null);
        setOpen(false);
    };

    const hasSchedule = !!scheduledPublishAt || !!scheduledUnpublishAt;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={hasSchedule ? 'secondary' : 'outline'}
                    size="sm"
                    title="Schedule publishing"
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold">
                        Schedule Publishing
                    </h4>

                    <div className="space-y-1.5">
                        <Label htmlFor="scheduled-publish-at">Publish at</Label>
                        <input
                            id="scheduled-publish-at"
                            type="datetime-local"
                            value={publishAt}
                            onChange={(e) => setPublishAt(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Page will be automatically published at this time.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="scheduled-unpublish-at">
                            Unpublish at
                        </Label>
                        <input
                            id="scheduled-unpublish-at"
                            type="datetime-local"
                            value={unpublishAt}
                            onChange={(e) => setUnpublishAt(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Page will be automatically unpublished at this time.
                        </p>
                    </div>

                    <div className="flex justify-between gap-2">
                        {hasSchedule && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                    setPublishAt('');
                                    setUnpublishAt('');
                                    onSave(null, null);
                                    setOpen(false);
                                }}
                            >
                                Clear schedule
                            </Button>
                        )}
                        <Button
                            size="sm"
                            className="ml-auto"
                            onClick={handleSave}
                        >
                            Save schedule
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// ── Save as template dialog ────────────────────────────────────────────────

function SaveAsTemplateDialog({
    open,
    onClose,
    onSave,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (
        name: string,
        description: string,
        category: string,
        isGlobal: boolean,
    ) => void;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('custom');
    const [isGlobal, setIsGlobal] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave(name, description, category, isGlobal);
        setName('');
        setDescription('');
        setCategory('custom');
        setIsGlobal(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookmarkPlus className="h-5 w-5" />
                        Save as Template
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="tpl-name">Name</Label>
                        <Input
                            id="tpl-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Template"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="tpl-description">
                            Description{' '}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <Textarea
                            id="tpl-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this template is for…"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="tpl-category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger id="tpl-category">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="custom">Custom</SelectItem>
                                <SelectItem value="landing">Landing</SelectItem>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="blog">Blog</SelectItem>
                                <SelectItem value="portfolio">
                                    Portfolio
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="tpl-global"
                            checked={isGlobal}
                            onCheckedChange={(checked) =>
                                setIsGlobal(checked === true)
                            }
                        />
                        <Label
                            htmlFor="tpl-global"
                            className="cursor-pointer text-sm font-normal"
                        >
                            Make visible to all admins
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim()}>
                            Save Template
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Toolbar ────────────────────────────────────────────────────────────────

export function BuilderToolbar({
    pageId: _pageId,
    pageTitle,
    isPublished: _isPublished,
    isSaving,
    isSplitView,
    canUndo,
    canRedo,
    previewDevice,
    hasUnsavedChanges,
    lastSavedAt,
    scheduledPublishAt,
    scheduledUnpublishAt,
    onAddSection,
    onOpenTemplates,
    onSave,
    onPreview,
    onToggleSplitView,
    onUndo,
    onRedo,
    onChangeDevice,
    onScheduleSave,
    onSaveTemplate,
}: BuilderToolbarProps) {
    const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);

    return (
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Left: Back button and title */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={PageController.index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold">{pageTitle}</h1>
                        <p className="text-sm text-muted-foreground">
                            Page Builder
                        </p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Undo / Redo */}
                    <div className="flex items-center">
                        <Button
                            onClick={onUndo}
                            disabled={!canUndo}
                            variant="ghost"
                            size="sm"
                            title="Undo (Ctrl+Z)"
                            className="h-8 w-8 p-0"
                        >
                            <Undo2 className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={onRedo}
                            disabled={!canRedo}
                            variant="ghost"
                            size="sm"
                            title="Redo (Ctrl+Shift+Z)"
                            className="h-8 w-8 p-0"
                        >
                            <Redo2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Auto-save indicator */}
                    <div className="px-2">
                        <AutoSaveIndicator
                            isSaving={isSaving}
                            hasUnsavedChanges={hasUnsavedChanges}
                            lastSavedAt={lastSavedAt}
                            timeSince={timeSince}
                        />
                    </div>

                    <div className="h-4 w-px bg-border" />

                    {/* Device selector (split view only) */}
                    {isSplitView && (
                        <>
                            <div className="flex items-center rounded-md border">
                                <Button
                                    onClick={() => onChangeDevice('desktop')}
                                    variant={
                                        previewDevice === 'desktop'
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    title="Desktop preview"
                                    className="h-8 w-8 rounded-r-none border-0 p-0"
                                >
                                    <Monitor className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={() => onChangeDevice('tablet')}
                                    variant={
                                        previewDevice === 'tablet'
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    title="Tablet preview"
                                    className="h-8 w-8 rounded-none border-x p-0"
                                >
                                    <Tablet className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={() => onChangeDevice('mobile')}
                                    variant={
                                        previewDevice === 'mobile'
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    title="Mobile preview"
                                    className="h-8 w-8 rounded-l-none border-0 p-0"
                                >
                                    <Smartphone className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="h-4 w-px bg-border" />
                        </>
                    )}

                    <Button
                        onClick={onOpenTemplates}
                        variant="outline"
                        size="sm"
                    >
                        <LayoutTemplate className="mr-2 h-4 w-4" />
                        Templates
                    </Button>

                    <Button onClick={onAddSection} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Section
                    </Button>

                    <Button
                        onClick={onToggleSplitView}
                        variant={isSplitView ? 'secondary' : 'outline'}
                        size="sm"
                    >
                        <Columns2 className="mr-2 h-4 w-4" />
                        {isSplitView ? 'Exit Split View' : 'Split View'}
                    </Button>

                    {!isSplitView && (
                        <Button onClick={onPreview} variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                        </Button>
                    )}

                    <SchedulePopover
                        scheduledPublishAt={scheduledPublishAt}
                        scheduledUnpublishAt={scheduledUnpublishAt}
                        onSave={onScheduleSave}
                    />

                    <Button
                        onClick={() => setSaveTemplateOpen(true)}
                        variant="outline"
                        size="sm"
                        title="Save current layout as a reusable template"
                    >
                        <BookmarkPlus className="mr-2 h-4 w-4" />
                        Save as Template
                    </Button>

                    <Button onClick={onSave} disabled={isSaving} size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            <SaveAsTemplateDialog
                open={saveTemplateOpen}
                onClose={() => setSaveTemplateOpen(false)}
                onSave={onSaveTemplate}
            />
        </div>
    );
}
