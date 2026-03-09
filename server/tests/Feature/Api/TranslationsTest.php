<?php

declare(strict_types=1);

use App\Models\Locale;
use App\Models\Translation;
use Illuminate\Support\Facades\Cache;

it('returns flat translations for a locale', function () {
    $locale = Locale::create([
        'code' => 'test',
        'name' => 'Test',
        'native_name' => 'Test',
        'is_default' => false,
        'is_active' => true,
    ]);

    Translation::create(['locale_code' => 'test', 'group' => 'nav', 'key' => 'home', 'value' => 'Home Test']);
    Translation::create(['locale_code' => 'test', 'group' => 'cart', 'key' => 'empty', 'value' => 'Empty Test']);

    Cache::forget('translations.test');

    $response = $this->getJson('/api/v1/translations/test');

    $response->assertOk()
        ->assertJson([
            'nav.home' => 'Home Test',
            'cart.empty' => 'Empty Test',
        ]);

    $locale->delete();
});

it('falls back to english when locale has no translations', function () {
    $enLocale = Locale::firstOrCreate(
        ['code' => 'en'],
        ['name' => 'English', 'native_name' => 'English', 'is_default' => true, 'is_active' => true]
    );

    Translation::firstOrCreate(
        ['locale_code' => 'en', 'group' => 'nav', 'key' => 'home'],
        ['value' => 'Home']
    );

    Cache::forget('translations.zz');

    $response = $this->getJson('/api/v1/translations/zz');

    $response->assertOk()
        ->assertJson(['nav.home' => 'Home']);
});

it('returns public locales list', function () {
    Locale::firstOrCreate(
        ['code' => 'en'],
        ['name' => 'English', 'native_name' => 'English', 'is_default' => true, 'is_active' => true]
    );

    $response = $this->getJson('/api/v1/locales');

    $response->assertOk()
        ->assertJsonStructure([['code', 'name', 'native_name', 'flag_emoji', 'is_default']]);
});
