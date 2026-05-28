<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\WidgetSize;
use App\Enums\WidgetType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $title
 * @property WidgetType $type
 * @property WidgetSize $size
 * @property int $order
 * @property bool $is_active
 * @property array<array-key, mixed>|null $config
 * @property array<array-key, mixed>|null $permissions
 * @property string|null $icon
 * @property string|null $color
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget ordered()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget whereConfig($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget wherePermissions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget whereSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DashboardWidget whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'title',
    'type',
    'size',
    'order',
    'is_active',
    'config',
    'permissions',
    'icon',
    'color',
])]
class DashboardWidget extends Model
{
    use HasFactory;
    use HasFactory;

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
