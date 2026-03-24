import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $patchStyleText } from '@lexical/selection';
import { $getSelection, $isRangeSelection } from 'lexical';
import { type JSX } from 'react';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import type { FontFamilyProps, FontSizeProps } from './FontDropdown.types';

const FONT_FAMILIES = [
    'Arial',
    'Courier New',
    'Georgia',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Poppins',
];

const FONT_SIZES = [
    '10px',
    '11px',
    '12px',
    '13px',
    '14px',
    '15px',
    '16px',
    '17px',
    '18px',
    '19px',
    '20px',
    '22px',
    '24px',
    '26px',
    '28px',
    '30px',
    '32px',
    '36px',
    '40px',
    '42px',
    '48px',
    '56px',
    '64px',
    '72px',
    '80px',
    '96px',
    '112px',
    '128px',
];

export function FontFamilyDropdown({
    value,
    disabled,
    onChange,
}: FontFamilyProps): JSX.Element {
    const [editor] = useLexicalComposerContext();

    const handleChange = (font: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, { 'font-family': font });
            }
        });
        onChange(font);
    };

    return (
        <DropDown
            disabled={disabled}
            label={
                <span className="min-w-[100px] truncate text-sm">{value}</span>
            }
            buttonAriaLabel="Formatting options for font family"
            tooltip="Font family"
        >
            {FONT_FAMILIES.map((font) => (
                <DropDownItem
                    key={font}
                    onClick={() => handleChange(font)}
                    active={value === font}
                >
                    <span style={{ fontFamily: font }} className="text-sm">
                        {font}
                    </span>
                </DropDownItem>
            ))}
        </DropDown>
    );
}

export function FontSizeDropdown({
    value,
    disabled,
    onChange,
}: FontSizeProps): JSX.Element {
    const [editor] = useLexicalComposerContext();

    const handleChange = (size: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, { 'font-size': size });
            }
        });
        onChange(size);
    };

    return (
        <DropDown
            disabled={disabled}
            label={<span className="w-12 text-center text-sm">{value}</span>}
            buttonAriaLabel="Formatting options for font size"
            tooltip="Font size"
        >
            {FONT_SIZES.map((size) => (
                <DropDownItem
                    key={size}
                    onClick={() => handleChange(size)}
                    active={value === size}
                >
                    <span className="text-sm">{size}</span>
                </DropDownItem>
            ))}
        </DropDown>
    );
}
