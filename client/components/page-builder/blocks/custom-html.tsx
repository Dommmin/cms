import { sanitizeHtml } from '@/lib/sanitize';
import type { CustomHtmlConfig, CustomHtmlProps } from './custom-html.types';

function sanitizeCss(css: string): string {
    return css
        .replace(/<\s*\/\s*style\b[^>]*>/gi, '')
        .replace(/<\s*script\b[^>]*>/gi, '')
        .replace(/@import\b/gi, '')
        .replace(/behavior\s*:/gi, '')
        .replace(/expression\s*\(/gi, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/vbscript\s*:/gi, '')
        .replace(/url\s*\(\s*['"]?\s*data\s*:/gi, 'url(');
}

export function CustomHtmlBlock({ block }: CustomHtmlProps) {
    const cfg = block.configuration as CustomHtmlConfig;
    if (!cfg.html) return null;

    return (
        <>
            {cfg.css && (
                <style
                    dangerouslySetInnerHTML={{ __html: sanitizeCss(cfg.css) }}
                />
            )}
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(cfg.html) }} />
        </>
    );
}
