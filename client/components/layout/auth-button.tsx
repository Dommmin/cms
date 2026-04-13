'use client';

import { LogOut, Package, User, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { useLogout, useMe } from '@/hooks/use-auth';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';

export function AuthButton() {
    const { data: user } = useMe();
    const { mutate: logout, isPending } = useLogout();
    const { t } = useTranslation();
    const lp = useLocalePath();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside or pressing Escape
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    if (user) {
        return (
            <div ref={ref} className="relative hidden md:block">
                <button
                    onClick={() => setOpen((v) => !v)}
                    aria-label={t('account.user_account', 'User account')}
                    aria-expanded={open}
                    aria-haspopup="true"
                    aria-controls="account-dropdown"
                    className="border-border text-muted-foreground hover:border-primary hover:text-primary flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
                >
                    <UserCircle className="h-5 w-5" aria-hidden="true" />
                </button>

                {open && (
                    <div
                        id="account-dropdown"
                        className="border-border bg-popover absolute top-full right-0 z-50 mt-2 w-52 rounded-xl border shadow-lg"
                    >
                        <div className="border-border border-b px-4 py-3">
                            <p className="truncate text-sm font-semibold">
                                {user.name}
                            </p>
                            <p className="text-muted-foreground truncate text-xs">
                                {user.email}
                            </p>
                        </div>
                        <nav
                            aria-label={t(
                                'account.account_nav',
                                'Account navigation',
                            )}
                            className="p-1"
                        >
                            <Link
                                href={lp('/account/orders')}
                                onClick={() => setOpen(false)}
                                className="hover:bg-accent flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors"
                            >
                                <Package
                                    className="text-muted-foreground h-4 w-4"
                                    aria-hidden="true"
                                />
                                {t('account.my_orders', 'My Orders')}
                            </Link>
                            <Link
                                href={lp('/account/profile')}
                                onClick={() => setOpen(false)}
                                className="hover:bg-accent flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors"
                            >
                                <User
                                    className="text-muted-foreground h-4 w-4"
                                    aria-hidden="true"
                                />
                                {t('nav.profile', 'Profile')}
                            </Link>
                        </nav>
                        <div className="border-border border-t p-1">
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    logout();
                                }}
                                disabled={isPending}
                                aria-busy={isPending}
                                className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50"
                            >
                                <LogOut
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                {t('account.sign_out', 'Sign out')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={lp('/login')}
            className="text-foreground/80 hover:text-foreground hidden items-center gap-1.5 text-sm font-medium transition-colors md:flex"
        >
            <UserCircle className="h-5 w-5" aria-hidden="true" />
            {t('nav.login', 'Login')}
        </Link>
    );
}
