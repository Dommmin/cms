/**
 * Builder State Hook
 * Manages page builder state and operations, with undo/redo history (up to 20 steps).
 */

import { useCallback, useReducer, useRef, useState } from 'react';
import type { Block, Section } from '../types';

const MAX_HISTORY = 20;

// ── History reducer ─────────────────────────────────────────────────────────

type HistoryState = {
    sections: Section[];
    past: Section[][];
    future: Section[][];
};

type HistoryAction =
    | { type: 'SET'; sections: Section[] }
    | { type: 'SET_SILENT'; sections: Section[] }
    | { type: 'COMMIT_HISTORY'; sections: Section[] }
    | { type: 'UNDO' }
    | { type: 'REDO' };

function historyReducer(
    state: HistoryState,
    action: HistoryAction,
): HistoryState {
    switch (action.type) {
        case 'SET':
            return {
                sections: action.sections,
                past: [...state.past, state.sections].slice(-MAX_HISTORY),
                future: [],
            };
        case 'SET_SILENT':
            return { ...state, sections: action.sections };
        case 'COMMIT_HISTORY':
            return {
                sections: action.sections,
                past: [...state.past, action.sections].slice(-MAX_HISTORY),
                future: [],
            };
        case 'UNDO': {
            if (state.past.length === 0) return state;
            const newPast = state.past.slice(0, -1);
            const previous = state.past[state.past.length - 1];
            return {
                sections: previous,
                past: newPast,
                future: [state.sections, ...state.future],
            };
        }
        case 'REDO': {
            if (state.future.length === 0) return state;
            const [next, ...newFuture] = state.future;
            return {
                sections: next,
                past: [...state.past, state.sections],
                future: newFuture,
            };
        }
        default:
            return state;
    }
}

const HISTORY_DEBOUNCE_MS = 500;

// ── Hook ────────────────────────────────────────────────────────────────────

