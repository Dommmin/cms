import { $generateHtmlFromNodes } from '@lexical/html';
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { useCallback, type JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/use-translation';

function downloadContent(content: string, type: string, filename: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function ExportPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const __ = useTranslation();

    const exportHtml = useCallback(() => {
        editor.update(() => {
            const html = $generateHtmlFromNodes(editor);
            downloadContent(html, 'text/html', 'content.html');
        });
    }, [editor]);

    const exportText = useCallback(() => {
        editor.update(() => {
            const text = $getRoot().getTextContent();
            downloadContent(text, 'text/plain', 'content.txt');
        });
    }, [editor]);

    const exportMarkdown = useCallback(() => {
        editor.update(() => {
            const markdown = $convertToMarkdownString(TRANSFORMERS);
            downloadContent(markdown, 'text/markdown', 'content.md');
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
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={exportMarkdown}
                    >
                        MD
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                    {__('rte.export.markdown', 'Export Markdown')}
                </TooltipContent>
            </Tooltip>
        </>
    );
}
