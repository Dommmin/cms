import { usePage } from '@inertiajs/react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LocaleData, LocalizedInputProps } from './localized-input.types';

export function LocalizedInput({ label, value, onChange, placeholder, required, error }: LocalizedInputProps) {
    const { locales = [] } = usePage<{ locales: LocaleData[] }>().props;

    return (
        <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">
                {label}
                {required && ' *'}
            </Label>
            <div className="space-y-1.5">
                {locales.map((locale) => (
                    <div key={locale.code} className="flex gap-2">
                        <span className="flex h-9 min-w-[3.5rem] items-center justify-center rounded-md border bg-muted px-2 text-xs font-medium text-muted-foreground">
                            {locale.flag_emoji} {locale.code.toUpperCase()}
                        </span>
                        <Input
                            value={value[locale.code] ?? ''}
                            onChange={(e) => onChange({ ...value, [locale.code]: e.target.value })}
                            placeholder={placeholder ?? label}
                            className={error ? 'border-destructive' : ''}
                        />
                    </div>
                ))}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
