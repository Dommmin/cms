import { CODE_LANGUAGE_FRIENDLY_NAME_MAP, CODE_LANGUAGE_MAP } from '@lexical/code';
import type { ElementFormatType } from 'lexical';
import { CheckSquare, Code2, List, ListOrdered, Pilcrow, Quote } from 'lucide-react';
import type { JSX } from 'react';
import type { BlockType } from './types';

export const ELEMENT_FORMAT_NUM_TO_TYPE: Record<number, ElementFormatType> = {
    0: '',
    1: 'left',
    2: 'start',
    3: 'center',
    4: 'right',
    5: 'end',
    6: 'justify',
} as const;

export const BLOCK_LABELS: Record<BlockType, string> = {
    paragraph: 'Paragraph',
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    h4: 'Heading 4',
    h5: 'Heading 5',
    h6: 'Heading 6',
    quote: 'Quote',
    code: 'Code Block',
    bullet: 'Bullet List',
    number: 'Numbered List',
    check: 'Check List',
};

export const BLOCK_ICONS: Record<BlockType, JSX.Element> = {
    paragraph: <Pilcrow size={14} />,
    h1: <span className="text-xs font-bold">H1</span>,
    h2: <span className="text-xs font-bold">H2</span>,
    h3: <span className="text-xs font-bold">H3</span>,
    h4: <span className="text-xs font-bold">H4</span>,
    h5: <span className="text-xs font-bold">H5</span>,
    h6: <span className="text-xs font-bold">H6</span>,
    quote: <Quote size={14} />,
    code: <Code2 size={14} />,
    bullet: <List size={14} />,
    number: <ListOrdered size={14} />,
    check: <CheckSquare size={14} />,
};

export const FONT_SIZES = [10, 11, 12, 14, 15, 16, 18, 24, 30, 36];

export const FONT_FAMILIES: Array<[string, string]> = [
    ['', 'Default'],
    ['serif', 'Serif'],
    ['monospace', 'Mono'],
    ['cursive', 'Cursive'],
];

export const TEXT_COLORS = [
    '#000000',
    '#374151',
    '#6b7280',
    '#9ca3af',
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#14b8a6',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#dc2626',
    '#ea580c',
    '#ca8a04',
    '#16a34a',
    '#0d9488',
    '#2563eb',
    '#7c3aed',
    '#db2777',
    '#ffffff',
    '#f3f4f6',
    '#dbeafe',
    '#dcfce7',
];

export const HIGHLIGHT_COLORS = [
    '#fef08a',
    '#fde68a',
    '#fed7aa',
    '#fecaca',
    '#fecdd3',
    '#e9d5ff',
    '#c4b5fd',
    '#a5b4fc',
    '#93c5fd',
    '#a7f3d0',
    '#bbf7d0',
    '#d9f99d',
    '#fcd34d',
    '#fdba74',
    '#f87171',
    '#f472b6',
    '#c084fc',
    '#818cf8',
    '#38bdf8',
    '#34d399',
    '#a3e635',
    '#facc15',
];

export const EMOJIS: Array<{ label: string; emojis: string[] }> = [
    {
        label: 'Smileys',
        emojis: ['😀', '😂', '😊', '😍', '😎', '😢', '😡', '🥰', '🤔', '😅', '🤣', '😇', '🙂', '😏', '😒', '😔', '🤯', '🥺', '😤', '😈'],
    },
    {
        label: 'Gestures',
        emojis: ['👍', '👎', '👏', '🙏', '🤝', '✌️', '👌', '🤞', '☝️', '👊', '💪', '🤙', '🖐️', '👋', '🤜', '🤛'],
    },
    {
        label: 'Hearts',
        emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❤️‍🔥', '💕', '💞', '💓', '💗', '💖', '💝'],
    },
    {
        label: 'Objects',
        emojis: ['🔥', '⭐', '✨', '💡', '🎉', '🎊', '🎁', '🏆', '🎯', '🔑', '💎', '🛡️', '⚡', '💰', '📌', '✅', '❌', '⚠️', '🔔', '📢'],
    },
    {
        label: 'Nature',
        emojis: ['🌟', '🌈', '☀️', '🌙', '⛅', '🌊', '🌺', '🌸', '🍀', '🌻', '🌹', '🦋', '🐶', '🐱', '🦁', '🐻', '🦊', '🐼', '🌿', '🍁'],
    },
    {
        label: 'Food',
        emojis: ['🍕', '🍔', '🍦', '🍩', '🍭', '🎂', '☕', '🍵', '🍺', '🥂', '🍷', '🥗', '🍜', '🌮', '🍣', '🥐', '🍓', '🍇', '🍊', '🥑'],
    },
    {
        label: 'Activity',
        emojis: ['⚽', '🏀', '🎮', '🎵', '🎸', '🎨', '✈️', '🚀', '🏠', '💻', '📱', '📷', '🎬', '🎭', '🎪', '🏋️', '🎯', '🏄', '🧗', '🎲'],
    },
];

