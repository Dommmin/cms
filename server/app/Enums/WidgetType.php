<?php

declare(strict_types=1);

namespace App\Enums;

enum WidgetType: string
{
    case Stat = 'stat';
    case Chart = 'chart';
    case Table = 'table';
    case RecentActivity = 'recent_activity';
    case QuickActions = 'quick_actions';

    public function label(): string
    {
        return match ($this) {
            self::Stat => 'Statistic Card',
            self::Chart => 'Chart',
            self::Table => 'Table',
            self::RecentActivity => 'Recent Activity',
            self::QuickActions => 'Quick Actions',
        };
    }
}
