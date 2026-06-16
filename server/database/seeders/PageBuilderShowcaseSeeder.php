<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\PageBlockTypeEnum;
use App\Models\BlockRelation;
use App\Models\BlogPost;
use App\Models\Brand;
use App\Models\Category;
use App\Models\CmsMedia;
use App\Models\Form;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageSection;
use App\Models\Product;
use Database\Seeders\Concerns\CachesImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Config;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class PageBuilderShowcaseSeeder extends Seeder
{
    use CachesImages;

    private const string PAGE_SLUG = 'page-builder-showcase';

    /** @var list<string> */
    private array $usedBlockTypes = [];

    /** @var array<string, int> */
    private array $mediaCache = [];

    public function run(): void
    {
        $page = $this->createPage();
        $page->allSections()->delete();
        $page->allBlocks()->delete();

        $position = 1;
        $position = $this->seedMarketingSection($page, $position);
        $position = $this->seedContentSection($page, $position);
        $position = $this->seedEcommerceSection($page, $position);
        $position = $this->seedFormsSection($page, $position);
        $position = $this->seedMediaSection($page, $position);
        $this->seedLayoutSection($page, $position);

        $this->assertAllBlockTypesPresent($page);
        $this->printSummary($page);
    }

    private function createPage(): Page
    {
        $page = Page::query()
            ->where('slug->en', self::PAGE_SLUG)
            ->whereNull('locale')
            ->first() ?? new Page;

        $page->fill([
            'parent_id' => null,
            'title' => ['en' => 'Page Builder Showcase', 'pl' => 'Page Builder Showcase'],
            'slug' => array_merge($page->getTranslations('slug'), ['en' => self::PAGE_SLUG, 'pl' => self::PAGE_SLUG]),
            'locale' => null,
            'page_type' => 'blocks',
            'is_published' => true,
            'published_at' => now(),
            'position' => 100,
            'sitemap_exclude' => true,
            'seo_title' => 'Page Builder Showcase — All Blocks',
            'seo_description' => 'Visual reference page containing every registered page builder block with realistic demo content.',
            'excerpt' => ['en' => 'A single page showcasing all page builder blocks for visual QA.'],
            'og_image' => '/demo/pages/home.svg',
        ]);
        $page->save();

        return $page;
    }

    private function seedMarketingSection(Page $page, int $position): int
    {
        $section = $this->section($page, 'standard', 'contained', 'light', [
            'padding' => 'xl',
            'animation' => 'fade-up',
            'showcase_group' => 'marketing',
        ], $position++);

        $blockPos = 1;

        $promo = $this->block($page, $section, 'promotional_banner', [
            'title' => 'Summer Collection — up to 40% off',
            'subtitle' => 'Limited-time offer on selected fashion and home categories. Free shipping over €75.',
            'badge_text' => 'Seasonal sale',
            'link_text' => 'Shop the sale',
            'link_url' => '/shop',
            'background_color' => '#0f172a',
            'text_color' => '#f8fafc',
        ], $blockPos++);
        $this->attachMedia($promo, 'background', 'showcase-promo', 1, 'Promotional banner background with summer collection styling');

        $this->block($page, $section, 'newsletter_signup', [
            'title' => 'Stay ahead of new arrivals',
            'subtitle' => 'Weekly edits, early access to sales, and styling tips — no spam.',
            'placeholder' => 'you@example.com',
            'button_text' => 'Join the list',
            'success_message' => 'Welcome aboard! Check your inbox for a 10% welcome code.',
            'ask_name' => true,
        ], $blockPos++);

        $cta = $this->block($page, $section, 'call_to_action', [
            'title' => 'Ready to launch your next campaign?',
            'subtitle' => 'Combine hero, promotional, and countdown blocks for high-converting landing pages.',
            'alignment' => 'center',
            'style' => 'image',
            'badge_text' => 'Marketing stack',
            'primary_label' => 'Explore products',
            'primary_url' => '/shop',
            'secondary_label' => 'Contact sales',
            'secondary_url' => '/contact',
        ], $blockPos++);
        $this->attachMedia($cta, 'background', 'showcase-cta', 1, 'Call to action background with brand gradient');

        $this->block($page, $section, 'stats_counter', [
            'title' => 'Platform at a glance',
            'subtitle' => 'Animated counters with icon support.',
            'style' => 'card',
            'columns' => 4,
            'animate_numbers' => true,
            'stats' => [
                ['value' => '30', 'suffix' => '+', 'label' => 'Block types', 'icon' => 'layout'],
                ['value' => '6', 'suffix' => '', 'label' => 'Showcase sections', 'icon' => 'layers'],
                ['value' => '99', 'suffix' => '.9%', 'label' => 'Uptime SLA', 'icon' => 'server'],
                ['value' => '24', 'suffix' => '/7', 'label' => 'API availability', 'icon' => 'zap'],
            ],
        ], $blockPos++);

        $this->block($page, $section, 'pricing_table', [
            'title' => 'Service plans',
            'subtitle' => 'Pricing table with monthly/yearly toggle and feature lists.',
            'currency_symbol' => '€',
            'billing_toggle' => true,
            'plans' => [
                [
                    'name' => 'Starter',
                    'price_monthly' => '29',
                    'price_yearly' => '24',
                    'description' => 'For small catalogs getting started with headless commerce.',
                    'features' => "Up to 500 products\nEmail support\nBasic analytics",
                    'cta_label' => 'Start free trial',
                    'cta_url' => '/contact',
                    'is_featured' => false,
                ],
                [
                    'name' => 'Growth',
                    'badge' => 'Most popular',
                    'price_monthly' => '79',
                    'price_yearly' => '65',
                    'description' => 'For growing brands that need automation and multi-channel sales.',
                    'features' => "Unlimited products\nPriority support\nAdvanced promotions\nPage builder",
                    'cta_label' => 'Talk to sales',
                    'cta_url' => '/contact',
                    'is_featured' => true,
                ],
                [
                    'name' => 'Enterprise',
                    'price_monthly' => '199',
                    'price_yearly' => '165',
                    'description' => 'Dedicated infrastructure, SSO, and custom integrations.',
                    'features' => "Dedicated account manager\n99.9% SLA\nCustom workflows\nAudit logs",
                    'cta_label' => 'Book a demo',
                    'cta_url' => '/contact',
                    'is_featured' => false,
                ],
            ],
        ], $blockPos++);

        $logoCloud = $this->block($page, $section, 'logo_cloud', [
            'title' => 'Trusted by modern commerce teams',
            'subtitle' => 'Logo cloud with uploaded partner marks.',
            'columns' => 5,
            'grayscale' => true,
        ], $blockPos++);
        foreach (range(1, 5) as $index) {
            $this->attachMedia($logoCloud, 'logos', "showcase-logo-{$index}", $index, "Partner logo {$index}");
        }

        $this->block($page, $section, 'countdown_timer', [
            'title' => 'Flash sale ends in',
            'subtitle' => 'Countdown timer with expired fallback message and CTA.',
            'target_date' => now()->addDays(5)->setTime(23, 59, 0)->toIso8601String(),
            'show_labels' => true,
            'expired_message' => 'This flash sale has ended — browse our latest deals instead.',
            'cta_label' => 'Shop flash deals',
            'cta_url' => '/shop',
            'style' => 'dark',
        ], $blockPos++);

        $this->block($page, $section, 'trust_badges', [
            'style' => 'row',
            'badges' => [
                ['icon' => 'truck', 'label' => 'Free shipping', 'sublabel' => 'Orders over €75'],
                ['icon' => 'return', 'label' => '30-day returns', 'sublabel' => 'Hassle-free'],
                ['icon' => 'lock', 'label' => 'Secure checkout', 'sublabel' => '256-bit SSL'],
                ['icon' => 'award', 'label' => 'Curated quality', 'sublabel' => 'Hand-picked brands'],
            ],
        ], $blockPos++);

        $this->block($page, $section, 'testimonials', [
            'title' => 'What merchants say',
            'subtitle' => 'Social proof block with ratings and optional avatars.',
            'layout' => 'grid',
            'columns' => 2,
            'show_rating' => true,
            'items' => [
                ['author' => 'Anna K.', 'role' => 'Head of E-commerce', 'rating' => 5, 'content' => 'The page builder let us ship a full seasonal landing page in an afternoon — no developer needed.'],
                ['author' => 'James L.', 'role' => 'Marketing Director', 'rating' => 5, 'content' => 'Countdown and promotional blocks drove a 28% uplift in conversion during our last flash sale.'],
                ['author' => 'Marta W.', 'role' => 'Brand Manager', 'rating' => 4, 'content' => 'Logo cloud and testimonials blocks look polished out of the box on mobile and desktop.'],
                ['author' => 'Tom R.', 'role' => 'Founder', 'rating' => 5, 'content' => 'We compose hero, stats, and CTA sections once, then reuse the structure across campaigns.'],
            ],
        ], $blockPos++);

        $this->block($page, $section, 'pricing_cards', [
            'title' => 'Pricing cards',
            'subtitle' => 'Card layout with monthly/yearly toggle — ideal for SaaS-style plans.',
            'show_toggle' => true,
            'plans' => [
                [
                    'name' => 'Launch',
                    'price_monthly' => 19,
                    'price_yearly' => 15,
                    'features' => ['1 storefront', 'Basic blocks', 'Email support'],
                    'cta_label' => 'Get started',
                    'cta_url' => '/contact',
                ],
                [
                    'name' => 'Scale',
                    'price_monthly' => 49,
                    'price_yearly' => 39,
                    'is_popular' => true,
                    'features' => ['3 storefronts', 'All blocks', 'Priority support', 'A/B sections'],
                    'cta_label' => 'Start trial',
                    'cta_url' => '/contact',
                ],
                [
                    'name' => 'Enterprise',
                    'price_monthly' => 129,
                    'price_yearly' => 99,
                    'features' => ['Unlimited storefronts', 'Custom blocks', 'Dedicated CSM', 'SLA'],
                    'cta_label' => 'Contact us',
                    'cta_url' => '/contact',
                ],
            ],
        ], $blockPos);

        return $position;
    }

    private function seedContentSection(Page $page, int $position): int
    {
        $section = $this->section($page, 'standard', 'contained', 'muted', [
            'padding' => 'xl',
            'animation' => 'fade-up',
            'showcase_group' => 'content',
        ], $position++);

        $blockPos = 1;

        $this->block($page, $section, 'rich_text', [
            'content' => '<h2>Content</h2><p>Rich text, accordions, tabs, timelines, team grids, icon lists, process steps, blog highlights, and maps — everything editorial teams need for storytelling.</p>',
            'max_width' => '3xl',
            'text_align' => 'left',
        ], $blockPos++);

        $this->block($page, $section, 'accordion', [
            'title' => 'Frequently asked questions',
            'allow_multiple_open' => true,
            'items' => [
                ['title' => 'Can I reorder blocks after publishing?', 'content' => '<p>Yes. Draft changes in the builder, preview on desktop and mobile, then publish a new version.</p>'],
                ['title' => 'Do blocks share the design system?', 'content' => '<p>All storefront blocks consume theme tokens for colors, spacing, and typography.</p>'],
                ['title' => 'Are relational blocks validated?', 'content' => '<p>Products, categories, brands, forms, and blog posts are linked via block relations with server-side resolution.</p>'],
            ],
        ], $blockPos++);

        $this->block($page, $section, 'tabs', [
            'tabs' => [
                ['title' => 'Overview', 'content' => '<p>Tabbed content keeps long pages scannable without nested navigation.</p>'],
                ['title' => 'Specifications', 'content' => '<ul><li>30 block types</li><li>Schema-driven admin forms</li><li>Transactional save</li></ul>'],
                ['title' => 'Shipping', 'content' => '<p>Standard delivery 3–5 business days. Express options available at checkout.</p>'],
            ],
        ], $blockPos++);

        $this->block($page, $section, 'timeline', [
            'title' => 'Release timeline',
            'subtitle' => 'Milestones from first block to full design-system alignment.',
            'layout' => 'left',
            'items' => [
                ['date' => '2024 Q1', 'title' => 'Block registry', 'description' => 'Centralised block definitions in config with enum-backed types.'],
                ['date' => '2024 Q3', 'title' => 'Relations layer', 'description' => 'Media, products, and forms resolved through block_relations.'],
                ['date' => '2025 Q2', 'title' => 'Canvas editor', 'description' => 'Inline editing, health checks, and mobile preview in admin.'],
                ['date' => '2026 Q1', 'title' => 'Composition primitives', 'description' => 'Shared Section, Grid, and CTA components on the storefront.'],
            ],
        ], $blockPos++);

        $this->block($page, $section, 'team_members', [
            'title' => 'Meet the team',
            'subtitle' => 'Team member cards with optional photos and social links.',
            'columns' => 3,
            'members' => [
                ['name' => 'Marta Kowalska', 'role' => 'Product Lead', 'bio' => 'Owns the page builder roadmap and merchant workflows.', 'photo_url' => '/demo/blog/article.svg', 'linkedin_url' => 'https://www.linkedin.com'],
                ['name' => 'James Chen', 'role' => 'Engineering', 'bio' => 'Builds schema-driven forms and transactional save.', 'photo_url' => '/demo/products/catalog-product.svg'],
                ['name' => 'Aleksandra Nowak', 'role' => 'Design', 'bio' => 'Maintains composition primitives and theme tokens.', 'photo_url' => '/demo/categories/fashion.svg'],
            ],
        ], $blockPos++);

        $this->block($page, $section, 'icon_list', [
            'title' => 'Why teams choose this stack',
            'subtitle' => 'Icon list block with horizontal and centered styles.',
            'columns' => 2,
            'style' => 'horizontal',
            'items' => [
                ['icon' => 'zap', 'title' => 'Fast storefront', 'description' => 'Next.js rendering with token-driven components.'],
                ['icon' => 'shield', 'title' => 'Validated content', 'description' => 'Block schemas enforce safe HTML and required relations.'],
                ['icon' => 'globe', 'title' => 'Locale-ready', 'description' => 'Pages, slugs, and paths resolve per locale.'],
                ['icon' => 'users', 'title' => 'Collaborative', 'description' => 'Draft versions, previews, and publish workflow.'],
            ],
        ], $blockPos++);

        $this->block($page, $section, 'steps_process', [
            'title' => 'How to preview this page',
            'subtitle' => 'Horizontal steps block — ideal for onboarding flows.',
            'layout' => 'horizontal',
            'steps' => [
                ['title' => 'Run the seeder', 'description' => 'Execute PageBuilderShowcaseSeeder after the demo catalog seed pack.'],
                ['title' => 'Open the storefront', 'description' => 'Visit /page-builder-showcase on the public frontend.'],
                ['title' => 'Compare with admin', 'description' => 'Edit the page in the builder to inspect block schemas side by side.'],
                ['title' => 'Ship with confidence', 'description' => 'Use this page as a regression checklist when adding new blocks.'],
            ],
        ], $blockPos++);

        $postsBlock = $this->block($page, $section, 'featured_posts', [
            'title' => 'From the blog',
            'subtitle' => 'Featured posts with manual selection or latest auto-source.',
            'source' => 'latest',
            'max_items' => 3,
            'columns' => 3,
            'display_mode' => 'card',
            'show_excerpt' => true,
            'show_date' => true,
            'show_author' => true,
            'cta_text' => 'Read all articles',
            'cta_url' => '/blog',
        ], $blockPos++);
        $this->attachBlogPosts($postsBlock);

        $this->block($page, $section, 'map', [
            'title' => 'Visit our showroom',
            'lat' => 52.229676,
            'lng' => 21.012229,
            'zoom' => 13,
            'height' => 380,
        ], $blockPos);

        return $position;
    }

    private function seedEcommerceSection(Page $page, int $position): int
    {
        $section = $this->section($page, 'standard', 'contained', 'light', [
            'padding' => 'xl',
            'animation' => 'fade-up',
            'showcase_group' => 'ecommerce',
        ], $position++);

        $blockPos = 1;

        $productsBlock = $this->block($page, $section, 'featured_products', [
            'filter_mode' => 'manual',
            'title' => 'Featured products',
            'subtitle' => 'Manual product selection with grid or carousel display.',
            'display_mode' => 'grid',
            'items_per_row' => 4,
            'max_items' => 8,
            'show_price' => true,
            'show_add_to_cart' => true,
            'show_badges' => true,
            'view_all_url' => '/shop',
            'view_all_label' => 'View all products',
        ], $blockPos++);
        $this->attachProducts($productsBlock);

        $categoriesBlock = $this->block($page, $section, 'categories_grid', [
            'title' => 'Shop by category',
            'subtitle' => 'Category grid with linked taxonomy relations.',
            'columns' => 4,
            'show_title' => true,
        ], $blockPos++);
        $this->attachCategories($categoriesBlock);

        $brandsBlock = $this->block($page, $section, 'brands_slider', [
            'title' => 'Featured brands',
            'source' => 'manual',
            'speed' => 'normal',
            'logo_height' => 48,
            'grayscale' => false,
        ], $blockPos);
        $this->attachBrands($brandsBlock);

        return $position;
    }

    private function seedFormsSection(Page $page, int $position): int
    {
        $contactForm = Form::query()->where('slug', 'contact')->first();

        $section = $this->section($page, 'standard', 'contained', 'light', [
            'padding' => 'xl',
            'animation' => 'fade-up',
            'showcase_group' => 'forms',
        ], $position++);

        $formBlock = $this->block($page, $section, 'form_embed', [
            'title' => 'Request a demo',
            'description' => 'Form embed block — pulls fields from the linked form definition.',
            'form_id' => $contactForm?->id,
            'success_redirect_url' => '/contact',
        ], 1);

        if ($contactForm) {
            BlockRelation::query()->updateOrCreate(
                ['page_block_id' => $formBlock->id, 'relation_type' => 'form', 'relation_id' => $contactForm->id],
                ['relation_key' => 'form', 'position' => 1, 'metadata' => []],
            );
        }

        return $position;
    }

    private function seedMediaSection(Page $page, int $position): int
    {
        $section = $this->section($page, 'standard', 'contained', 'muted', [
            'padding' => 'xl',
            'animation' => 'fade-up',
            'showcase_group' => 'media',
        ], $position++);

        $blockPos = 1;

        $gallery = $this->block($page, $section, 'image_gallery', [
            'title' => 'Campaign imagery',
            'layout' => 'grid',
            'columns' => 3,
            'enable_lightbox' => true,
            'show_captions' => true,
        ], $blockPos++);
        foreach (range(1, 6) as $index) {
            $this->attachMedia($gallery, 'gallery', "showcase-gallery-{$index}", $index, "Gallery image {$index} from the showcase seeder");
        }

        $this->block($page, $section, 'video_embed', [
            'title' => 'Platform walkthrough',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'autoplay' => false,
            'loop' => false,
            'show_controls' => true,
            'aspect_ratio' => '16:9',
        ], $blockPos);

        return $position;
    }

    private function seedLayoutSection(Page $page, int $position): void
    {
        $section = $this->section($page, 'standard', 'contained', 'light', [
            'padding' => 'xl',
            'animation' => 'fade-up',
            'showcase_group' => 'layout',
        ], $position);

        $blockPos = 1;

        $hero = $this->block($page, $section, 'hero_banner', [
            'title' => 'Layout blocks',
            'subtitle' => 'Hero banners, column layouts, alert bars, and custom HTML for structural page composition.',
            'cta_text' => 'Browse the store',
            'cta_url' => '/shop',
            'cta_style' => 'primary',
            'cta2_text' => 'Read the blog',
            'cta2_url' => '/blog',
            'cta2_style' => 'outline',
            'text_alignment' => 'center',
            'overlay_opacity' => 55,
            'min_height' => 480,
        ], $blockPos++);
        $this->attachMedia($hero, 'background', 'showcase-hero', 1, 'Hero background for the layout showcase group');

        $this->block($page, $section, 'alert_banner', [
            'message' => 'This is a dismissable alert banner block — useful for store-wide announcements.',
            'link' => '/shop',
            'link_label' => 'Shop now',
            'variant' => 'info',
            'dismissable' => true,
        ], $blockPos++);

        $twoColumns = $this->block($page, $section, 'two_columns', [
            'left_title' => 'Image + copy layout',
            'left_content' => '<p>The two-column block supports text, images, and mixed layouts with responsive ratios.</p>',
            'right_title' => 'Flexible ratios',
            'right_content' => '<p>Use <strong>60-40</strong>, <strong>50-50</strong> or <strong>40-60</strong> splits. Columns reverse on mobile when configured.</p>',
            'layout' => 'image-text',
            'ratio' => '60-40',
            'vertical_align' => 'center',
            'gap' => 'lg',
        ], $blockPos++);
        $this->attachMedia($twoColumns, 'left_image', 'showcase-two-col', 1, 'Product lifestyle photo in the left column');

        $threeColumns = $this->block($page, $section, 'three_columns', [
            'column_1_title' => 'Design',
            'column_1_content' => '<p>Token-driven storefront components with consistent spacing and typography.</p>',
            'column_2_title' => 'Compose',
            'column_2_content' => '<p>Drag sections and blocks in the admin canvas — publish when ready.</p>',
            'column_3_title' => 'Ship',
            'column_3_content' => '<p>Headless API delivers structured content to Next.js and mobile clients.</p>',
            'vertical_alignment' => 'top',
        ], $blockPos++);
        $this->attachMedia($threeColumns, 'column_1_image', 'showcase-col-1', 1, 'Design column illustration');
        $this->attachMedia($threeColumns, 'column_2_image', 'showcase-col-2', 2, 'Compose column illustration');
        $this->attachMedia($threeColumns, 'column_3_image', 'showcase-col-3', 3, 'Ship column illustration');

        $this->block($page, $section, 'custom_html', [
            'html' => '<div class="rounded-2xl border border-dashed p-8 text-center"><p class="text-lg font-semibold">Custom HTML block</p><p class="mt-2 text-sm opacity-80">Inject scoped markup when a dedicated block is not required.</p></div>',
            'css' => '.rounded-2xl { border-radius: 1rem; }',
        ], $blockPos);
    }

    private function section(
        Page $page,
        string $type,
        string $layout,
        ?string $variant,
        array $settings,
        int $position,
    ): PageSection {
        return PageSection::query()->create([
            'page_id' => $page->id,
            'section_type' => $type,
            'layout' => $layout,
            'variant' => $variant,
            'settings' => $settings ?: null,
            'position' => $position,
            'is_active' => true,
        ]);
    }

    /**
     * @param  array<string, mixed>  $configuration
     */
    private function block(
        Page $page,
        PageSection $section,
        string $type,
        array $configuration,
        int $position,
    ): PageBlock {
        $this->usedBlockTypes[] = $type;

        return PageBlock::query()->create([
            'page_id' => $page->id,
            'section_id' => $section->id,
            'type' => $type,
            'configuration' => $configuration,
            'position' => $position,
            'is_active' => true,
        ]);
    }

    private function attachMedia(PageBlock $block, string $relationKey, string $seed, int $position, string $alt): void
    {
        $media = $this->resolveBlockMedia($seed, $alt);

        BlockRelation::query()->create([
            'page_block_id' => $block->id,
            'relation_type' => 'media.image',
            'relation_id' => $media['id'],
            'relation_key' => $relationKey,
            'position' => $position,
            'metadata' => $media['metadata'],
        ]);
    }

    /**
     * @return array{id: int, metadata: array{url: string, alt: string}}
     */
    private function resolveBlockMedia(string $seed, string $alt, int $width = 1200, int $height = 800): array
    {
        $cacheKey = "{$seed}-{$width}x{$height}";

        if (! isset($this->mediaCache[$cacheKey])) {
            $originalSkipSeedConversions = (bool) config('media-library.skip_seed_conversions', false);
            $originalDiskName = config('media-library.disk_name');

            Config::set(
                'media-library.skip_seed_conversions',
                ! (bool) config('media-library.generate_seed_conversions', false),
            );
            Config::set('media-library.disk_name', 'public');

            try {
                $file = $this->seederImage($seed, $width, $height);

                if (! file_exists($file)) {
                    throw new \RuntimeException("Seed image file missing for [{$seed}].");
                }

                $cmsMedia = CmsMedia::query()->create([]);
                $media = $cmsMedia->addMedia($file)
                    ->preservingOriginal()
                    ->withCustomProperties(['alt' => $alt, 'caption' => '', 'description' => '', 'author' => ''])
                    ->toMediaCollection('default');

                $this->mediaCache[$cacheKey] = (int) $media->getKey();
            } finally {
                Config::set('media-library.skip_seed_conversions', $originalSkipSeedConversions);
                Config::set('media-library.disk_name', $originalDiskName);
            }
        }

        $media = Media::query()->find($this->mediaCache[$cacheKey]);

        return [
            'id' => $this->mediaCache[$cacheKey],
            'metadata' => [
                'url' => $media?->getUrl() ?? '',
                'alt' => $alt,
            ],
        ];
    }

    private function attachProducts(PageBlock $block): void
    {
        $products = Product::query()
            ->where('is_active', true)
            ->where('is_saleable', true)
            ->orderBy('id')
            ->take(8)
            ->get();

        foreach ($products as $index => $product) {
            BlockRelation::query()->updateOrCreate(
                ['page_block_id' => $block->id, 'relation_type' => 'product', 'relation_id' => $product->id],
                ['relation_key' => 'products', 'position' => $index + 1, 'metadata' => []],
            );
        }
    }

    private function attachCategories(PageBlock $block): void
    {
        $categories = Category::query()->whereNull('parent_id')->orderBy('position')->take(4)->get();

        foreach ($categories as $index => $category) {
            BlockRelation::query()->updateOrCreate(
                ['page_block_id' => $block->id, 'relation_type' => 'category', 'relation_id' => $category->id],
                ['relation_key' => 'categories', 'position' => $index + 1, 'metadata' => []],
            );
        }
    }

    private function attachBrands(PageBlock $block): void
    {
        $brands = Brand::query()->where('is_active', true)->orderBy('position')->take(8)->get();

        foreach ($brands as $index => $brand) {
            BlockRelation::query()->updateOrCreate(
                ['page_block_id' => $block->id, 'relation_type' => 'brand', 'relation_id' => $brand->id],
                ['relation_key' => 'brands', 'position' => $index + 1, 'metadata' => []],
            );
        }
    }

    private function attachBlogPosts(PageBlock $block): void
    {
        $posts = BlogPost::query()->published()->orderByDesc('published_at')->take(3)->get();

        foreach ($posts as $index => $post) {
            BlockRelation::query()->updateOrCreate(
                ['page_block_id' => $block->id, 'relation_type' => 'blog_post', 'relation_id' => $post->id],
                ['relation_key' => 'posts', 'position' => $index + 1, 'metadata' => []],
            );
        }
    }

    private function assertAllBlockTypesPresent(Page $page): void
    {
        $expected = array_map(static fn (PageBlockTypeEnum $case): string => $case->value, PageBlockTypeEnum::cases());
        $actual = $page->allBlocks()
            ->get()
            ->map(static fn (PageBlock $block): string => $block->type->value)
            ->unique()
            ->sort()
            ->values()
            ->all();

        $missing = array_values(array_diff($expected, $actual));

        if ($missing !== []) {
            throw new \RuntimeException('Page Builder Showcase is missing block types: '.implode(', ', $missing));
        }
    }

    private function printSummary(Page $page): void
    {
        if (! $this->command) {
            return;
        }

        $page->load(['allSections.allBlocks']);

        $sectionCount = $page->allSections->count();
        $blockCount = $page->allBlocks->count();
        $relationCount = BlockRelation::query()
            ->whereIn('page_block_id', $page->allBlocks->pluck('id'))
            ->count();

        $sortedBlocks = collect($this->usedBlockTypes)->unique()->sort()->values();

        $this->command->info('Page Builder Showcase seeded successfully.');
        $this->command->table(
            ['Record', 'Details'],
            [
                ['Page', "ID {$page->id} · slug /".self::PAGE_SLUG],
                ['Sections', (string) $sectionCount],
                ['Blocks', (string) $blockCount],
                ['Block relations', (string) $relationCount],
            ],
        );
        $this->command->line('Blocks used ('.$sortedBlocks->count().'):');
        $this->command->line($sortedBlocks->implode(', '));
    }
}
