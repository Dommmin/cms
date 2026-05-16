import { BookOpen, ClipboardPaste, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import type { BlocksListHeaderProps } from '../blocks-list.types';

export function BlocksListHeader({
    hasClipboard,
    onPasteBlock,
    onOpenLibrary,
    onOpenPicker,
}: BlocksListHeaderProps) {
    const __ = useTranslation();

    return (
        <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
                {__('builder.blocks', 'Blocks')}
            </h4>
            <div className="flex items-center gap-2">
                {hasClipboard && (
                    <Button onClick={onPasteBlock} size="sm" variant="outline">
                        <ClipboardPaste className="mr-2 h-4 w-4" />
                        {__('builder.paste_block', 'Paste Block')}
                    </Button>
                )}
                <Button onClick={onOpenLibrary} size="sm" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {__('builder.from_library', 'From Library')}
                </Button>
                <Button onClick={onOpenPicker} size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    {__('builder.add_block', 'Add Block')}
                </Button>
            </div>
        </div>
    );
}
