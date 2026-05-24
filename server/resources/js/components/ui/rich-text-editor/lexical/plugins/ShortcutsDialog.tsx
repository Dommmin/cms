import type { JSX } from 'react';

const SHORTCUT_SECTIONS = [
    {
        title: 'Formatting',
        shortcuts: [
            { keys: 'Ctrl+B', action: 'Bold' },
            { keys: 'Ctrl+I', action: 'Italic' },
            { keys: 'Ctrl+U', action: 'Underline' },
            { keys: 'Ctrl+Shift+X', action: 'Strikethrough' },
            { keys: 'Ctrl+Shift+K', action: 'Inline code' },
            { keys: 'Ctrl+Shift+H', action: 'Highlight' },
            { keys: 'Ctrl+\\', action: 'Clear formatting' },
        ],
    },
    {
        title: 'Blocks',
        shortcuts: [
            { keys: '# + Space', action: 'Heading 1' },
            { keys: '## + Space', action: 'Heading 2' },
            { keys: '### + Space', action: 'Heading 3' },
            { keys: '> + Space', action: 'Quote' },
            { keys: '``` + Space', action: 'Code block' },
            { keys: '- + Space', action: 'Bullet list' },
            { keys: '1. + Space', action: 'Numbered list' },
            { keys: '[] + Space', action: 'Check list' },
        ],
    },
    {
        title: 'Insert',
        shortcuts: [
            { keys: '/paragraph', action: 'Paragraph block' },
            { keys: '/h1–h4', action: 'Heading blocks' },
            { keys: '/callout', action: 'Callout box' },
            { keys: '/table', action: 'Table' },
            { keys: '/hr', action: 'Horizontal rule' },
            { keys: '/gallery', action: 'Image gallery' },
            { keys: '/file', action: 'File attachment' },
        ],
    },
    {
        title: 'Editor',
        shortcuts: [
            { keys: 'Ctrl+Z', action: 'Undo' },
            { keys: 'Ctrl+Shift+Z', action: 'Redo' },
            { keys: 'Ctrl+K', action: 'Insert link' },
            { keys: 'Escape', action: 'Deselect / close' },
        ],
    },
];

export default function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }): JSX.Element {
    return (
        <div
            className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
            onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
            style={{ display: open ? 'flex' : 'none' }}
        >
            {open && (
                <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
            )}
            {open && (
                <div className="fixed left-1/2 top-1/2 z-50 max-h-[80vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border bg-popover p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
                        <button
                            type="button"
                            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                            onClick={() => onOpenChange(false)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="space-y-4">
                        {SHORTCUT_SECTIONS.map((section) => (
                            <div key={section.title}>
                                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {section.shortcuts.map((shortcut) => (
                                        <div key={shortcut.keys} className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{shortcut.action}</span>
                                            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">
                                                {shortcut.keys}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}