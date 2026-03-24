import type { LexicalEditor } from 'lexical';
import { type JSX } from 'react';
import { useRef } from 'react';
import type { ImageResizerProps } from './ImageResizer.types';

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

const Direction = {
    east: 1 << 0,
    north: 1 << 3,
    south: 1 << 1,
    west: 1 << 2,
};

export default function ImageResizer({
    onResizeStart,
    onResizeEnd,
    buttonRef,
    imageRef,
    maxWidth,
    captionsEnabled: _captionsEnabled,
}: ImageResizerProps): JSX.Element {
    const controlWrapperRef = useRef<HTMLDivElement>(null);
    const userSelect = useRef({ priority: '', value: 'default' });
    const positioningRef = useRef<{
        currentHeight: 'inherit' | number;
        currentWidth: 'inherit' | number;
        direction: number;
        isResizing: boolean;
        ratio: number;
        startHeight: number;
        startWidth: number;
        startX: number;
        startY: number;
    }>({
        currentHeight: 0,
        currentWidth: 0,
        direction: 0,
        isResizing: false,
        ratio: 0,
        startHeight: 0,
        startWidth: 0,
        startX: 0,
        startY: 0,
    });

    const editorRootElement =
        typeof document !== 'undefined'
            ? document.activeElement?.closest('[role="textbox"]')
            : null;
    const maxWidthContainer = maxWidth
        ? maxWidth
        : editorRootElement !== null && editorRootElement !== undefined
          ? editorRootElement.getBoundingClientRect().width - 20
          : 100;

    const setStartCursor = (direction: number) => {
        const ew = direction === Direction.east || direction === Direction.west;
        const ns =
            direction === Direction.north || direction === Direction.south;
        const nwse =
            (direction & Direction.north && direction & Direction.west) ||
            (direction & Direction.south && direction & Direction.east);

        const cursorDir = ew ? 'ew' : ns ? 'ns' : nwse ? 'nwse' : 'nesw';

        if (editorRootElement !== null && editorRootElement !== undefined) {
            (editorRootElement as HTMLElement).style.setProperty(
                'cursor',
                `${cursorDir}-resize`,
                'important',
            );
        }
        if (document.body !== null) {
            document.body.style.setProperty(
                'cursor',
                `${cursorDir}-resize`,
                'important',
            );
            userSelect.current.value = document.body.style.getPropertyValue(
                '-webkit-user-select',
            );
            userSelect.current.priority =
                document.body.style.getPropertyPriority('-webkit-user-select');
            document.body.style.setProperty(
                '-webkit-user-select',
                'none',
                'important',
            );
        }
    };

    const setEndCursor = () => {
        if (editorRootElement !== null && editorRootElement !== undefined) {
            (editorRootElement as HTMLElement).style.setProperty(
                'cursor',
                'text',
            );
        }
        if (document.body !== null) {
            document.body.style.setProperty('cursor', 'default');
            document.body.style.setProperty(
                '-webkit-user-select',
                userSelect.current.value,
                userSelect.current.priority,
            );
        }
    };

    const handlePointerDown = (
        event: React.PointerEvent<HTMLDivElement>,
        direction: number,
    ) => {
        if (!imageRef.current) return;
        const image = imageRef.current as HTMLImageElement;
        const { width, height } = image.getBoundingClientRect();
        positioningRef.current.startWidth = width;
        positioningRef.current.startHeight = height;
        positioningRef.current.ratio = width / height;
        positioningRef.current.currentWidth = width;
        positioningRef.current.currentHeight = height;
        positioningRef.current.startX = event.clientX;
        positioningRef.current.startY = event.clientY;
        positioningRef.current.isResizing = true;
        positioningRef.current.direction = direction;

        setStartCursor(direction);
        onResizeStart();

        controlWrapperRef.current?.setPointerCapture(event.pointerId);
        event.preventDefault();
        event.stopPropagation();
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const imageRef_ = imageRef.current;
        const positioning = positioningRef.current;
        const isHorizontal =
            positioning.direction & (Direction.east | Direction.west);
        const isVertical =
            positioning.direction & (Direction.south | Direction.north);

        if (imageRef_ !== null && positioning.isResizing) {
            let diff = Math.floor(positioning.startX - event.clientX);
            diff = positioning.direction & Direction.east ? -diff : diff;

            if (isHorizontal && !isVertical) {
                const newWidth = clamp(
                    positioning.startWidth + diff,
                    10,
                    maxWidthContainer,
                );
                (imageRef_ as HTMLImageElement).style.width = `${newWidth}px`;
                positioning.currentWidth = newWidth;
            } else if (isVertical && !isHorizontal) {
                const newHeight = clamp(
                    positioning.startHeight -
                        Math.floor(event.clientY - positioning.startY),
                    10,
                    1000,
                );
                (imageRef_ as HTMLImageElement).style.height = `${newHeight}px`;
                positioning.currentHeight = newHeight;
            } else {
                const newWidth = clamp(
                    positioning.startWidth + diff,
                    10,
                    maxWidthContainer,
                );
                const newHeight = Math.round(newWidth / positioning.ratio);
                (imageRef_ as HTMLImageElement).style.width = `${newWidth}px`;
                (imageRef_ as HTMLImageElement).style.height = `${newHeight}px`;
                positioning.currentWidth = newWidth;
                positioning.currentHeight = newHeight;
            }
        }
    };

    const handlePointerUp = (_event: React.PointerEvent<HTMLDivElement>) => {
        const positioning = positioningRef.current;
        const { currentWidth, currentHeight } = positioning;
        if (positioning.isResizing) {
            positioning.isResizing = false;
            onResizeEnd(currentWidth, currentHeight);
            setEndCursor();
        }
    };

    return (
        <div
            ref={controlWrapperRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {!_captionsEnabled && (
                <div
                    ref={
                        buttonRef as unknown as React.RefObject<HTMLDivElement>
                    }
                    className="image-resizer image-resizer-n"
                    onPointerDown={(e) => handlePointerDown(e, Direction.north)}
                />
            )}
            <div
                className="image-resizer image-resizer-ne"
                onPointerDown={(e) =>
                    handlePointerDown(e, Direction.north | Direction.east)
                }
            />
            <div
                className="image-resizer image-resizer-e"
                onPointerDown={(e) => handlePointerDown(e, Direction.east)}
            />
            <div
                className="image-resizer image-resizer-se"
                onPointerDown={(e) =>
                    handlePointerDown(e, Direction.south | Direction.east)
                }
            />
            <div
                className="image-resizer image-resizer-s"
                onPointerDown={(e) => handlePointerDown(e, Direction.south)}
            />
            <div
                className="image-resizer image-resizer-sw"
                onPointerDown={(e) =>
                    handlePointerDown(e, Direction.south | Direction.west)
                }
            />
            <div
                className="image-resizer image-resizer-w"
                onPointerDown={(e) => handlePointerDown(e, Direction.west)}
            />
            <div
                className="image-resizer image-resizer-nw"
                onPointerDown={(e) =>
                    handlePointerDown(e, Direction.north | Direction.west)
                }
            />
        </div>
    );
}
