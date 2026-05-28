<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SettingTypeEnum;
use Exception;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property int $id
 * @property string $group
 * @property string $key
 * @property string|null $label
 * @property array<array-key, mixed>|null $value
 * @property SettingTypeEnum $type
 * @property string|null $description
 * @property bool $is_public
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereGroup($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereIsPublic($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Setting whereValue($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'group', 'key', 'label', 'value', 'type', 'description', 'is_public',
])]
#[Table(name: 'settings')]
class Setting extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $casts = [
        'type' => SettingTypeEnum::class,
        'is_public' => 'boolean',
        'value' => 'json',
    ];

    /** Pobierz wartość ustawienia */
    public static function get(string $group, string $key, mixed $default = null): mixed
    {
        $setting = self::query()->where('group', $group)->where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        $value = $setting->value;

        // Decrypt jeśli encrypted
        if ($setting->type === SettingTypeEnum::Encrypted && $value) {
            try {
                return Crypt::decryptString($value);
            } catch (Exception) {
                return null;
            }
        }

        return $value;
    }

    /** Ustawia wartość */
    public static function set(string $group, string $key, mixed $value): void
    {
        $setting = self::query()->where('group', $group)->where('key', $key)->first();

        if (! $setting) {
            return;
        }

        // Encrypt jeśli encrypted type
        if ($setting->type === SettingTypeEnum::Encrypted && $value) {
            $value = Crypt::encryptString((string) $value);
        }

        $setting->update(['value' => $value]);
    }

    /** Pobierz wszystkie public settings (dla frontend) */
    public static function allPublic(): array
    {
        return self::query()->where('is_public', true)
            ->get()
            ->mapWith(fn (self $setting): array => [
                'group' => $setting->group,
                'key' => $setting->key,
                'value' => $setting->value,
            ])
            ->all();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['value'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('setting');
    }
}
