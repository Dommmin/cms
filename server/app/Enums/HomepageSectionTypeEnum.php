<?php

declare(strict_types=1);

namespace App\Enums;

enum HomepageSectionTypeEnum: string
{
    case HeroBanner = 'hero_banner';
    case FeaturedProducts = 'featured_products';
    case CategoriesGrid = 'categories_grid';
    case PromotionalBanner = 'promotional_banner';
    case NewsletterSignup = 'newsletter_signup';
    case CustomHtml = 'custom_html';
    case Testimonials = 'testimonials';

    public function label(): string
    {
        return match ($this) {
            self::HeroBanner => 'Hero Banner',
            self::FeaturedProducts => 'Polecane produkty',
            self::CategoriesGrid => 'Grid kategorii',
            self::PromotionalBanner => 'Banner promocyjny',
            self::NewsletterSignup => 'Newsletter signup',
            self::CustomHtml => 'Custom HTML',
            self::Testimonials => 'Opinie klientów',
        };
    }
}
