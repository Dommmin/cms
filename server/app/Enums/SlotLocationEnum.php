<?php

declare(strict_types=1);

namespace App\Enums;

enum SlotLocationEnum: string
{
    case AnnouncementBar = 'announcement_bar';
    case TopInfoBar = 'top_info_bar';
    case FooterColumns = 'footer_columns';
    case TrustBar = 'trust_bar';
    case StickyCta = 'sticky_cta';
    case SupportPanel = 'support_panel';

    public function label(): string
    {
        return match ($this) {
            self::AnnouncementBar => 'Announcement Bar',
            self::TopInfoBar => 'Top Info Bar',
            self::FooterColumns => 'Footer Columns',
            self::TrustBar => 'Trust Bar',
            self::StickyCta => 'Sticky CTA Bar',
            self::SupportPanel => 'Support Panel / Chat Widget',
        };
    }

    /**
     * Get default settings for a given slot location.
     */
    public function defaultSettings(): array
    {
        return match ($this) {
            self::AnnouncementBar => [
                'full_width' => true,
                'dismissible' => true,
                'bg_color' => '#111827',
                'padding' => 'sm',
            ],
            self::TopInfoBar => [
                'full_width' => true,
                'bg_color' => '#f3f4f6',
                'padding' => 'none',
            ],
            self::FooterColumns => [
                'full_width' => false,
                'padding' => 'lg',
            ],
            self::TrustBar => [
                'full_width' => false,
                'padding' => 'md',
                'bg_color' => '#f9fafb',
            ],
            self::StickyCta => [
                'full_width' => true,
                'sticky' => true,
                'bg_color' => '#ffffff',
                'padding' => 'sm',
            ],
            self::SupportPanel => [
                'sticky' => true,
            ],
        };
    }
}
