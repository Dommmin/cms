'use client';

import { LogOut, Package, User, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useLogout, useMe } from '@/hooks/use-auth';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';

function getInitial(user: {
    name?: string | null;
    email?: string | null;
}): string {
    const source = user.name?.trim() || user.email?.trim() || 'U';
    return source[0]?.toUpperCase() ?? 'U';
}

export function AuthButton() {
    const { data: user } = useMe();
    const { mutate: logout, isPending } = useLogout();
    const { t } = useTranslation();
    const lp = useLocalePath();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside or pressing Escape
    useEffect(() => {
        setMounted(true);

        function handleClick(e: MouseEvent) {
            const target = e.target as Node;
            if (ref.current && !ref.current.contains(target)) setOpen(false);
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

    useEffect(() => {
        if (!open || !ref.current) return;

        function updatePosition() {
            const rect = ref.current?.getBoundingClientRect();
            if (!rect) return;
            setPosition({
                top: rect.bottom + 8,
                left: rect.right,
                width: rect.width,
            });
        }

        updatePosition();
        window.addEventListener('scroll', updatePosition, { passive: true });
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [open]);

    if (user) {
        return (
            <div
                ref={ref}
                className="relative hidden md:block"
                style={{ zIndex: 60 }}
            >
                <button
                    onClick={() => {
                        if (!open && ref.current) {
                            const rect = ref.current.getBoundingClientRect();
                            setPosition({
                                top: rect.bottom + 8,
                                left: rect.right,
                                width: rect.width,
                            });
                        }
                        setOpen((v) => !v);
                    }}
                    aria-label={t('account.user_account', 'User account')}
                    aria-expanded={open}
                    aria-haspopup="true"
                    aria-controls="account-dropdown"
                    className="border-border text-muted-foreground hover:border-primary hover:text-primary flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
                >
                    <span className="bg-muted text-foreground flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                        {getInitial(user)}
                    </span>
                </button>

                {open && mounted && typeof document !== 'undefined'
                    ? createPortal(
                          <div
                              id="account-dropdown"
                              className="border-border bg-popover fixed w-52 rounded-xl border shadow-lg"
                              style={{
                                  top: position.top,
                                  left: Math.max(8, position.left - 208),
                                  zIndex: 210,
                              }}
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
                          </div>,
                          document.body,
                      )
                    : null}
            </div>
        );
    }

    return (
        <Link
            href={lp('/login')}
            className="text-foreground/80 hover:text-foreground hidden items-center gap-1.5 text-sm font-medium transition-colors md:flex"
        >
            <UserCircle className="h-5 w-5" aria-hidden="true" />
            {/*{t('nav.login', 'Login')}*/}
        </Link>
    );
}
