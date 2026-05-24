/**
 * TableActionMenuPlugin
 * Context menu (right-click) for table cells — insert/delete rows and columns,
 * unmerge cells, set cell background color, toggle header row, and table style presets.
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type {
    TableRowNode,
    TableCellNode as LexicalTableCellNode} from '@lexical/table';
import {
    $deleteTableColumn__EXPERIMENTAL as $deleteTableColumn,
    $deleteTableRow__EXPERIMENTAL as $deleteTableRow,
    $insertTableColumn__EXPERIMENTAL as $insertTableColumn,
    $insertTableRow__EXPERIMENTAL as $insertTableRow,
    $isTableCellNode,
    $isTableRowNode,
    $unmergeCell,
    TableNode
} from '@lexical/table';
import { $getSelection, $isRangeSelection } from 'lexical';
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import type { MenuPos } from './TableActionMenuPlugin.types';

const CELL_COLORS = [
    { color: null, label: 'None' },
    { color: '#fef3c7', label: 'Yellow' },
    { color: '#d1fae5', label: 'Green' },
    { color: '#dbeafe', label: 'Blue' },
    { color: '#fce7f3', label: 'Pink' },
    { color: '#ede9fe', label: 'Purple' },
    { color: '#fee2e2', label: 'Red' },
    { color: '#f3f4f6', label: 'Gray' },
    { color: '#fff', label: 'White' },
];

type TableStyle = 'default' | 'striped' | 'bordered' | 'borderless';

function applyTableStyle(tableNode: TableNode, style: TableStyle): void {
    // TableNode uses internal __className property not exposed in types
    const currentClasses = (tableNode as TableNode & { __className?: string }).__className?.split(' ').filter((c: string) => !c.startsWith('rte-table-')) ?? [];
    const styleClass = style === 'default' ? '' : `rte-table-${style}`;
    const newClasses = styleClass ? [...currentClasses, styleClass].join(' ') : currentClasses.join(' ');
    const writable = tableNode.getWritable() as TableNode & { __className?: string };
    writable.__className = newClasses || undefined;
}

function findParentTable(node: LexicalTableCellNode): TableNode | null {
    let current = node.getParent();
    while (current) {
        if ($isTableRowNode(current)) {
            current = current.getParent();
            continue;
        }
        if (current instanceof TableNode) {
            return current;
        }
        current = current.getParent();
        if (!current) break;
    }
    return null;
}

function MenuItem({
    label,
    onClick,
    danger = false,
}: {
    label: string;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault();
                onClick();
            }}
            className={cn(
                'flex w-full items-center rounded px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent',
                danger && 'text-destructive hover:bg-destructive/10',
            )}
        >
            {label}
        </button>
    );
}

function MenuSection({ label }: { label: string }) {
    return (
        <div className="px-3 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
        </div>
    );
}

export default function TableActionMenuPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const [menuPos, setMenuPos] = useState<MenuPos>(null);
    const [currentTableStyle, setCurrentTableStyle] = useState<TableStyle>('default');
    const [isHeaderRow, setIsHeaderRow] = useState(false);
    const activeCellRef = useRef<LexicalTableCellNode | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const rootElem = editor.getRootElement();
        if (!rootElem) return;

        const handleContextMenu = (e: MouseEvent) => {
            let foundCell: LexicalTableCellNode | null = null;

            editor.getEditorState().read(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;

                let node = selection.anchor.getNode();
                while (node) {
                    if ($isTableCellNode(node)) {
                        foundCell = node;
                        return;
                    }
                    const parent = node.getParent();
                    if (!parent) break;
                    node = parent as typeof node;
                }
            });

            if (!foundCell) return;

            e.preventDefault();
            activeCellRef.current = foundCell;

            editor.getEditorState().read(() => {
                const cell = foundCell!;
                const row = cell.getParent();
                if (row && $isTableRowNode(row)) {
                    setIsHeaderRow((row as TableRowNode & { __header?: boolean }).__header ?? false);
                }
                const table = findParentTable(cell);
                if (table) {
                    const classes = (table as TableNode & { __className?: string }).__className ?? '';
                    if (classes.includes('rte-table-striped')) setCurrentTableStyle('striped');
                    else if (classes.includes('rte-table-bordered')) setCurrentTableStyle('bordered');
                    else if (classes.includes('rte-table-borderless')) setCurrentTableStyle('borderless');
                    else setCurrentTableStyle('default');
                }
            });

            setMenuPos({ x: e.clientX, y: e.clientY });
        };

        rootElem.addEventListener('contextmenu', handleContextMenu);
        return () => rootElem.removeEventListener('contextmenu', handleContextMenu);
    }, [editor]);

    useEffect(() => {
        if (!menuPos) return;

        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuPos(null);
            }
        };

        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuPos]);

    const run = useCallback(
        (fn: () => void) => {
            editor.update(fn);
            setMenuPos(null);
        },
        [editor],
    );

    const setCellBackground = useCallback(
        (color: string | null) => {
            const cell = activeCellRef.current;
            if (!cell) return;
            editor.update(() => {
                const latest = cell.getLatest();
                latest.setBackgroundColor(color);
            });
            setMenuPos(null);
        },
        [editor],
    );

    const toggleHeaderRow = useCallback(() => {
        const cell = activeCellRef.current;
        if (!cell) return;
        editor.update(() => {
            const latest = cell.getLatest();
            const row = latest.getParent();
            if (row && $isTableRowNode(row)) {
                const writable = row.getWritable() as TableRowNode & { __header?: boolean };
                writable.__header = !writable.__header;
            }
        });
        setMenuPos(null);
    }, [editor]);

    const changeTableStyle = useCallback((style: TableStyle) => {
        const cell = activeCellRef.current;
        if (!cell) return;
        editor.update(() => {
            const latest = cell.getLatest();
            const table = findParentTable(latest);
            if (table) {
                applyTableStyle(table, style);
            }
        });
        setMenuPos(null);
    }, [editor]);

    if (!menuPos) return null;

    const menuWidth = 210;
    const menuHeight = 480;
    const x = Math.min(menuPos.x, window.innerWidth - menuWidth - 8);
    const y = Math.min(menuPos.y, window.innerHeight - menuHeight - 8);

    const TABLE_STYLES: Array<{ style: TableStyle; label: string }> = [
        { style: 'default', label: 'Default' },
        { style: 'striped', label: 'Striped rows' },
        { style: 'bordered', label: 'Bordered' },
        { style: 'borderless', label: 'Borderless' },
    ];

    return createPortal(
        <div
            ref={menuRef}
            style={{ position: 'fixed', left: x, top: y, zIndex: 9999, width: menuWidth }}
            className="max-h-[480px] overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-md"
        >
            <MenuSection label="Row" />
            <MenuItem label="Insert row above" onClick={() => run(() => $insertTableRow(false))} />
            <MenuItem label="Insert row below" onClick={() => run(() => $insertTableRow(true))} />
            <MenuItem label="Delete row" danger onClick={() => run(() => $deleteTableRow())} />

            <div className="my-1 border-t border-border" />

            <MenuSection label="Column" />
            <MenuItem label="Insert column left" onClick={() => run(() => $insertTableColumn(false))} />
            <MenuItem label="Insert column right" onClick={() => run(() => $insertTableColumn(true))} />
            <MenuItem label="Delete column" danger onClick={() => run(() => $deleteTableColumn())} />

            <div className="my-1 border-t border-border" />

            <MenuSection label="Cell" />
            <MenuItem label="Unmerge cell" onClick={() => run(() => $unmergeCell())} />
            <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); toggleHeaderRow(); }}
                className="flex w-full items-center rounded px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent"
            >
                <span className="mr-2 inline-block h-3 w-3 rounded border border-border">
                    {isHeaderRow && <span className="block h-full w-full bg-primary" />}
                </span>
                Toggle header row
            </button>

            <div className="my-1 border-t border-border" />

            <MenuSection label="Table Style" />
            <div className="px-3 pb-1.5">
                {TABLE_STYLES.map(({ style, label }) => (
                    <button
                        key={style}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); changeTableStyle(style); }}
                        className={cn(
                            'flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors hover:bg-accent',
                            currentTableStyle === style && 'bg-accent',
                        )}
                    >
                        <span className={cn(
                            'inline-block h-3 w-3 rounded-sm border',
                            style === 'default' && 'border-border bg-background',
                            style === 'striped' && 'border-border bg-gradient-to-b from-background to-muted',
                            style === 'bordered' && 'border-2 border-border bg-background',
                            style === 'borderless' && 'border-dashed border-muted bg-background',
                        )} />
                        {label}
                    </button>
                ))}
            </div>

            <div className="my-1 border-t border-border" />

            <div className="px-3 pb-1 pt-0.5">
                <div className="mb-1 text-[10px] text-muted-foreground">Background color</div>
                <div className="flex flex-wrap gap-1">
                    {CELL_COLORS.map(({ color, label }) => (
                        <button
                            key={label}
                            type="button"
                            title={label}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setCellBackground(color);
                            }}
                            className="h-5 w-5 rounded border border-border transition-transform hover:scale-110"
                            style={{ backgroundColor: color ?? 'transparent' }}
                        />
                    ))}
                </div>
            </div>
        </div>,
        document.body,
    );
}