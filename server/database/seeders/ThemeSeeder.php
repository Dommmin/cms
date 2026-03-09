<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Theme;
use Illuminate\Database\Seeder;

class ThemeSeeder extends Seeder
{
    public function run(): void
    {
        $presets = [
            [
                'name' => 'Ocean Calm',
                'slug' => 'ocean-calm',
                'description' => 'Cool preset with a blue-teal accent.',
                'tokens' => [
                    'background' => '#eaf6ff',
                    'foreground' => '#0f172a',
                    'card' => '#ffffff',
                    'card-foreground' => '#082f49',
                    'popover' => '#ffffff',
                    'popover-foreground' => '#082f49',
                    'primary' => '#0f766e',
                    'primary-foreground' => '#ecfeff',
                    'secondary' => '#c7e7ff',
                    'secondary-foreground' => '#1e3a8a',
                    'muted' => '#dbeafe',
                    'muted-foreground' => '#334155',
                    'accent' => '#67e8f9',
                    'accent-foreground' => '#164e63',
                    'destructive' => '#dc2626',
                    'destructive-foreground' => '#fee2e2',
                    'border' => '#7dd3fc',
                    'input' => '#93c5fd',
                    'ring' => '#06b6d4',
                    'chart-1' => '#0284c7',
                    'chart-2' => '#0f766e',
                    'chart-3' => '#6366f1',
                    'chart-4' => '#f59e0b',
                    'chart-5' => '#ec4899',
                    'radius' => '0.95rem',
                    'sidebar' => '#082f49',
                    'sidebar-foreground' => '#e0f2fe',
                    'sidebar-primary' => '#22d3ee',
                    'sidebar-primary-foreground' => '#083344',
                    'sidebar-accent' => '#155e75',
                    'sidebar-accent-foreground' => '#cffafe',
                    'sidebar-border' => '#0e7490',
                    'sidebar-ring' => '#22d3ee',
                ],
                'settings' => ['preset' => true],
                'is_active' => false,
            ],
            [
                'name' => 'Sunset Warm',
                'slug' => 'sunset-warm',
                'description' => 'Warm preset with amber and terracotta tones.',
                'tokens' => [
                    'background' => '#fff1e6',
                    'foreground' => '#2c1208',
                    'card' => '#fffbf7',
                    'card-foreground' => '#2c1208',
                    'popover' => '#fffbf7',
                    'popover-foreground' => '#2c1208',
                    'primary' => '#c2410c',
                    'primary-foreground' => '#fff7ed',
                    'secondary' => '#fed7aa',
                    'secondary-foreground' => '#7c2d12',
                    'muted' => '#ffedd5',
                    'muted-foreground' => '#7c2d12',
                    'accent' => '#fb923c',
                    'accent-foreground' => '#431407',
                    'destructive' => '#be123c',
                    'destructive-foreground' => '#ffe4e6',
                    'border' => '#fdba74',
                    'input' => '#fdba74',
                    'ring' => '#ea580c',
                    'chart-1' => '#f97316',
                    'chart-2' => '#ef4444',
                    'chart-3' => '#d97706',
                    'chart-4' => '#f59e0b',
                    'chart-5' => '#fb7185',
                    'radius' => '1rem',
                    'sidebar' => '#431407',
                    'sidebar-foreground' => '#ffedd5',
                    'sidebar-primary' => '#fdba74',
                    'sidebar-primary-foreground' => '#7c2d12',
                    'sidebar-accent' => '#7c2d12',
                    'sidebar-accent-foreground' => '#ffedd5',
                    'sidebar-border' => '#9a3412',
                    'sidebar-ring' => '#f97316',
                ],
                'settings' => ['preset' => true],
                'is_active' => false,
            ],
        ];

        Theme::query()
            ->whereIn('slug', collect($presets)->pluck('slug'))
            ->update(['is_active' => false]);

        foreach ($presets as $preset) {
            Theme::query()->updateOrCreate(
                ['slug' => $preset['slug']],
                [
                    'name' => $preset['name'],
                    'description' => $preset['description'],
                    'tokens' => $preset['tokens'],
                    'settings' => $preset['settings'],
                    'is_active' => $preset['is_active'],
                ]
            );
        }
    }
}
