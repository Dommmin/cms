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
 * @property string|null $session_id
 * @property int|null $user_id
 * @property string $category
 * @property string|null $ip
 * @property string|null $user_agent
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Database\Factories\CookieConsentFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent whereConsentVersion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent whereGranted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent whereIp($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent whereSessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent whereUserAgent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CookieConsent whereUserId($value)
 * @mixin \Eloquent
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
