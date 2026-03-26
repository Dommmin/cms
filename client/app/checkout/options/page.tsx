import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus, ShoppingBag, ArrowLeft } from "lucide-react";

import { localePath } from "@/lib/i18n";

export default async function CheckoutOptionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const locale = cookieStore.get("locale")?.value ?? "en";

  // Already authenticated — skip the options screen
  if (token) {
    redirect(localePath(locale, "/checkout"));
  }

  const lp = (path: string) => localePath(locale, path);

  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <div className="mb-8 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="mb-2 text-2xl font-bold">How would you like to continue?</h1>
        <p className="text-muted-foreground">
          Sign in for a faster experience, or check out as a guest.
        </p>
      </div>

      <div className="space-y-3">
        {/* Log in */}
        <Link
          href={lp("/login?redirect=/checkout")}
          className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/60 hover:bg-accent"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LogIn className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Log In</p>
            <p className="text-sm text-muted-foreground">
              Use your existing account for saved addresses and order history.
            </p>
          </div>
        </Link>

        {/* Create account */}
        <Link
          href={lp("/register?redirect=/checkout")}
          className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/60 hover:bg-accent"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Create Account</p>
            <p className="text-sm text-muted-foreground">
              Register to track orders and save your details for next time.
            </p>
          </div>
        </Link>

        {/* Continue as guest */}
        <Link
          href={lp("/checkout")}
          className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/60 hover:bg-accent"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Continue as Guest</p>
            <p className="text-sm text-muted-foreground">
              No account needed. Just enter your email to receive order confirmation.
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-8 text-center">
        <Link
          href={lp("/cart")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
      </div>
    </div>
  );
}
