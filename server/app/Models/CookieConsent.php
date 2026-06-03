<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\CookieConsentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
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
 * @property array<string, mixed>|null $policy_version_snapshot
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 *
 * @method static CookieConsentFactory factory($count = null, $state = [])
 * @method static Builder<static>|CookieConsent newModelQuery()
 * @method static Builder<static>|CookieConsent newQuery()
 * @method static Builder<static>|CookieConsent query()
 * @method static Builder<static>|CookieConsent whereCategory($value)
 * @method static Builder<static>|CookieConsent whereConsentVersion($value)
 * @method static Builder<static>|CookieConsent whereCreatedAt($value)
 * @method static Builder<static>|CookieConsent whereGranted($value)
 * @method static Builder<static>|CookieConsent whereId($value)
 * @method static Builder<static>|CookieConsent whereIp($value)
 * @method static Builder<static>|CookieConsent whereSessionId($value)
 * @method static Builder<static>|CookieConsent whereUpdatedAt($value)
 * @method static Builder<static>|CookieConsent whereUserAgent($value)
 * @method static Builder<static>|CookieConsent whereUserId($value)
 *
 * @mixin Model
 */
#[Fillable([
    'session_id',
    'user_id',
    'category',
    'granted',
    'ip',
    'user_agent',
    'consent_version',
    'policy_version_snapshot',
])]
#[Table(name: 'cookie_consents')]
class CookieConsent extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'granted' => 'boolean',
            'policy_version_snapshot' => 'array',
        ];
    }
}
