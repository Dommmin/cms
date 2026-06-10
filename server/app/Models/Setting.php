<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SettingTypeEnum;
use App\Models\Builders\SettingBuilder;
use Carbon\CarbonImmutable;
use Exception;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Crypt;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property string $group
 * @property string $key
 * @property string|null $label
 * @property mixed $value
 * @property SettingTypeEnum $type
 * @property string|null $description
 * @property bool $is_public
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 *
 * @method static SettingBuilder<static>|Setting newModelQuery()
 * @method static SettingBuilder<static>|Setting newQuery()
 * @method static SettingBuilder<static>|Setting query()
 * @method static Setting|null findByGroupAndKey(string $group, string $key)
 * @method static Collection getPublicSettings()
 * @method static SettingBuilder<static>|Setting whereCreatedAt($value)
 * @method static SettingBuilder<static>|Setting whereDescription($value)
 * @method static SettingBuilder<static>|Setting whereGroup($value)
 * @method static SettingBuilder<static>|Setting whereId($value)
 * @method static SettingBuilder<static>|Setting whereIsPublic($value)
 * @method static SettingBuilder<static>|Setting whereKey($value)
 * @method static SettingBuilder<static>|Setting whereLabel($value)
 * @method static SettingBuilder<static>|Setting whereType($value)
 * @method static SettingBuilder<static>|Setting whereUpdatedAt($value)
 * @method static SettingBuilder<static>|Setting whereValue($value)
 *
 * @mixin Model
 */
#[Fillable([
    'group', 'key', 'label', 'value', 'type', 'description', 'is_public',
])]
#[Table(name: 'settings')]
class Setting extends Model
{
    use HasFactory;
    use LogsActivity;

    /** Pobierz wartość ustawienia */
    public static function get(string $group, string $key, mixed $default = null): mixed
    {
        $setting = self::findByGroupAndKey($group, $key);

        if (! $setting) {
            return $default;
        }

        $value = $setting->value;

        // Decrypt jeśli encrypted
        if ($setting->type === SettingTypeEnum::Encrypted && $value) {
            try {
                return Crypt::decryptString((string) $value);
            } catch (Exception) {
                return null;
            }
        }

        return $value;
    }

    /** Ustawia wartość */
    public static function set(string $group, string $key, mixed $value): void
    {
        $setting = self::findByGroupAndKey($group, $key);

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
        return self::getPublicSettings()
            ->map(fn (self $setting): array => [
                'group' => $setting->group,
                'key' => $setting->key,
                'value' => $setting->value,
            ])
            ->all();
    }

    /**
     * Create a new Eloquent query builder for the model.
     *
     * @param  Builder  $query
     * @return SettingBuilder<static>
     */
    public function newEloquentBuilder($query): SettingBuilder
    {
        /** @var SettingBuilder<static> */
        $builder = new SettingBuilder($query);

        return $builder;
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['value'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('setting');
    }

    protected function casts(): array
    {
        return [
            'type' => SettingTypeEnum::class,
            'is_public' => 'boolean',
            'value' => 'json',
        ];
    }
}
