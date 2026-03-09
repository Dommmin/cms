/**
 * Builder Toolbar Component
 * Action buttons for page builder
 * Follows Interface Segregation Principle - minimal props
 */

import { Link } from '@inertiajs/react';
import { ArrowLeft, Columns2, Eye, LayoutTemplate, Monitor, Plus, Redo2, Save, Smartphone, Tablet, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

type BuilderToolbarProps = {
    pageId: number;
    pageTitle: string;
    isPublished: boolean;
    isSaving: boolean;
    isSplitView: boolean;
    canUndo: boolean;
    canRedo: boolean;
    previewDevice: PreviewDevice;
    onAddSection: () => void;
    onOpenTemplates: () => void;
    onSave: () => void;
    onPreview: () => void;
    onToggleSplitView: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onChangeDevice: (device: PreviewDevice) => void;
};

export function BuilderToolbar({
    pageId,
    pageTitle,
    isPublished,
    isSaving,
    isSplitView,
    canUndo,
    canRedo,
    previewDevice,
    onAddSection,
    onOpenTemplates,
    onSave,
    onPreview,
    onToggleSplitView,
    onUndo,
    onRedo,
    onChangeDevice,
}: BuilderToolbarProps) {
    return (
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Left: Back button and title */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/cms/pages">
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

                    <div className="h-4 w-px bg-border" />

                    {/* Device selector (split view only) */}
                    {isSplitView && (
                        <>
                            <div className="flex items-center rounded-md border">
                                <Button
                                    onClick={() => onChangeDevice('desktop')}
                                    variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    title="Desktop preview"
                                    className="h-8 w-8 rounded-r-none border-0 p-0"
                                >
                                    <Monitor className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={() => onChangeDevice('tablet')}
                                    variant={previewDevice === 'tablet' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    title="Tablet preview"
                                    className="h-8 w-8 rounded-none border-x p-0"
                                >
                                    <Tablet className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={() => onChangeDevice('mobile')}
                                    variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
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

                    <Button onClick={onOpenTemplates} variant="outline" size="sm">
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

                    <Button onClick={onSave} disabled={isSaving} size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