export const SPECIAL_CHARS: Array<{ label: string; chars: Array<{ char: string; name: string }> }> = [
    {
        label: 'Typography',
        chars: [
            { char: '©', name: 'Copyright' },
            { char: '®', name: 'Registered' },
            { char: '™', name: 'Trademark' },
            { char: '°', name: 'Degree' },
            { char: '±', name: 'Plus-Minus' },
            { char: '×', name: 'Multiply' },
            { char: '÷', name: 'Divide' },
            { char: '≠', name: 'Not Equal' },
            { char: '≤', name: 'Less or Equal' },
            { char: '≥', name: 'Greater or Equal' },
            { char: '∞', name: 'Infinity' },
            { char: '≈', name: 'Almost Equal' },
            { char: '\u2026', name: 'Ellipsis' },
            { char: '\u2014', name: 'Em Dash' },
            { char: '\u2013', name: 'En Dash' },
            { char: '\u201C', name: 'Left Quote' },
            { char: '\u201D', name: 'Right Quote' },
            { char: '\u2018', name: 'Left Single' },
            { char: '\u2019', name: 'Right Single' },
            { char: '«', name: 'Left Guillemet' },
            { char: '»', name: 'Right Guillemet' },
        ],
    },
    {
        label: 'Currency',
        chars: [
            { char: '€', name: 'Euro' },
            { char: '£', name: 'Pound' },
            { char: '¥', name: 'Yen' },
            { char: '¢', name: 'Cent' },
            { char: '₹', name: 'Rupee' },
            { char: '₿', name: 'Bitcoin' },
            { char: '₽', name: 'Ruble' },
            { char: '₩', name: 'Won' },
            { char: '₪', name: 'Shekel' },
            { char: '₫', name: 'Dong' },
            { char: '₺', name: 'Lira' },
            { char: '฿', name: 'Baht' },
        ],
    },
    {
        label: 'Arrows',
        chars: [
            { char: '→', name: 'Right Arrow' },
            { char: '←', name: 'Left Arrow' },
            { char: '↑', name: 'Up Arrow' },
            { char: '↓', name: 'Down Arrow' },
            { char: '↔', name: 'Left-Right Arrow' },
            { char: '↕', name: 'Up-Down Arrow' },
            { char: '⇒', name: 'Right Double Arrow' },
            { char: '⇐', name: 'Left Double Arrow' },
            { char: '⇔', name: 'Double Arrow' },
            { char: '↩', name: 'Return Arrow' },
            { char: '↪', name: 'Right Hook' },
            { char: '➜', name: 'Bold Right' },
            { char: '✓', name: 'Check Mark' },
            { char: '✗', name: 'Cross Mark' },
        ],
    },
    {
        label: 'Math',
        chars: [
            { char: 'π', name: 'Pi' },
            { char: 'Σ', name: 'Sigma' },
            { char: 'Δ', name: 'Delta' },
            { char: 'Ω', name: 'Omega' },
            { char: 'μ', name: 'Mu' },
            { char: 'α', name: 'Alpha' },
            { char: 'β', name: 'Beta' },
            { char: 'γ', name: 'Gamma' },
            { char: '√', name: 'Square Root' },
            { char: '∑', name: 'Sum' },
            { char: '∫', name: 'Integral' },
            { char: '∂', name: 'Partial' },
            { char: '∅', name: 'Empty Set' },
            { char: '∈', name: 'Element Of' },
            { char: '∩', name: 'Intersection' },
            { char: '∪', name: 'Union' },
        ],
    },
];

export const CODE_LANGUAGES = Object.entries(CODE_LANGUAGE_MAP)
    .reduce<Array<[string, string]>>((acc, [key]) => {
        const normalized = CODE_LANGUAGE_MAP[key];

        if (!acc.find(([k]) => k === normalized)) {
            acc.push([normalized, CODE_LANGUAGE_FRIENDLY_NAME_MAP[normalized] ?? normalized]);
        }

        return acc;
    }, [])
    .sort(([, a], [, b]) => a.localeCompare(b));
