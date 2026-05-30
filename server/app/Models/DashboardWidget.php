<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\WidgetSize;
use App\Enums\WidgetType;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
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
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 *
 * @method static Builder<static>|DashboardWidget active()
 * @method static Builder<static>|DashboardWidget newModelQuery()
 * @method static Builder<static>|DashboardWidget newQuery()
 * @method static Builder<static>|DashboardWidget ordered()
 * @method static Builder<static>|DashboardWidget query()
 * @method static Builder<static>|DashboardWidget whereColor($value)
 * @method static Builder<static>|DashboardWidget whereConfig($value)
 * @method static Builder<static>|DashboardWidget whereCreatedAt($value)
 * @method static Builder<static>|DashboardWidget whereIcon($value)
 * @method static Builder<static>|DashboardWidget whereId($value)
 * @method static Builder<static>|DashboardWidget whereIsActive($value)
 * @method static Builder<static>|DashboardWidget whereOrder($value)
 * @method static Builder<static>|DashboardWidget wherePermissions($value)
 * @method static Builder<static>|DashboardWidget whereSize($value)
 * @method static Builder<static>|DashboardWidget whereTitle($value)
 * @method static Builder<static>|DashboardWidget whereType($value)
 * @method static Builder<static>|DashboardWidget whereUpdatedAt($value)
 *
 * @mixin Model
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
