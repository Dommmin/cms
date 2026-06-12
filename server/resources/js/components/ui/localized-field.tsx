import { usePage } from '@inertiajs/react';
import { useState } from 'react';

import { LocaleTabSwitcher } from '@/components/locale-tab-switcher';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import type { SharedLocale } from '@/types/global';
import type { LocalizedFieldProps } from './localized-field.types';

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
    headerEnd,
    hideLabel = false,
    jsonValue,
    onJsonChange,
    autoFocus,
    localeSwitcherClassName,
}: LocalizedFieldProps) {
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
            {name &&
                locales.map((locale) => (
                    <input
                        key={`hidden-${name}-${locale.code}`}
                        type="hidden"
                        name={`${name}[${locale.code}]`}
                        value={value[locale.code] ?? ''}
                    />
                ))}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                {!hideLabel && (
                    <Label htmlFor={fieldId}>
                        {label}
                        {required && ' *'}
                    </Label>
                )}
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:justify-end">
                    {headerEnd}
                    {locales.length > 1 && (
                        <LocaleTabSwitcher
                            locales={locales}
                            activeLocale={activeLocale}
                            onLocaleChange={setActiveLocale}
                            className={localeSwitcherClassName}
                        />
                    )}
                </div>
            </div>

            {type === 'input' && (
                <Input
                    id={fieldId}
                    value={value[activeLocale] ?? ''}
                    onChange={(e) => update(e.target.value)}
                    placeholder={placeholder ?? label}
                    className={activeLocaleError ? 'border-destructive' : ''}
                    autoFocus={autoFocus}
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
                    jsonValue={jsonValue?.[activeLocale]}
                    onJsonChange={
                        onJsonChange
                            ? (json) =>
                                  onJsonChange({
                                      ...(jsonValue ?? {}),
                                      [activeLocale]: json,
                                  })
                            : undefined
                    }
                    placeholder={placeholder ?? label}
                    instanceKey={`${activeLocale}`}
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
