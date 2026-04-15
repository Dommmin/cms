<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property bool $granted
 * @property string $consent_version
 */
#[Fillable([
    'session_id',
    'user_id',
    'category',
    'granted',
    'ip',
    'user_agent',
    'consent_version',
])]
#[Table(name: 'cookie_consents')]
class CookieConsent extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'granted' => 'boolean',
        ];
    }
}
