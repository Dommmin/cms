<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property bool $granted
 * @property string $consent_version
 */
class CookieConsent extends Model
{
    use HasFactory;

    protected $table = 'cookie_consents';

    protected $fillable = [
        'session_id',
        'user_id',
        'category',
        'granted',
        'ip',
        'user_agent',
        'consent_version',
    ];

    protected function casts(): array
    {
        return [
            'granted' => 'boolean',
        ];
    }
}