export function useBuilderState(initialSections: Section[]) {
    const [state, dispatch] = useReducer(historyReducer, {
        sections: initialSections,
        past: [],
        future: [],
    });

    const { sections } = state;
    const historyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    const [expandedSections, setExpandedSections] = useState<Set<number>>(
        new Set(),
    );
    const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(
        new Set(),
    );

    // ── History ──────────────────────────────────────────────────────────────

    const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
    const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
    const canUndo = state.past.length > 0;
    const canRedo = state.future.length > 0;

    // ── Section operations ───────────────────────────────────────────────────

    const addSection = useCallback(
        (defaultSectionType?: string) => {
            const newSection: Section = {
                section_type: defaultSectionType ?? '',
                layout: 'contained',
                variant: null,
                settings: null,
                position: sections.length,
                is_active: true,
                blocks: [],
            };
            dispatch({ type: 'SET', sections: [...sections, newSection] });
        },
        [sections],
    );

    const updateSection = useCallback(
        (index: number, patch: Partial<Section>) => {
            dispatch({
                type: 'SET',
                sections: sections.map((section, i) =>
                    i === index ? { ...section, ...patch } : section,
                ),
            });
        },
        [sections],
    );

    const deleteSection = useCallback(
        (index: number) => {
            dispatch({
                type: 'SET',
                sections: sections.filter((_, i) => i !== index),
            });
            setExpandedSections((prev) => {
                const newSet = new Set(prev);
                newSet.delete(index);
                const adjusted = new Set<number>();
                newSet.forEach((idx) => {
                    adjusted.add(idx > index ? idx - 1 : idx);
                });
                return adjusted;
            });
        },
        [sections],
    );

    const moveSection = useCallback(
        (oldIndex: number, newIndex: number) => {
            const newSections = [...sections];
            const [removed] = newSections.splice(oldIndex, 1);
            newSections.splice(newIndex, 0, removed);
            dispatch({
                type: 'SET',
                sections: newSections.map((section, i) => ({
                    ...section,
                    position: i,
                })),
            });
        },
        [sections],
    );

    // ── Block operations ─────────────────────────────────────────────────────

    const addBlock = useCallback(
        (sectionIndex: number, defaults: Partial<Block> = {}) => {
            dispatch({
                type: 'SET',
                sections: sections.map((section, i) => {
                    if (i !== sectionIndex) return section;
                    const newBlock: Block = {
                        type: '',
                        configuration: {},
                        position: section.blocks.length,
                        is_active: true,
                        relations: [],
                        ...defaults,
                    };
                    return {
                        ...section,
                        blocks: [...section.blocks, newBlock],
                    };
                }),
            });
        },
        [sections],
    );

    const updateBlock = useCallback(
        (sectionIndex: number, blockIndex: number, patch: Partial<Block>) => {
            const newSections = sections.map((section, si) => {
                if (si !== sectionIndex) return section;
                return {
                    ...section,
                    blocks: section.blocks.map((block, bi) =>
                        bi === blockIndex ? { ...block, ...patch } : block,
                    ),
                };
            });
            // Update sections immediately (responsive UI) but debounce history push.
            dispatch({ type: 'SET_SILENT', sections: newSections });

            if (historyDebounceRef.current) {
                clearTimeout(historyDebounceRef.current);
            }
            historyDebounceRef.current = setTimeout(() => {
                dispatch({ type: 'COMMIT_HISTORY', sections: newSections });
            }, HISTORY_DEBOUNCE_MS);
        },
        [sections],
    );

    const deleteBlock = useCallback(
        (sectionIndex: number, blockIndex: number) => {
            dispatch({
                type: 'SET',
                sections: sections.map((section, si) => {
                    if (si !== sectionIndex) return section;
                    return {
                        ...section,
                        blocks: section.blocks.filter(
                            (_, bi) => bi !== blockIndex,
                        ),
                    };
                }),
            });
            const blockKey = `${sectionIndex}-${blockIndex}`;
            setExpandedBlocks((prev) => {
                const newSet = new Set(prev);
                newSet.delete(blockKey);
                return newSet;
            });
        },
        [sections],
    );

    const moveBlock = useCallback(
        (sectionIndex: number, oldIndex: number, newIndex: number) => {
            dispatch({
                type: 'SET',
                sections: sections.map((section, si) => {
                    if (si !== sectionIndex) return section;
                    const newBlocks = [...section.blocks];
                    const [removed] = newBlocks.splice(oldIndex, 1);
                    newBlocks.splice(newIndex, 0, removed);
                    return {
                        ...section,
                        blocks: newBlocks.map((block, i) => ({
                            ...block,
                            position: i,
                        })),
                    };
                }),
            });
        },
        [sections],
    );

    // ── Expand/collapse ──────────────────────────────────────────────────────

    const toggleSection = useCallback((index: number) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);

    const toggleBlock = useCallback(
        (sectionIndex: number, blockIndex: number) => {
            const key = `${sectionIndex}-${blockIndex}`;
            setExpandedBlocks((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(key)) {
                    newSet.delete(key);
                } else {
                    newSet.add(key);
                }
                return newSet;
            });
        },
        [],
    );

    /**
     * Insert one or more fully-formed sections (with their blocks) in a single undo step.
     * Used by the section templates dialog.
     */
    const insertTemplateSections = useCallback(
        (newSections: Omit<Section, 'id' | 'position'>[]) => {
            const positioned: Section[] = newSections.map((s, i) => ({
                ...s,
                position: sections.length + i,
                blocks: s.blocks.map((b, bi) => ({ ...b, position: bi })),
            }));
            dispatch({ type: 'SET', sections: [...sections, ...positioned] });
        },
        [sections],
    );

    return {
        sections,
        expandedSections,
        expandedBlocks,
        // History
        undo,
        redo,
        canUndo,
        canRedo,
        // Section ops
        addSection,
        updateSection,
        deleteSection,
        moveSection,
        insertTemplateSections,
        // Block ops
        addBlock,
        updateBlock,
        deleteBlock,
        moveBlock,
        // UI
        toggleSection,
        toggleBlock,
    };
}
