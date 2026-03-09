import { $isAtNodeEnd } from '@lexical/selection';
import type { RangeSelection } from 'lexical';
import { $isElementNode, type ElementNode, type TextNode } from 'lexical';

export function getSelectedNode(selection: RangeSelection): TextNode | ElementNode {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();

    if (anchorNode === focusNode) {
        return anchorNode;
    }

    const isBackward = selection.isBackward();

    if (isBackward) {
        return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    } else {
        return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
    }
}

export function getDOMRangeRect(
    nativeSelection: Selection,
    rootElement: HTMLElement,
): DOMRect {
    const domRange = nativeSelection.getRangeAt(0);
    let rect: DOMRect;

    if (nativeSelection.anchorNode === rootElement) {
        let inner: Element = rootElement;
        while (inner.firstElementChild != null) {
            inner = inner.firstElementChild;
        }
        rect = inner.getBoundingClientRect();
    } else {
        rect = domRange.getBoundingClientRect();
    }

    return rect;
}
