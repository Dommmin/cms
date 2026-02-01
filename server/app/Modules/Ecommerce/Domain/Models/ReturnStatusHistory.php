<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ReturnStatusHistory extends Model
{
    protected $table = 'return_status_history';

    protected $fillable = [
        'return_id', 'previous_status', 'new_status',
        'changed_by', 'notes', 'changed_at',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    public function return(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Ecommerce\Domain\Models\ReturnRequest::class);
    }
}

