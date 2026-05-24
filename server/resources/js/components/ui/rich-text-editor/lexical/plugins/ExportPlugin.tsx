import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { useCallback, type JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/use-translation';

export default function ExportPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const __ = useTranslation();

    const exportHtml = useCallback(() => {
        editor.update(() => {
            const html = $generateHtmlFromNodes(editor);
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'content.html';
            a.click();
            URL.revokeObjectURL(url);
        });
    }, [editor]);

    const exportText = useCallback(() => {
        editor.update(() => {
            const text = $getRoot().getTextContent();
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'content.txt';
            a.click();
            URL.revokeObjectURL(url);
        });
    }, [editor]);

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={exportHtml}
                    >
                        HTML
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                    {__('rte.export.html', 'Export HTML')}
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={exportText}
                    >
                        TXT
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                    {__('rte.export.text', 'Export plain text')}
                </TooltipContent>
            </Tooltip>
        </>
    );
}