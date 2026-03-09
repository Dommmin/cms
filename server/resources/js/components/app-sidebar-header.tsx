import { usePage } from '@inertiajs/react';
import { Laptop, Moon, Sun } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { CommandPalette } from '@/components/command-palette';
import { NotificationBell } from '@/components/notification-bell';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { useAdminLocale } from '@/hooks/use-admin-locale';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

const THEME_ICONS: Record<Appearance, React.ReactNode> = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    system: <Laptop className="h-4 w-4" />,
};

const THEME_CYCLE: Record<Appearance, Appearance> = {
    light: 'dark',
    dark: 'system',
    system: 'light',
};

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { appearance, updateAppearance } = useAppearance();
    const { locales } = usePage().props;
    const defaultLocale = locales.find((l) => l.is_default)?.code ?? locales[0]?.code ?? 'en';
    const [adminLocale, setAdminLocale] = useAdminLocale(defaultLocale);

    const activeLocaleObj = locales.find((l) => l.code === adminLocale) ?? locales[0];

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="ml-auto flex items-center gap-1">
                {/* Locale switcher — only show if more than one locale */}
                {locales.length > 1 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs font-medium">
                                {activeLocaleObj?.flag_emoji && (
                                    <span className="text-base leading-none">{activeLocaleObj.flag_emoji}</span>
                                )}
                                <span className="uppercase">{adminLocale}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[140px]">
                            {locales.map((locale) => (
                                <DropdownMenuItem
                                    key={locale.code}
                                    onClick={() => setAdminLocale(locale.code)}
                                    className="gap-2"
                                    data-active={locale.code === adminLocale}
                                >
                                    {locale.flag_emoji && <span className="text-base">{locale.flag_emoji}</span>}
                                    <span className="flex-1">{locale.native_name ?? locale.name}</span>
                                    {locale.code === adminLocale && (
                                        <span className="ml-auto text-xs text-muted-foreground">✓</span>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* Theme toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateAppearance(THEME_CYCLE[appearance])}
                    title={`Switch to ${THEME_CYCLE[appearance]} mode`}
                >
                    {THEME_ICONS[appearance]}
                </Button>

                <NotificationBell />
                <CommandPalette />
            </div>
        </header>
    );
}
