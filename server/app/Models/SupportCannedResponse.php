<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportCannedResponse extends Model
{
    use HasFactory;

    protected $table = 'support_canned_responses';

    protected $fillable = [
        'title', 'shortcut', 'body',
    ];
}
