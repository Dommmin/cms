/**
 * TableActionMenuPlugin
 * Context menu (right-click) for table cells — insert/delete rows and columns,
 * unmerge cells, and set cell background color.
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type {
    TableCellNode} from '@lexical/table';
import {
    $deleteTableColumn__EXPERIMENTAL as $deleteTableColumn,
    $deleteTableRow__EXPERIMENTAL as $deleteTableRow,
    $insertTableColumn__EXPERIMENTAL as $insertTableColumn,
    $insertTableRow__EXPERIMENTAL as $insertTableRow,
    $isTableCellNode,
    $unmergeCell
} from '@lexical/table';
import { $getSelection, $isRangeSelection } from 'lexical';
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import type { MenuPos } from './TableActionMenuPlugin.types';

// Preset cell background colors
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
            // onMouseDown prevents blur so the editor selection is preserved
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
    const activeCellRef = useRef<TableCellNode | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Detect right-click inside a table cell
    useEffect(() => {
        const rootElem = editor.getRootElement();
        if (!rootElem) return;

        const handleContextMenu = (e: MouseEvent) => {
            let foundCell: TableCellNode | null = null;

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
            setMenuPos({ x: e.clientX, y: e.clientY });
        };

        rootElem.addEventListener('contextmenu', handleContextMenu);
        return () => rootElem.removeEventListener('contextmenu', handleContextMenu);
    }, [editor]);

    // Close on outside click
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
                // Re-get the node from the current state (ref may be stale)
                const latest = cell.getLatest();
                latest.setBackgroundColor(color);
            });
            setMenuPos(null);
        },
        [editor],
    );

    if (!menuPos) return null;

    // Clamp to viewport so menu doesn't overflow
    const menuWidth = 210;
    const menuHeight = 320;
    const x = Math.min(menuPos.x, window.innerWidth - menuWidth - 8);
    const y = Math.min(menuPos.y, window.innerHeight - menuHeight - 8);

    return createPortal(
        <div
            ref={menuRef}
            style={{ position: 'fixed', left: x, top: y, zIndex: 9999, width: menuWidth }}
            className="rounded-md border border-border bg-popover py-1 shadow-md"
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

            {/* Cell background color */}
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
