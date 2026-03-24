import { cn } from '@/lib/utils';
import type { Locale, LocaleTabSwitcherProps } from './locale-tab-switcher.types';

export function LocaleTabSwitcher({
    locales,
    activeLocale,
    onLocaleChange,
    className,
}: LocaleTabSwitcherProps) {
    if (locales.length <= 1) {
        return null;
    }

    return (
        <div className={cn('flex flex-wrap gap-1', className)}>
            {locales.map((locale) => (
                <button
                    key={locale.code}
                    type="button"
                    onClick={() => onLocaleChange(locale.code)}
                    className={cn(
                        'flex items-center gap-1 rounded border px-2 py-0.5 text-xs transition-colors',
                        activeLocale === locale.code
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input bg-background text-muted-foreground hover:border-ring hover:text-foreground',
                    )}
                >
                    {locale.flag_emoji && <span>{locale.flag_emoji}</span>}
                    <span>{locale.code.toUpperCase()}</span>
                </button>
            ))}
        </div>
    );
}
