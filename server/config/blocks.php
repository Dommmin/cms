<?php

declare(strict_types=1);

use App\Enums\PageBlockTypeEnum;

return [
    'relation_types' => [
        'media.image' => [
            'model' => Spatie\MediaLibrary\MediaCollections\Models\Media::class,
            'label' => 'Image',
            'collection' => 'block-images',
        ],
        'media.icon' => [
            'model' => Spatie\MediaLibrary\MediaCollections\Models\Media::class,
            'label' => 'Icon',
            'collection' => 'block-icons',
        ],
        'media.file' => [
            'model' => Spatie\MediaLibrary\MediaCollections\Models\Media::class,
            'label' => 'File/PDF',
            'collection' => 'block-files',
        ],
        'media.video' => [
            'model' => Spatie\MediaLibrary\MediaCollections\Models\Media::class,
            'label' => 'Video',
            'collection' => 'block-videos',
        ],
        'product' => [
            'model' => App\Models\Product::class,
            'label' => 'Product',
        ],
        'category' => [
            'model' => App\Models\Category::class,
            'label' => 'Category',
        ],
        'brand' => [
            'model' => App\Models\Brand::class,
            'label' => 'Brand',
        ],
        'page' => [
            'model' => App\Models\Page::class,
            'label' => 'Page',
        ],
        'menu' => [
            'model' => App\Models\Menu::class,
            'label' => 'Menu',
        ],
        'form' => [
            'model' => App\Models\Form::class,
            'label' => 'Form',
        ],
        'faq' => [
            'model' => App\Models\Faq::class,
            'label' => 'FAQ',
        ],
        'blog_post' => [
            'model' => App\Models\BlogPost::class,
            'label' => 'Blog Post',
        ],
        'blog_category' => [
            'model' => App\Models\BlogCategory::class,
            'label' => 'Blog Category',
        ],
    ],

    'block_types' => [
        'hero_banner' => [
            'name' => 'Hero Banner',
            'description' => 'Full-width hero section with title, subtitle and up to two CTA buttons',
            'icon' => 'layout-template',
            'category' => 'layout',
            'enum' => PageBlockTypeEnum::HeroBanner,
            'allowed_relations' => [
                'background' => ['types' => ['media.image', 'media.video'], 'multiple' => false],
                'overlay_icon' => ['types' => ['media.icon'], 'multiple' => false],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Heading',
                        'placeholder' => 'Enter a compelling headline...',
                        'maxLength' => 120,
                    ],
                    'subtitle' => [
                        'type' => 'string',
                        'label' => 'Subheading',
                        'format' => 'textarea',
                        'placeholder' => 'Supporting text below the headline',
                        'maxLength' => 300,
                    ],
                    'cta_text' => [
                        'type' => 'string',
                        'label' => 'Primary Button Label',
                        'placeholder' => 'e.g. Shop Now',
                    ],
                    'cta_url' => [
                        'type' => 'string',
                        'label' => 'Primary Button URL',
                        'format' => 'url',
                        'placeholder' => 'https://',
                    ],
                    'cta_style' => [
                        'type' => 'string',
                        'label' => 'Primary Button Style',
                        'enum' => ['primary', 'secondary', 'outline', 'ghost'],
                        'default' => 'primary',
                    ],
                    'cta2_text' => [
                        'type' => 'string',
                        'label' => 'Secondary Button Label',
                        'placeholder' => 'e.g. Learn More',
                    ],
                    'cta2_url' => [
                        'type' => 'string',
                        'label' => 'Secondary Button URL',
                        'format' => 'url',
                        'placeholder' => 'https://',
                    ],
                    'cta2_style' => [
                        'type' => 'string',
                        'label' => 'Secondary Button Style',
                        'enum' => ['primary', 'secondary', 'outline', 'ghost'],
                        'default' => 'outline',
                    ],
                    'text_alignment' => [
                        'type' => 'string',
                        'label' => 'Text Alignment',
                        'enum' => ['left', 'center', 'right'],
                        'default' => 'center',
                    ],
                    'overlay_opacity' => [
                        'type' => 'integer',
                        'label' => 'Overlay Opacity (%)',
                        'min' => 0,
                        'max' => 100,
                        'default' => 40,
                    ],
                    'min_height' => [
                        'type' => 'integer',
                        'label' => 'Minimum Height (px)',
                        'min' => 200,
                        'max' => 1000,
                        'default' => 500,
                    ],
                ],
            ],
        ],

        'rich_text' => [
            'name' => 'Rich Text',
            'description' => 'WYSIWYG content editor for formatted text, headings, lists and links',
            'icon' => 'type',
            'category' => 'content',
            'enum' => PageBlockTypeEnum::RichText,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'content' => [
                        'type' => 'string',
                        'label' => 'Content',
                        'format' => 'richtext',
                    ],
                    'max_width' => [
                        'type' => 'string',
                        'label' => 'Max Width',
                        'enum' => ['narrow', 'medium', 'wide', 'full'],
                        'default' => 'medium',
                    ],
                ],
            ],
        ],

        'featured_products' => [
            'name' => 'Featured Products',
            'description' => 'Showcase selected products or filter by category',
            'icon' => 'shopping-bag',
            'category' => 'ecommerce',
            'enum' => PageBlockTypeEnum::FeaturedProducts,
            'allowed_relations' => [
                'products' => ['types' => ['product'], 'multiple' => true],
                'category_filter' => ['types' => ['category'], 'multiple' => false],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Section Title',
                        'placeholder' => 'e.g. Best Sellers',
                    ],
                    'display_mode' => [
                        'type' => 'string',
                        'label' => 'Display Mode',
                        'enum' => ['grid', 'carousel', 'list'],
                        'default' => 'grid',
                    ],
                    'items_per_row' => [
                        'type' => 'integer',
                        'label' => 'Items per Row',
                        'min' => 1,
                        'max' => 6,
                        'default' => 4,
                    ],
                    'max_items' => [
                        'type' => 'integer',
                        'label' => 'Max Items to Show',
                        'min' => 1,
                        'max' => 48,
                        'default' => 8,
                    ],
                    'show_price' => [
                        'type' => 'boolean',
                        'label' => 'Show Price',
                        'default' => true,
                    ],
                    'show_add_to_cart' => [
                        'type' => 'boolean',
                        'label' => 'Show Add to Cart Button',
                        'default' => true,
                    ],
                    'show_badges' => [
                        'type' => 'boolean',
                        'label' => 'Show Product Badges (New, Sale, etc.)',
                        'default' => true,
                    ],
                ],
            ],
        ],

        'categories_grid' => [
            'name' => 'Categories Grid',
            'description' => 'Display product categories in a visual grid',
            'icon' => 'grid',
            'category' => 'ecommerce',
            'enum' => PageBlockTypeEnum::CategoriesGrid,
            'allowed_relations' => [
                'categories' => ['types' => ['category'], 'multiple' => true],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Section Title',
                    ],
                    'columns' => [
                        'type' => 'integer',
                        'label' => 'Columns',
                        'min' => 2,
                        'max' => 6,
                        'default' => 4,
                    ],
                    'show_labels' => [
                        'type' => 'boolean',
                        'label' => 'Show Category Names',
                        'default' => true,
                    ],
                    'style' => [
                        'type' => 'string',
                        'label' => 'Card Style',
                        'enum' => ['square', 'circle', 'wide'],
                        'default' => 'square',
                    ],
                ],
            ],
        ],

        'promotional_banner' => [
            'name' => 'Promotional Banner',
            'description' => 'Eye-catching banner for promotions, sales and announcements',
            'icon' => 'megaphone',
            'category' => 'marketing',
            'enum' => PageBlockTypeEnum::PromotionalBanner,
            'allowed_relations' => [
                'background' => ['types' => ['media.image'], 'multiple' => false],
                'link_product' => ['types' => ['product'], 'multiple' => false],
                'link_category' => ['types' => ['category'], 'multiple' => false],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Title',
                        'placeholder' => 'e.g. Summer Sale – Up to 50% Off',
                    ],
                    'subtitle' => [
                        'type' => 'string',
                        'label' => 'Subtitle',
                        'format' => 'textarea',
                    ],
                    'badge_text' => [
                        'type' => 'string',
                        'label' => 'Badge Label',
                        'placeholder' => 'e.g. Limited Time',
                    ],
                    'link_text' => [
                        'type' => 'string',
                        'label' => 'Button Label',
                        'placeholder' => 'e.g. Shop the Sale',
                    ],
                    'link_url' => [
                        'type' => 'string',
                        'label' => 'Button URL',
                        'format' => 'url',
                    ],
                    'background_color' => [
                        'type' => 'string',
                        'label' => 'Background Color',
                        'format' => 'color',
                        'default' => '#1e293b',
                    ],
                    'text_color' => [
                        'type' => 'string',
                        'label' => 'Text Color',
                        'format' => 'color',
                        'default' => '#ffffff',
                    ],
                ],
            ],
        ],

        'newsletter_signup' => [
            'name' => 'Newsletter Signup',
            'description' => 'Email subscription form for newsletter list building',
            'icon' => 'mail',
            'category' => 'marketing',
            'enum' => PageBlockTypeEnum::NewsletterSignup,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Heading',
                        'placeholder' => 'e.g. Stay in the loop',
                    ],
                    'description' => [
                        'type' => 'string',
                        'label' => 'Description',
                        'format' => 'textarea',
                        'placeholder' => 'Short description about your newsletter',
                    ],
                    'button_text' => [
                        'type' => 'string',
                        'label' => 'Button Label',
                        'placeholder' => 'Subscribe',
                        'default' => 'Subscribe',
                    ],
                    'placeholder_text' => [
                        'type' => 'string',
                        'label' => 'Input Placeholder',
                        'default' => 'Enter your email address',
                    ],
                    'success_message' => [
                        'type' => 'string',
                        'label' => 'Success Message',
                        'default' => 'Thanks for subscribing!',
                    ],
                    'background_color' => [
                        'type' => 'string',
                        'label' => 'Background Color',
                        'format' => 'color',
                    ],
                ],
            ],
        ],

        'testimonials' => [
            'name' => 'Testimonials',
            'description' => 'Customer reviews and social proof section',
            'icon' => 'message-square',
            'category' => 'social-proof',
            'enum' => PageBlockTypeEnum::Testimonials,
            'allowed_relations' => [
                'avatar' => ['types' => ['media.image'], 'multiple' => true],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Section Title',
                        'placeholder' => 'e.g. What our customers say',
                    ],
                    'display_mode' => [
                        'type' => 'string',
                        'label' => 'Display Mode',
                        'enum' => ['grid', 'carousel', 'single'],
                        'default' => 'grid',
                    ],
                    'show_rating' => [
                        'type' => 'boolean',
                        'label' => 'Show Star Rating',
                        'default' => true,
                    ],
                    'items' => [
                        'type' => 'array',
                        'label' => 'Testimonials',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'author' => ['type' => 'string', 'label' => 'Author Name', 'placeholder' => 'Jane Smith'],
                                'role' => ['type' => 'string', 'label' => 'Role / Company', 'placeholder' => 'CEO at Acme'],
                                'content' => ['type' => 'string', 'label' => 'Quote', 'format' => 'textarea'],
                                'rating' => ['type' => 'integer', 'label' => 'Rating (1–5)', 'min' => 1, 'max' => 5, 'default' => 5],
                            ],
                        ],
                    ],
                ],
            ],
        ],

        'image_gallery' => [
            'name' => 'Image Gallery',
            'description' => 'Display multiple images in a grid, masonry or carousel layout',
            'icon' => 'image',
            'category' => 'media',
            'enum' => PageBlockTypeEnum::ImageGallery,
            'allowed_relations' => [
                'gallery' => ['types' => ['media.image'], 'multiple' => true],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Section Title',
                    ],
                    'layout' => [
                        'type' => 'string',
                        'label' => 'Gallery Layout',
                        'enum' => ['grid', 'masonry', 'carousel'],
                        'default' => 'grid',
                    ],
                    'columns' => [
                        'type' => 'integer',
                        'label' => 'Columns (grid only)',
                        'min' => 2,
                        'max' => 6,
                        'default' => 3,
                    ],
                    'enable_lightbox' => [
                        'type' => 'boolean',
                        'label' => 'Enable Lightbox on Click',
                        'default' => true,
                    ],
                    'show_captions' => [
                        'type' => 'boolean',
                        'label' => 'Show Image Captions',
                        'default' => false,
                    ],
                ],
            ],
        ],

        'video_embed' => [
            'name' => 'Video Embed',
            'description' => 'Embed YouTube, Vimeo or self-hosted video',
            'icon' => 'play-circle',
            'category' => 'media',
            'enum' => PageBlockTypeEnum::VideoEmbed,
            'allowed_relations' => [
                'video' => ['types' => ['media.video'], 'multiple' => false],
                'thumbnail' => ['types' => ['media.image'], 'multiple' => false],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Title',
                    ],
                    'video_url' => [
                        'type' => 'string',
                        'label' => 'Video URL (YouTube / Vimeo)',
                        'format' => 'url',
                        'placeholder' => 'https://www.youtube.com/watch?v=...',
                    ],
                    'autoplay' => [
                        'type' => 'boolean',
                        'label' => 'Autoplay (muted)',
                        'default' => false,
                    ],
                    'loop' => [
                        'type' => 'boolean',
                        'label' => 'Loop',
                        'default' => false,
                    ],
                    'show_controls' => [
                        'type' => 'boolean',
                        'label' => 'Show Player Controls',
                        'default' => true,
                    ],
                    'aspect_ratio' => [
                        'type' => 'string',
                        'label' => 'Aspect Ratio',
                        'enum' => ['16:9', '4:3', '1:1', '9:16'],
                        'default' => '16:9',
                    ],
                ],
            ],
        ],

        'custom_html' => [
            'name' => 'Custom HTML',
            'description' => 'Inject arbitrary HTML/CSS for advanced customisation',
            'icon' => 'code',
            'category' => 'advanced',
            'enum' => PageBlockTypeEnum::CustomHtml,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'html' => [
                        'type' => 'string',
                        'label' => 'HTML',
                        'format' => 'code',
                        'placeholder' => '<div>Your HTML here</div>',
                    ],
                    'css' => [
                        'type' => 'string',
                        'label' => 'CSS (scoped)',
                        'format' => 'code',
                        'placeholder' => '.my-class { color: red; }',
                    ],
                ],
            ],
        ],

        'two_columns' => [
            'name' => 'Two Columns',
            'description' => 'Split content into two side-by-side columns',
            'icon' => 'columns',
            'category' => 'layout',
            'enum' => PageBlockTypeEnum::TwoColumns,
            'allowed_relations' => [
                'left_image' => ['types' => ['media.image'], 'multiple' => false],
                'right_image' => ['types' => ['media.image'], 'multiple' => false],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'left_content' => [
                        'type' => 'string',
                        'label' => 'Left Column Content',
                        'format' => 'richtext',
                    ],
                    'right_content' => [
                        'type' => 'string',
                        'label' => 'Right Column Content',
                        'format' => 'richtext',
                    ],
                    'ratio' => [
                        'type' => 'string',
                        'label' => 'Column Ratio',
                        'enum' => ['50-50', '60-40', '40-60', '70-30', '30-70'],
                        'default' => '50-50',
                    ],
                    'vertical_alignment' => [
                        'type' => 'string',
                        'label' => 'Vertical Alignment',
                        'enum' => ['top', 'middle', 'bottom'],
                        'default' => 'top',
                    ],
                    'reverse_on_mobile' => [
                        'type' => 'boolean',
                        'label' => 'Reverse Column Order on Mobile',
                        'default' => false,
                    ],
                ],
            ],
        ],

        'three_columns' => [
            'name' => 'Three Columns',
            'description' => 'Divide content into three equal or custom-ratio columns',
            'icon' => 'layout',
            'category' => 'layout',
            'enum' => PageBlockTypeEnum::ThreeColumns,
            'allowed_relations' => [
                'column_1_image' => ['types' => ['media.image'], 'multiple' => false],
                'column_2_image' => ['types' => ['media.image'], 'multiple' => false],
                'column_3_image' => ['types' => ['media.image'], 'multiple' => false],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'column_1_title' => ['type' => 'string', 'label' => 'Column 1 Title'],
                    'column_1_content' => ['type' => 'string', 'label' => 'Column 1 Content', 'format' => 'richtext'],
                    'column_2_title' => ['type' => 'string', 'label' => 'Column 2 Title'],
                    'column_2_content' => ['type' => 'string', 'label' => 'Column 2 Content', 'format' => 'richtext'],
                    'column_3_title' => ['type' => 'string', 'label' => 'Column 3 Title'],
                    'column_3_content' => ['type' => 'string', 'label' => 'Column 3 Content', 'format' => 'richtext'],
                    'vertical_alignment' => [
                        'type' => 'string',
                        'label' => 'Vertical Alignment',
                        'enum' => ['top', 'middle', 'bottom'],
                        'default' => 'top',
                    ],
                ],
            ],
        ],

        'accordion' => [
            'name' => 'Accordion / FAQ',
            'description' => 'Collapsible question-and-answer sections',
            'icon' => 'chevrons-down',
            'category' => 'content',
            'enum' => PageBlockTypeEnum::Accordion,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Section Title',
                    ],
                    'allow_multiple_open' => [
                        'type' => 'boolean',
                        'label' => 'Allow Multiple Items Open',
                        'default' => false,
                    ],
                    'items' => [
                        'type' => 'array',
                        'label' => 'Items',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'title' => ['type' => 'string', 'label' => 'Question / Title', 'placeholder' => 'Question?'],
                                'content' => ['type' => 'string', 'label' => 'Answer / Content', 'format' => 'textarea'],
                            ],
                        ],
                    ],
                ],
            ],
        ],

        'tabs' => [
            'name' => 'Tabbed Content',
            'description' => 'Organise content in switchable tabs',
            'icon' => 'panel-top',
            'category' => 'content',
            'enum' => PageBlockTypeEnum::Tabs,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'tabs' => [
                        'type' => 'array',
                        'label' => 'Tabs',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'title' => ['type' => 'string', 'label' => 'Tab Label', 'placeholder' => 'Tab name'],
                                'content' => ['type' => 'string', 'label' => 'Tab Content', 'format' => 'richtext'],
                            ],
                        ],
                    ],
                ],
            ],
        ],

        'map' => [
            'name' => 'Map',
            'description' => 'Embed an interactive map with a store location',
            'icon' => 'map-pin',
            'category' => 'content',
            'enum' => PageBlockTypeEnum::Map,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'store_id' => [
                        'type' => 'integer',
                        'label' => 'Store ID (optional)',
                    ],
                    'lat' => [
                        'type' => 'number',
                        'label' => 'Latitude (fallback)',
                    ],
                    'lng' => [
                        'type' => 'number',
                        'label' => 'Longitude (fallback)',
                    ],
                    'title' => [
                        'type' => 'string',
                        'label' => 'Map Title',
                    ],
                    'zoom' => [
                        'type' => 'integer',
                        'label' => 'Zoom',
                        'min' => 1,
                        'max' => 20,
                        'default' => 14,
                    ],
                    'height' => [
                        'type' => 'integer',
                        'label' => 'Height (px)',
                        'min' => 200,
                        'max' => 800,
                        'default' => 400,
                    ],
                ],
            ],
        ],

        'featured_posts' => [
            'name' => 'Featured Posts',
            'description' => 'Display selected or latest blog posts in a grid or list',
            'icon' => 'newspaper',
            'category' => 'content',
            'enum' => PageBlockTypeEnum::FeaturedPosts,
            'allowed_relations' => [
                'posts' => ['types' => ['blog_post'], 'multiple' => true],
                'category_filter' => ['types' => ['blog_category'], 'multiple' => false],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Section Title',
                        'placeholder' => 'e.g. Latest Articles',
                    ],
                    'subtitle' => [
                        'type' => 'string',
                        'label' => 'Section Subtitle',
                        'format' => 'textarea',
                        'placeholder' => 'Short description below the heading',
                    ],
                    'source' => [
                        'type' => 'string',
                        'label' => 'Posts Source',
                        'description' => 'Manual: pick posts via Linked Content. Latest: auto-fetch newest published.',
                        'enum' => ['manual', 'latest', 'category'],
                        'default' => 'latest',
                    ],
                    'max_items' => [
                        'type' => 'integer',
                        'label' => 'Max Posts to Show',
                        'min' => 1,
                        'max' => 24,
                        'default' => 4,
                    ],
                    'columns' => [
                        'type' => 'integer',
                        'label' => 'Columns',
                        'min' => 1,
                        'max' => 4,
                        'default' => 3,
                    ],
                    'display_mode' => [
                        'type' => 'string',
                        'label' => 'Display Mode',
                        'enum' => ['grid', 'list', 'carousel'],
                        'default' => 'grid',
                    ],
                    'show_excerpt' => [
                        'type' => 'boolean',
                        'label' => 'Show Excerpt',
                        'default' => true,
                    ],
                    'show_author' => [
                        'type' => 'boolean',
                        'label' => 'Show Author',
                        'default' => true,
                    ],
                    'show_date' => [
                        'type' => 'boolean',
                        'label' => 'Show Publication Date',
                        'default' => true,
                    ],
                    'show_category' => [
                        'type' => 'boolean',
                        'label' => 'Show Category Badge',
                        'default' => true,
                    ],
                    'show_read_time' => [
                        'type' => 'boolean',
                        'label' => 'Show Estimated Read Time',
                        'default' => false,
                    ],
                    'cta_text' => [
                        'type' => 'string',
                        'label' => '"View All" Button Label',
                        'placeholder' => 'e.g. Read the Blog',
                    ],
                    'cta_url' => [
                        'type' => 'string',
                        'label' => '"View All" Button URL',
                        'format' => 'url',
                        'placeholder' => '/blog',
                    ],
                ],
            ],
        ],

        'form_embed' => [
            'name' => 'Form Embed',
            'description' => 'Embed a contact form or other custom form',
            'icon' => 'clipboard-list',
            'category' => 'conversion',
            'enum' => PageBlockTypeEnum::FormEmbed,
            'allowed_relations' => [
                'form' => ['types' => ['form'], 'multiple' => false],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Heading above form',
                        'placeholder' => 'e.g. Get in Touch',
                    ],
                    'description' => [
                        'type' => 'string',
                        'label' => 'Description',
                        'format' => 'textarea',
                    ],
                    'success_redirect_url' => [
                        'type' => 'string',
                        'label' => 'Redirect URL after submission',
                        'format' => 'url',
                        'placeholder' => '/thank-you',
                    ],
                ],
            ],
        ],
    ],
];
