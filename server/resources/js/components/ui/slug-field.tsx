import { useState } from 'react';

import { LocaleTabSwitcher } from '@/components/locale-tab-switcher';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { slugify } from '@/lib/slug';

import type { SlugFieldProps } from './slug-field.types';

export function SlugField({
    label = 'Slug',
    name = 'slug',
    value,
    onChange,
    autoGenerate,
    onAutoGenerateChange,
    locales,
    errors,
    required,
    id,
}: SlugFieldProps & {
    autoGenerate: boolean;
    onAutoGenerateChange: (auto: boolean) => void;
}) {
    const defaultLocale =
        locales.find((l) => l.is_default)?.code ?? 'en';
    const [activeLocale, setActiveLocale] = useState(defaultLocale);

    const handleToggle = (checked: boolean) => {
        onAutoGenerateChange(checked);
    };

    const handleSlugInput = (val: string) => {
        onChange({ ...value, [activeLocale]: slugify(val) });
    };

    const fieldId = id ?? `${name}_${activeLocale}`;

    const localeErrors = errors
        ? locales.filter((l) => !!errors[`${name}.${l.code}`])
        : [];
    const topLevelError = errors?.[name];
    const hasLocaleErrors = localeErrors.length > 0;
    const activeLocaleError = errors?.[`${name}.${activeLocale}`];

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

            <Input
                id={fieldId}
                value={value[activeLocale] ?? ''}
                readOnly={autoGenerate}
                onChange={(e) => handleSlugInput(e.target.value)}
                placeholder={
                    autoGenerate
                        ? 'auto-generated-from-title'
                        : 'enter-slug'
                }
                className={activeLocaleError ? 'border-destructive' : ''}
            />

            {hasLocaleErrors &&
                localeErrors.map((l) => (
                    <p key={l.code} className="text-xs text-destructive">
                        {l.code.toUpperCase()}:{' '}
                        {errors![`${name}.${l.code}`]}
                    </p>
                ))}
            {!hasLocaleErrors && topLevelError && (
                <p className="text-xs text-destructive">{topLevelError}</p>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch
                    checked={autoGenerate}
                    onCheckedChange={handleToggle}
                />
                {autoGenerate ? 'Auto-generated from title' : 'Manual slug'}
            </div>
        </div>
    );
}
