<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'product_download_link_id',
    'user_id',
    'ip_address',
    'user_agent',
])]
#[Table(name: 'product_download_events')]
class ProductDownloadEvent extends Model
{
    use HasFactory;

    public function link(): BelongsTo
    {
        return $this->belongsTo(ProductDownloadLink::class, 'product_download_link_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
