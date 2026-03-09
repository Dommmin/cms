import { usePage } from '@inertiajs/react';
import { useState } from 'react';

import { LocaleTabSwitcher } from '@/components/locale-tab-switcher';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import type { SharedLocale } from '@/types/global';

interface Props {
    label: string;
    value: Record<string, string>;
    onChange: (value: Record<string, string>) => void;
    /** Defaults to 'input'. */
    type?: 'input' | 'textarea' | 'richtext' | 'markdown';
    placeholder?: string;
    required?: boolean;
    /**
     * Field name used to look up errors.
     * Supports both `errors[name]` (top-level) and `errors["name.en"]` (per-locale).
     */
    name?: string;
    errors?: Record<string, string>;
    rows?: number;
    id?: string;
}

/**
 * A locale-aware field wrapper that adds a locale tab switcher alongside any
 * input, textarea, richtext, or markdown editor. Reads available locales from
 * shared Inertia props — no extra setup required.
 *
 * Usage:
 * ```tsx
 * <LocalizedField
 *     label="Title"
 *     name="title"
 *     type="input"
 *     value={data.title}
 *     onChange={(v) => setData((prev) => ({ ...prev, title: v }))}
 *     errors={errors}
 *     required
 * />
 * ```
 */
export function LocalizedField({
    label,
    value,
    onChange,
    type = 'input',
    placeholder,
    required,
    name,
    errors,
    rows = 3,
    id,
}: Props) {
    const { locales = [] } = usePage<{ locales: SharedLocale[] }>().props;
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? 'en';
    const [activeLocale, setActiveLocale] = useState(defaultLocale);

    const update = (val: string) => {
        onChange({ ...value, [activeLocale]: val });
    };

    const fieldId = id ?? `${name ?? label.toLowerCase().replace(/\s+/g, '_')}_${activeLocale}`;

    // Collect per-locale errors (e.g., "title.en") and a generic top-level error.
    const localeErrors = name && errors
        ? locales.filter((l) => !!errors[`${name}.${l.code}`])
        : [];
    const topLevelError = name ? errors?.[name] : undefined;
    const hasLocaleErrors = localeErrors.length > 0;
    const activeLocaleError = name ? errors?.[`${name}.${activeLocale}`] : undefined;

    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between">
                <Label htmlFor={fieldId}>
                    {label}
                    {required && ' *'}
                </Label>
                {locales.length > 1 && (
                    <LocaleTabSwitcher
                        locales={locales}
                        activeLocale={activeLocale}
                        onLocaleChange={setActiveLocale}
                    />
                )}
            </div>

            {type === 'input' && (
                <Input
                    id={fieldId}
                    value={value[activeLocale] ?? ''}
                    onChange={(e) => update(e.target.value)}
                    placeholder={placeholder ?? label}
                    className={activeLocaleError ? 'border-destructive' : ''}
                />
            )}

            {type === 'textarea' && (
                <Textarea
                    id={fieldId}
                    value={value[activeLocale] ?? ''}
                    onChange={(e) => update(e.target.value)}
                    placeholder={placeholder ?? label}
                    rows={rows}
                    className={activeLocaleError ? 'border-destructive' : ''}
                />
            )}

            {type === 'richtext' && (
                <RichTextEditor
                    key={`richtext-${activeLocale}`}
                    value={value[activeLocale] ?? ''}
                    onChange={update}
                    placeholder={placeholder ?? label}
                />
            )}

            {type === 'markdown' && (
                <MarkdownEditor
                    key={`markdown-${activeLocale}`}
                    value={value[activeLocale] ?? ''}
                    onChange={update}
                />
            )}

            {/* Show per-locale errors (e.g. "EN: The title field is required."). */}
            {hasLocaleErrors &&
                localeErrors.map((l) => (
                    <p key={l.code} className="text-xs text-destructive">
                        {l.code.toUpperCase()}: {errors![`${name}.${l.code}`]}
                    </p>
                ))}

            {/* Fallback to top-level error when no per-locale errors exist. */}
            {!hasLocaleErrors && topLevelError && (
                <p className="text-xs text-destructive">{topLevelError}</p>
            )}
        </div>
    );
}
