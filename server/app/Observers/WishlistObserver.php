<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Wishlist;
use Illuminate\Support\Str;

class WishlistObserver
{
    public function creating(Wishlist $wishlist): void
    {
        $wishlist->token ??= Str::random(32);
    }
}
