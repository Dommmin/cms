<?php

declare(strict_types=1);

namespace App\Modules\Core\Domain\Models;

use App\Enums\SettingType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

final class Setting extends Model
{
    protected $table = 'settings';

    protected $fillable = [
        'group', 'key', 'value', 'type', 'description', 'is_public',
    ];

    protected $casts = [
        'type'      => SettingType::class,
        'is_public' => 'boolean',
        'value'     => 'json',
    ];

    /** Pobierz wartość ustawienia */
    public static function get(string $group, string $key, mixed $default = null): mixed
    {
        $setting = self::where('group', $group)->where('key', $key)->first();

        if (!$setting) return $default;

        $value = $setting->value;

        // Decrypt jeśli encrypted
        if ($setting->type === SettingType::Encrypted && $value) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception) {
                return null;
            }
        }

        return $value;
    }

    /** Ustawia wartość */
    public static function set(string $group, string $key, mixed $value): void
    {
        $setting = self::where('group', $group)->where('key', $key)->first();

        if (!$setting) return;

        // Encrypt jeśli encrypted type
        if ($setting->type === SettingType::Encrypted && $value) {
            $value = Crypt::encryptString((string) $value);
        }

        $setting->update(['value' => $value]);
    }

    /** Pobierz wszystkie public settings (dla frontend) */
    public static function allPublic(): array
    {
        return self::where('is_public', true)
            ->get()
            ->mapWith(function (self $setting) {
                return [
                    'group' => $setting->group,
                    'key'   => $setting->key,
                    'value' => $setting->value,
                ];
            })
            ->all();
    }
}

