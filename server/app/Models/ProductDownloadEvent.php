<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductDownloadEvent extends Model
{
    use HasFactory;

    protected $table = 'product_download_events';

    protected $fillable = [
        'product_download_link_id',
        'user_id',
        'ip_address',
        'user_agent',
    ];

    public function link(): BelongsTo
    {
        return $this->belongsTo(ProductDownloadLink::class, 'product_download_link_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
