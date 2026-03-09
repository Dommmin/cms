<?php

declare(strict_types=1);

namespace App\Enums;

enum PageBlockTypeEnum: string
{
    case HeroBanner = 'hero_banner';
    case RichText = 'rich_text';
    case FeaturedProducts = 'featured_products';
    case CategoriesGrid = 'categories_grid';
    case PromotionalBanner = 'promotional_banner';
    case NewsletterSignup = 'newsletter_signup';
    case Testimonials = 'testimonials';
    case ImageGallery = 'image_gallery';
    case VideoEmbed = 'video_embed';
    case CustomHtml = 'custom_html';
    case TwoColumns = 'two_columns';
    case ThreeColumns = 'three_columns';
    case Accordion = 'accordion';
    case Tabs = 'tabs';
    case FormEmbed = 'form_embed';
    case Map = 'map';

    public function label(): string
    {
        return match ($this) {
            self::HeroBanner => 'Hero Banner',
            self::RichText => 'Rich Text',
            self::FeaturedProducts => 'Polecane produkty',
            self::CategoriesGrid => 'Grid kategorii',
            self::PromotionalBanner => 'Banner promocyjny',
            self::NewsletterSignup => 'Newsletter signup',
            self::Testimonials => 'Opinie klientów',
            self::ImageGallery => 'Galeria zdjęć',
            self::VideoEmbed => 'Osadzone wideo',
            self::CustomHtml => 'Custom HTML',
            self::TwoColumns => 'Dwie kolumny',
            self::ThreeColumns => 'Trzy kolumny',
            self::Accordion => 'Akordeon',
            self::Tabs => 'Zakładki',
            self::FormEmbed => 'Formularz',
            self::Map => 'Mapa',
        };
    }
}
