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
