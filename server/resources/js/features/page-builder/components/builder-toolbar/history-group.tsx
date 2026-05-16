import { Redo2, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import type { HistoryGroupProps } from '../builder-toolbar.types';

export function HistoryGroup({
    canUndo,
    canRedo,
    onUndo,
    onRedo,
}: HistoryGroupProps) {
    const __ = useTranslation();

    return (
        <div className="flex items-center">
            <Button
                onClick={onUndo}
                disabled={!canUndo}
                variant="ghost"
                size="sm"
                title={__('builder.undo', 'Undo (Ctrl+Z)')}
                className="h-8 w-8 p-0"
            >
                <Undo2 className="h-4 w-4" />
            </Button>
            <Button
                onClick={onRedo}
                disabled={!canRedo}
                variant="ghost"
                size="sm"
                title={__('builder.redo', 'Redo (Ctrl+Shift+Z)')}
                className="h-8 w-8 p-0"
            >
                <Redo2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
