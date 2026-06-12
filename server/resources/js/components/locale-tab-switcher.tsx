import { cn } from '@/lib/utils';
import type { LocaleTabSwitcherProps } from './locale-tab-switcher.types';

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
        <div
            className={cn(
                'flex max-w-full flex-nowrap gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0',
                className,
            )}
        >
            {locales.map((locale) => (
                <button
                    key={locale.code}
                    type="button"
                    onClick={() => onLocaleChange(locale.code)}
                    className={cn(
                        'flex shrink-0 items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium transition-colors',
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
