import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin';
import { GripVertical } from 'lucide-react';
import { type JSX } from 'react';
import { useRef } from 'react';

const DRAGGABLE_BLOCK_MENU_CLASSNAME = 'draggable-block-menu';

function isOnMenu(element: HTMLElement): boolean {
    return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}

export default function DraggableBlockPlugin({
    anchorElem = document.body,
}: {
    anchorElem?: HTMLElement;
}): JSX.Element {
    const menuRef = useRef<HTMLDivElement>(null);
    const targetLineRef = useRef<HTMLDivElement>(null);

    return (
        <DraggableBlockPlugin_EXPERIMENTAL
            anchorElem={anchorElem}
            menuRef={menuRef as React.RefObject<HTMLElement | null>}
            targetLineRef={targetLineRef as React.RefObject<HTMLElement | null>}
            menuComponent={
                <div ref={menuRef} className={DRAGGABLE_BLOCK_MENU_CLASSNAME}>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
            }
            targetLineComponent={
                <div
                    ref={targetLineRef}
                    className="draggable-block-target-line"
                />
            }
            isOnMenu={isOnMenu}
        />
    );
}
