import { type JSX } from 'react';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type {
    Position,
    MoveWrapperProps,
    HSV,
    ColorPickerProps,
} from './ColorPicker.types';

const WIDTH = 214;
const HEIGHT = 150;

const basicColors = [
    '#d0021b',
    '#f5a623',
    '#f8e71c',
    '#8b572a',
    '#7ed321',
    '#417505',
    '#bd10e0',
    '#9013fe',
    '#4a90e2',
    '#50e3c2',
    '#b8e986',
    '#000000',
    '#4a4a4a',
    '#9b9b9b',
    '#ffffff',
];

function toHex(value: string): string {
    if (!value.startsWith('#')) {
        const ctx = document.createElement('canvas').getContext('2d');
        if (!ctx) return '#000000';
        ctx.fillStyle = value;
        return ctx.fillStyle;
    }
    return value;
}

function MoveWrapper({
    className,
    style,
    onChange,
    children,
}: MoveWrapperProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const move = useCallback(
        (e: React.MouseEvent | MouseEvent): void => {
            if (divRef.current) {
                const { current: div } = divRef;
                const { width, height, left, top } =
                    div.getBoundingClientRect();
                const x = clamp(e.clientX - left, width, 0);
                const y = clamp(e.clientY - top, height, 0);
                onChange({ x, y });
            }
        },
        [onChange],
    );

    const onMouseDown = useCallback(
        (e: React.MouseEvent): void => {
            if (e.button !== 0) return;
            move(e);
            const onMouseMove = (_e: MouseEvent): void => move(_e);
            const onMouseUp = (_e: MouseEvent): void => {
                document.removeEventListener('mousemove', onMouseMove, false);
                document.removeEventListener('mouseup', onMouseUp, false);
            };
            document.addEventListener('mousemove', onMouseMove, false);
            document.addEventListener('mouseup', onMouseUp, false);
        },
        [move],
    );

    return (
        <div
            ref={divRef}
            className={className}
            style={style}
            onMouseDown={onMouseDown}
        >
            {children}
        </div>
    );
}

function clamp(value: number, max: number, min: number): number {
    return value > max ? max : value < min ? min : value;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function transformColor<M extends keyof HSV, O extends Exclude<keyof HSV, M>>(
    format: M,
    from: HSV[M],
    to: O,
): HSV[O] {
    const {
        h: _h,
        s: _s,
        v: _v,
    } = { h: 0, s: 0, v: 0, ...{ [format]: from } } as HSV;
    switch (`${format}-${to}`) {
        case 'h-h':
            return from as HSV[O];
        default:
            return 0 as HSV[O];
    }
    return 0 as HSV[O];
}

function hexToHsv(hex: string): HSV {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToHex(h: number, s: number, v: number): string {
    const hs = s / 100;
    const vs = v / 100;
    const i = Math.floor((h / 60) % 6);
    const f = h / 60 - Math.floor(h / 60);
    const p = vs * (1 - hs);
    const q = vs * (1 - f * hs);
    const t = vs * (1 - (1 - f) * hs);

    let r = 0,
        g = 0,
        b = 0;
    switch (i) {
        case 0:
            r = vs;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = vs;
            b = p;
            break;
        case 2:
            r = p;
            g = vs;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = vs;
            break;
        case 4:
            r = t;
            g = p;
            b = vs;
            break;
        case 5:
            r = vs;
            g = p;
            b = q;
            break;
    }

    return (
        '#' +
        [r, g, b]
            .map((x) =>
                Math.round(x * 255)
                    .toString(16)
                    .padStart(2, '0'),
            )
            .join('')
    );
}

export default function ColorPicker({
    color,
    onChange,
}: ColorPickerProps): JSX.Element {
    const [selfColor, setSelfColor] = useState(() => hexToHsv(toHex(color)));
    const [inputColor, setInputColor] = useState(color);
    const _innerDivRef = useRef<HTMLDivElement>(null);

    const saturationPosition = useMemo(
        () => ({
            x: (selfColor.s / 100) * WIDTH,
            y: ((100 - selfColor.v) / 100) * HEIGHT,
        }),
        [selfColor.s, selfColor.v],
    );

    const huePosition = useMemo(
        () => ({ x: (selfColor.h / 360) * WIDTH }),
        [selfColor.h],
    );

    const onSetHex = useCallback((hex: string) => {
        setInputColor(hex);
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            const hsv = hexToHsv(hex);
            setSelfColor(hsv);
        }
    }, []);

    const onMoveSaturation = useCallback(
        ({ x, y }: Position) => {
            const newHsv = {
                ...selfColor,
                s: (x / WIDTH) * 100,
                v: 100 - (y / HEIGHT) * 100,
            };
            setSelfColor(newHsv);
            setInputColor(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
        },
        [selfColor],
    );

    const onMoveHue = useCallback(
        ({ x }: Position) => {
            const newHsv = { ...selfColor, h: (x / WIDTH) * 360 };
            setSelfColor(newHsv);
            setInputColor(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
        },
        [selfColor],
    );

    useEffect(() => {
        onChange?.(inputColor);
    }, [inputColor, onChange]);

    return (
        <div className="w-[230px] p-2 select-none">
            {/* Saturation */}
            <MoveWrapper
                className="relative cursor-crosshair overflow-hidden rounded-sm"
                style={{
                    width: WIDTH,
                    height: HEIGHT,
                    background: `hsl(${selfColor.h}deg, 100%, 50%)`,
                }}
                onChange={onMoveSaturation}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(to right, #fff, transparent)',
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(to bottom, transparent, #000)',
                    }}
                />
                <div
                    className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                    style={{
                        left: saturationPosition.x,
                        top: saturationPosition.y,
                        background: hsvToHex(
                            selfColor.h,
                            selfColor.s,
                            selfColor.v,
                        ),
                    }}
                />
            </MoveWrapper>

            {/* Hue */}
            <MoveWrapper
                className="relative mt-2 h-3 cursor-pointer rounded-full"
                style={{
                    width: WIDTH,
                    background:
                        'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
                }}
                onChange={onMoveHue}
            >
                <div
                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                    style={{
                        left: huePosition.x,
                        background: `hsl(${selfColor.h}deg, 100%, 50%)`,
                    }}
                />
            </MoveWrapper>

            {/* Input */}
            <div className="mt-2 flex items-center gap-2">
                <div
                    className="h-8 w-8 flex-shrink-0 rounded border border-border"
                    style={{ background: inputColor }}
                />
                <input
                    className="h-8 flex-1 rounded border border-input bg-transparent px-2 font-mono text-sm uppercase outline-none focus:ring-1 focus:ring-ring"
                    value={inputColor}
                    onChange={(e) => onSetHex(e.target.value)}
                />
            </div>

            {/* Basic Colors */}
            <div className="mt-2 flex flex-wrap gap-1">
                {basicColors.map((basicColor) => (
                    <button
                        key={basicColor}
                        className={cn(
                            'h-5 w-5 cursor-pointer rounded-sm border border-border',
                            basicColor === inputColor &&
                                'ring-1 ring-primary ring-offset-1',
                        )}
                        style={{ background: basicColor }}
                        onClick={() => {
                            onSetHex(basicColor);
                            onChange?.(basicColor);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
