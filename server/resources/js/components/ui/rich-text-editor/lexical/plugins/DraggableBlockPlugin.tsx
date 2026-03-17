/**
 * DraggableBlockPlugin
 * Drag handle on the left side of each block for reordering.
 * Wraps Lexical's DraggableBlockPlugin_EXPERIMENTAL.
 */

import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin';
import { useRef, type JSX } from 'react';
import { GripVertical } from 'lucide-react';

const DRAGGABLE_BLOCK_MENU_CLASS = 'rte-draggable-menu';

function isOnMenuElement(element: HTMLElement): boolean {
    return element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASS}`) !== null;
}

export default function DraggableBlockPlugin({
    anchorElem,
}: {
    anchorElem?: HTMLElement;
}): JSX.Element {
    const menuRef = useRef<HTMLDivElement>(null);
    const targetLineRef = useRef<HTMLDivElement>(null);

    return (
        <DraggableBlockPlugin_EXPERIMENTAL
            anchorElem={anchorElem}
            menuRef={menuRef}
            targetLineRef={targetLineRef}
            isOnMenu={isOnMenuElement}
            menuComponent={
                <div
                    ref={menuRef}
                    className={`${DRAGGABLE_BLOCK_MENU_CLASS} absolute left-0 top-0 cursor-grab active:cursor-grabbing opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100 p-0.5 rounded hover:bg-accent`}
                    style={{ transform: 'translateX(-100%)' }}
                >
                    <GripVertical size={14} className="text-muted-foreground" />
                </div>
            }
            targetLineComponent={
                <div
                    ref={targetLineRef}
                    className="pointer-events-none absolute left-0 right-0 h-0.5 bg-primary opacity-0"
                />
            }
        />
    );
}
