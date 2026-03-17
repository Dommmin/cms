import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, type JSX } from 'react';

/**
 * Adds a "Copy" button to every code block rendered in the editor.
 * Uses a MutationObserver to detect dynamically added code blocks.
 */
export default function CopyCodePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const root = editor.getRootElement();
        if (!root) return;

        const addCopyButton = (codeEl: HTMLElement) => {
            if (codeEl.querySelector('.editor-copy-code-btn')) return;

            const btn = document.createElement('button');
            btn.className = 'editor-copy-code-btn';
            btn.type = 'button';
            btn.title = 'Copy code';
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const text = codeEl.innerText ?? '';
                navigator.clipboard.writeText(text).then(() => {
                    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
                    setTimeout(() => {
                        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
                    }, 1500);
                });
            });

            codeEl.style.position = 'relative';
            codeEl.appendChild(btn);
        };

        // Process existing code blocks
        root.querySelectorAll<HTMLElement>('code.editor-code').forEach(addCopyButton);

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof HTMLElement) {
                        if (node.matches('code.editor-code')) addCopyButton(node);
                        node.querySelectorAll<HTMLElement>('code.editor-code').forEach(addCopyButton);
                    }
                });
            }
        });

        observer.observe(root, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [editor]);

    return null;
}
