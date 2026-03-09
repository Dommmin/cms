"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, Package, User, UserCircle } from "lucide-react";

import { useLogout, useMe } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { useLocalePath } from "@/hooks/use-locale";

export function AuthButton() {
  const { data: user } = useMe();
  const { mutate: logout, isPending } = useLogout();
  const { t } = useTranslation();
  const lp = useLocalePath();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (user) {
    return (
      <div ref={ref} className="relative hidden md:block">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={t("account.user_account", "User account")}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <UserCircle className="h-5 w-5" />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border bg-popover shadow-lg">
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <nav className="p-1">
              <Link
                href={lp("/account/orders")}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <Package className="h-4 w-4 text-muted-foreground" />
                {t("account.my_orders", "My Orders")}
              </Link>
              <Link
                href={lp("/account/profile")}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                {t("nav.profile", "Profile")}
              </Link>
            </nav>
            <div className="border-t border-border p-1">
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                disabled={isPending}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {t("account.sign_out", "Sign out")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={lp("/login")}
      className="hidden items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground md:flex"
    >
      <UserCircle className="h-5 w-5" />
      {t("nav.login", "Login")}
    </Link>
  );
}
