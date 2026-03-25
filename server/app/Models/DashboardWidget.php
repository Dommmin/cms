<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\WidgetSize;
use App\Enums\WidgetType;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DashboardWidget extends Model
{
    use HasFactory;
    use HasFactory;

    protected $fillable = [
        'title',
        'type',
        'size',
        'order',
        'is_active',
        'config',
        'permissions',
        'icon',
        'color',
    ];

    #[Scope]
    protected function active($query)
    {
        return $query->where('is_active', true);
    }

    #[Scope]
    protected function ordered($query)
    {
        return $query->orderBy('order');
    }

    protected function casts(): array
    {
        return [
            'type' => WidgetType::class,
            'size' => WidgetSize::class,
            'config' => 'array',
            'permissions' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
