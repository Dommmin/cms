<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'title', 'shortcut', 'body',
])]
#[Table(name: 'support_canned_responses')]
class SupportCannedResponse extends Model
{
    use HasFactory;
}
