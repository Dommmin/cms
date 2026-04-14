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
    case FeaturedPosts = 'featured_posts';
    case StatsCounter = 'stats_counter';
    case CallToAction = 'call_to_action';
    case PricingTable = 'pricing_table';
    case BrandsSlider = 'brands_slider';
    case LogoCloud = 'logo_cloud';
    case CountdownTimer = 'countdown_timer';
    case Timeline = 'timeline';
    case TeamMembers = 'team_members';
    case IconList = 'icon_list';
    case StepsProcess = 'steps_process';
    case TrustBadges = 'trust_badges';
    case AlertBanner = 'alert_banner';
    case PricingCards = 'pricing_cards';

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
            self::FeaturedPosts => 'Polecane artykuły',
            self::StatsCounter => 'Liczniki / Statystyki',
            self::CallToAction => 'Call to Action',
            self::PricingTable => 'Tabela cenowa',
            self::BrandsSlider => 'Slider marek',
            self::LogoCloud => 'Loga partnerów',
            self::CountdownTimer => 'Odliczanie',
            self::Timeline => 'Oś czasu',
            self::TeamMembers => 'Zespół',
            self::IconList => 'Lista ikon',
            self::StepsProcess => 'Jak to działa',
            self::TrustBadges => 'Znaki zaufania',
            self::AlertBanner => 'Alert Banner',
            self::PricingCards => 'Pricing Cards',
        };
    }
}
