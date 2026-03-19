"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { useWishlist } from "@/hooks/use-wishlist";
import { useMe } from "@/hooks/use-auth";
import { useLocalePath } from "@/hooks/use-locale";

export function WishlistButton() {
  const { data: user } = useMe();
  const { data: wishlist } = useWishlist();
  const lp = useLocalePath();
  const count = wishlist?.items?.length ?? 0;

  if (!user) return null;

  return (
    <Link
      href={lp("/account/wishlist")}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
      aria-label={`Wishlist${count > 0 ? ` (${count})` : ""}`}
    >
      <Heart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
