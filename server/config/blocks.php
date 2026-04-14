<?php

declare(strict_types=1);

use App\Enums\PageBlockTypeEnum;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Faq;
use App\Models\Form;
use App\Models\Menu;
use App\Models\Page;
use App\Models\Product;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

return [
    'relation_types' => [
        'media.image' => [
            'model' => Media::class,
            'label' => 'Image',
            'collection' => 'block-images',
        ],
        'media.icon' => [
            'model' => Media::class,
            'label' => 'Icon',
            'collection' => 'block-icons',
        ],
        'media.file' => [
            'model' => Media::class,
            'label' => 'File/PDF',
            'collection' => 'block-files',
        ],
        'media.video' => [
            'model' => Media::class,
            'label' => 'Video',
            'collection' => 'block-videos',
        ],
        'product' => [
            'model' => Product::class,
            'label' => 'Product',
        ],
        'category' => [
            'model' => Category::class,
            'label' => 'Category',
        ],
        'brand' => [
            'model' => Brand::class,
            'label' => 'Brand',
        ],
        'page' => [
            'model' => Page::class,
            'label' => 'Page',
        ],
        'menu' => [
            'model' => Menu::class,
            'label' => 'Menu',
        ],
        'form' => [
            'model' => Form::class,
            'label' => 'Form',
        ],
        'faq' => [
            'model' => Faq::class,
            'label' => 'FAQ',
        ],
        'blog_post' => [
            'model' => BlogPost::class,
            'label' => 'Blog Post',
        ],
        'blog_category' => [
            'model' => BlogCategory::class,
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

        'stats_counter' => [
            'name' => 'Stats / Counters',
            'description' => 'Animated number counters — perfect for "5000+ customers", "98% satisfaction", etc.',
            'icon' => 'bar-chart-2',
            'category' => 'marketing',
            'enum' => PageBlockTypeEnum::StatsCounter,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Section Title',
                        'placeholder' => 'e.g. By the Numbers',
                    ],
                    'subtitle' => [
                        'type' => 'string',
                        'label' => 'Section Subtitle',
                        'format' => 'textarea',
                    ],
                    'style' => [
                        'type' => 'string',
                        'label' => 'Card Style',
                        'enum' => ['plain', 'card', 'bordered', 'icon'],
                        'default' => 'plain',
                    ],
                    'columns' => [
                        'type' => 'integer',
                        'label' => 'Columns',
                        'min' => 2,
                        'max' => 5,
                        'default' => 4,
                    ],
                    'animate_numbers' => [
                        'type' => 'boolean',
                        'label' => 'Animate Numbers on Scroll',
                        'default' => true,
                    ],
                    'stats' => [
                        'type' => 'array',
                        'label' => 'Stats',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'value' => [
                                    'type' => 'string',
                                    'label' => 'Value',
                                    'placeholder' => 'e.g. 5000',
                                ],
                                'suffix' => [
                                    'type' => 'string',
                                    'label' => 'Suffix',
                                    'placeholder' => 'e.g. + or %',
                                ],
                                'label' => [
                                    'type' => 'string',
                                    'label' => 'Label',
                                    'placeholder' => 'e.g. Happy Customers',
                                ],
                                'icon' => [
                                    'type' => 'string',
                                    'label' => 'Icon (lucide name)',
                                    'placeholder' => 'e.g. users',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ],

        'call_to_action' => [
            'name' => 'Call to Action',
            'description' => 'Full-width CTA section with heading, text, and up to two buttons',
            'icon' => 'mouse-pointer-click',
            'category' => 'marketing',
            'enum' => PageBlockTypeEnum::CallToAction,
            'allowed_relations' => [
                'background' => ['types' => ['media.image'], 'multiple' => false],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Heading',
                        'placeholder' => 'Ready to get started?',
                        'maxLength' => 120,
                    ],
                    'subtitle' => [
                        'type' => 'string',
                        'label' => 'Subheading',
                        'format' => 'textarea',
                        'placeholder' => 'Join thousands of customers...',
                        'maxLength' => 300,
                    ],
                    'alignment' => [
                        'type' => 'string',
                        'label' => 'Alignment',
                        'enum' => ['left', 'center', 'right'],
                        'default' => 'center',
                    ],
                    'style' => [
                        'type' => 'string',
                        'label' => 'Style',
                        'enum' => ['plain', 'gradient', 'dark', 'brand', 'image'],
                        'default' => 'gradient',
                    ],
                    'primary_label' => [
                        'type' => 'string',
                        'label' => 'Primary Button Label',
                        'placeholder' => 'Get Started',
                    ],
                    'primary_url' => [
                        'type' => 'string',
                        'label' => 'Primary Button URL',
                        'format' => 'url',
                    ],
                    'secondary_label' => [
                        'type' => 'string',
                        'label' => 'Secondary Button Label',
                        'placeholder' => 'Learn More',
                    ],
                    'secondary_url' => [
                        'type' => 'string',
                        'label' => 'Secondary Button URL',
                        'format' => 'url',
                    ],
                    'badge_text' => [
                        'type' => 'string',
                        'label' => 'Badge Text (optional)',
                        'placeholder' => 'e.g. New Feature',
                    ],
                ],
            ],
        ],

        'pricing_table' => [
            'name' => 'Pricing Table',
            'description' => 'Pricing plans with feature lists — ideal for services, subscriptions, or tiers',
            'icon' => 'credit-card',
            'category' => 'marketing',
            'enum' => PageBlockTypeEnum::PricingTable,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Section Title',
                        'placeholder' => 'Simple, transparent pricing',
                    ],
                    'subtitle' => [
                        'type' => 'string',
                        'label' => 'Section Subtitle',
                        'format' => 'textarea',
                    ],
                    'currency_symbol' => [
                        'type' => 'string',
                        'label' => 'Currency Symbol',
                        'default' => 'zł',
                    ],
                    'billing_toggle' => [
                        'type' => 'boolean',
                        'label' => 'Show monthly/yearly toggle',
                        'default' => false,
                    ],
                    'plans' => [
                        'type' => 'array',
                        'label' => 'Plans',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'name' => ['type' => 'string', 'label' => 'Plan Name', 'placeholder' => 'Pro'],
                                'badge' => ['type' => 'string', 'label' => 'Badge (e.g. Most Popular)', 'placeholder' => ''],
                                'price_monthly' => ['type' => 'string', 'label' => 'Monthly Price', 'placeholder' => '49'],
                                'price_yearly' => ['type' => 'string', 'label' => 'Yearly Price', 'placeholder' => '39'],
                                'description' => ['type' => 'string', 'label' => 'Short Description', 'format' => 'textarea'],
                                'features' => ['type' => 'string', 'label' => 'Features (one per line)', 'format' => 'textarea', 'placeholder' => "Unlimited products\nEmail support\nAnalytics"],
                                'cta_label' => ['type' => 'string', 'label' => 'Button Label', 'placeholder' => 'Get Started'],
                                'cta_url' => ['type' => 'string', 'label' => 'Button URL', 'format' => 'url'],
                                'is_featured' => ['type' => 'boolean', 'label' => 'Highlight this plan', 'default' => false],
                            ],
                        ],
                    ],
                ],
            ],
        ],

        'brands_slider' => [
            'name' => 'Brands Slider',
            'description' => 'Auto-scrolling carousel of brand logos — pulls live data from the Brands catalogue',
            'icon' => 'badge',
            'category' => 'ecommerce',
            'enum' => PageBlockTypeEnum::BrandsSlider,
            'allowed_relations' => [
                'brands' => ['types' => ['brand'], 'multiple' => true],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Section Title',
                        'placeholder' => 'e.g. Trusted Brands',
                    ],
                    'source' => [
                        'type' => 'string',
                        'label' => 'Source',
                        'description' => 'All: shows every active brand. Manual: pick brands via Linked Content.',
                        'enum' => ['all', 'manual'],
                        'default' => 'all',
                    ],
                    'speed' => [
                        'type' => 'string',
                        'label' => 'Scroll Speed',
                        'enum' => ['slow', 'normal', 'fast'],
                        'default' => 'normal',
                    ],
                    'logo_height' => [
                        'type' => 'integer',
                        'label' => 'Logo Height (px)',
                        'min' => 24,
                        'max' => 120,
                        'default' => 48,
                    ],
                    'grayscale' => [
                        'type' => 'boolean',
                        'label' => 'Grayscale logos (color on hover)',
                        'default' => true,
                    ],
                ],
            ],
        ],

        'logo_cloud' => [
            'name' => 'Logo Cloud',
            'description' => 'Grid of client / partner logos (media uploads)',
            'icon' => 'layout-grid',
            'category' => 'marketing',
            'enum' => PageBlockTypeEnum::LogoCloud,
            'allowed_relations' => [
                'logos' => ['types' => ['media.image'], 'multiple' => true],
            ],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Section Title',
                        'placeholder' => 'e.g. Trusted by',
                    ],
                    'columns' => [
                        'type' => 'integer',
                        'label' => 'Columns',
                        'min' => 2,
                        'max' => 8,
                        'default' => 5,
                    ],
                    'logo_height' => [
                        'type' => 'integer',
                        'label' => 'Logo Height (px)',
                        'min' => 24,
                        'max' => 120,
                        'default' => 40,
                    ],
                    'grayscale' => [
                        'type' => 'boolean',
                        'label' => 'Grayscale logos (color on hover)',
                        'default' => true,
                    ],
                ],
            ],
        ],

        'countdown_timer' => [
            'name' => 'Countdown Timer',
            'description' => 'Live countdown to a target date — great for flash sales and event launches',
            'icon' => 'timer',
            'category' => 'marketing',
            'enum' => PageBlockTypeEnum::CountdownTimer,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Heading',
                        'placeholder' => 'Flash Sale Ends In',
                    ],
                    'subtitle' => [
                        'type' => 'string',
                        'label' => 'Subheading',
                        'format' => 'textarea',
                    ],
                    'target_date' => [
                        'type' => 'string',
                        'label' => 'Target Date & Time (ISO 8601)',
                        'placeholder' => '2026-12-31T23:59:00',
                        'description' => 'Format: YYYY-MM-DDTHH:MM:SS',
                    ],
                    'show_labels' => [
                        'type' => 'boolean',
                        'label' => 'Show Days / Hours / Minutes / Seconds labels',
                        'default' => true,
                    ],
                    'expired_message' => [
                        'type' => 'string',
                        'label' => 'Message when expired',
                        'placeholder' => 'This offer has ended.',
                    ],
                    'cta_label' => [
                        'type' => 'string',
                        'label' => 'CTA Button Label',
                    ],
                    'cta_url' => [
                        'type' => 'string',
                        'label' => 'CTA Button URL',
                        'format' => 'url',
                    ],
                    'style' => [
                        'type' => 'string',
                        'label' => 'Style',
                        'enum' => ['light', 'dark', 'brand'],
                        'default' => 'dark',
                    ],
                ],
            ],
        ],

        'timeline' => [
            'name' => 'Timeline',
            'description' => 'Vertical timeline — company history, process steps, milestones',
            'icon' => 'milestone',
            'category' => 'content',
            'enum' => PageBlockTypeEnum::Timeline,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Section Title',
                    ],
                    'subtitle' => [
                        'type' => 'string',
                        'label' => 'Section Subtitle',
                        'format' => 'textarea',
                    ],
                    'layout' => [
                        'type' => 'string',
                        'label' => 'Layout',
                        'enum' => ['left', 'center', 'right'],
                        'default' => 'left',
                    ],
                    'items' => [
                        'type' => 'array',
                        'label' => 'Timeline Items',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'date' => ['type' => 'string', 'label' => 'Date / Year', 'placeholder' => '2020'],
                                'title' => ['type' => 'string', 'label' => 'Title', 'placeholder' => 'Company founded'],
                                'description' => ['type' => 'string', 'label' => 'Description', 'format' => 'textarea'],
                                'icon' => ['type' => 'string', 'label' => 'Icon (lucide name)', 'placeholder' => 'star'],
                            ],
                        ],
                    ],
                ],
            ],
        ],

        'team_members' => [
            'name' => 'Team Members',
            'description' => 'Grid of team member cards with photo, name, role and social links',
            'icon' => 'users',
            'category' => 'content',
            'enum' => PageBlockTypeEnum::TeamMembers,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Section Title',
                        'placeholder' => 'Meet the Team',
                    ],
                    'subtitle' => [
                        'type' => 'string',
                        'label' => 'Section Subtitle',
                        'format' => 'textarea',
                    ],
                    'columns' => [
                        'type' => 'integer',
                        'label' => 'Columns',
                        'min' => 2,
                        'max' => 5,
                        'default' => 4,
                    ],
                    'members' => [
                        'type' => 'array',
                        'label' => 'Team Members',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'name' => ['type' => 'string', 'label' => 'Name', 'placeholder' => 'John Smith'],
                                'role' => ['type' => 'string', 'label' => 'Role', 'placeholder' => 'CEO & Founder'],
                                'bio' => ['type' => 'string', 'label' => 'Short Bio', 'format' => 'textarea'],
                                'photo_url' => ['type' => 'string', 'label' => 'Photo URL', 'format' => 'url'],
                                'linkedin_url' => ['type' => 'string', 'label' => 'LinkedIn URL', 'format' => 'url'],
                                'twitter_url' => ['type' => 'string', 'label' => 'Twitter/X URL', 'format' => 'url'],
                            ],
                        ],
                    ],
                ],
            ],
        ],

        'icon_list' => [
            'name' => 'Icon List / Features',
            'description' => 'Repeater of icon + title + description — classic features or benefits block',
            'icon' => 'list',
            'category' => 'content',
            'enum' => PageBlockTypeEnum::IconList,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => ['type' => 'string', 'label' => 'Section Title', 'placeholder' => 'Why Choose Us'],
                    'subtitle' => ['type' => 'string', 'label' => 'Section Subtitle', 'format' => 'textarea'],
                    'columns' => ['type' => 'integer', 'label' => 'Columns', 'min' => 1, 'max' => 4, 'default' => 2],
                    'style' => [
                        'type' => 'string',
                        'label' => 'Item Style',
                        'enum' => ['horizontal', 'centered', 'compact'],
                        'default' => 'horizontal',
                    ],
                    'icon_color' => ['type' => 'string', 'label' => 'Icon Color', 'format' => 'color'],
                    'items' => [
                        'type' => 'array',
                        'label' => 'Items',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'icon' => ['type' => 'string', 'label' => 'Icon', 'placeholder' => 'check, star, shield, truck, lock…'],
                                'title' => ['type' => 'string', 'label' => 'Title'],
                                'description' => ['type' => 'string', 'label' => 'Description', 'format' => 'textarea'],
                            ],
                        ],
                    ],
                ],
            ],
        ],

        'steps_process' => [
            'name' => 'Steps / How It Works',
            'description' => 'Numbered process steps — "How it works" section with connectors between steps',
            'icon' => 'footprints',
            'category' => 'content',
            'enum' => PageBlockTypeEnum::StepsProcess,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => ['type' => 'string', 'label' => 'Section Title', 'placeholder' => 'How It Works'],
                    'subtitle' => ['type' => 'string', 'label' => 'Section Subtitle', 'format' => 'textarea'],
                    'layout' => [
                        'type' => 'string',
                        'label' => 'Layout',
                        'enum' => ['horizontal', 'vertical', 'numbered'],
                        'default' => 'horizontal',
                    ],
                    'steps' => [
                        'type' => 'array',
                        'label' => 'Steps',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'title' => ['type' => 'string', 'label' => 'Step Title'],
                                'description' => ['type' => 'string', 'label' => 'Description', 'format' => 'textarea'],
                                'icon' => ['type' => 'string', 'label' => 'Icon (optional)', 'placeholder' => 'check, star…'],
                            ],
                        ],
                    ],
                ],
            ],
        ],

        'trust_badges' => [
            'name' => 'Trust Badges',
            'description' => 'Row of trust signals: Free Shipping, Secure Payment, Returns, Authentic, etc.',
            'icon' => 'shield-check',
            'category' => 'marketing',
            'enum' => PageBlockTypeEnum::TrustBadges,
            'allowed_relations' => [],
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'style' => [
                        'type' => 'string',
                        'label' => 'Style',
                        'enum' => ['row', 'card', 'minimal'],
                        'default' => 'row',
                    ],
                    'badges' => [
                        'type' => 'array',
                        'label' => 'Badges',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'icon' => ['type' => 'string', 'label' => 'Icon', 'placeholder' => 'truck, shield, return, lock, award…'],
                                'label' => ['type' => 'string', 'label' => 'Label', 'placeholder' => 'Free Shipping'],
                                'sublabel' => ['type' => 'string', 'label' => 'Sub-label', 'placeholder' => 'On orders over 200 zł'],
                            ],
                        ],
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
        'alert_banner' => [
            'name' => 'Alert Banner',
            'description' => 'Dismissable announcement bar',
            'icon' => 'alert-circle',
            'category' => 'layout',
            'enum' => PageBlockTypeEnum::AlertBanner,
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'message' => [
                        'type' => 'string',
                        'label' => 'Message',
                        'required' => true,
                    ],
                    'link' => [
                        'type' => 'string',
                        'format' => 'url',
                        'label' => 'Link URL',
                    ],
                    'link_label' => [
                        'type' => 'string',
                        'label' => 'Link Label',
                        'default' => 'Learn more',
                    ],
                    'variant' => [
                        'type' => 'string',
                        'label' => 'Variant',
                        'enum' => ['info', 'warning', 'success', 'error'],
                        'default' => 'info',
                    ],
                    'dismissable' => [
                        'type' => 'boolean',
                        'label' => 'Dismissable',
                        'default' => true,
                    ],
                ],
            ],
        ],
        'pricing_cards' => [
            'name' => 'Pricing Cards',
            'description' => 'Pricing plans with monthly/yearly toggle',
            'icon' => 'credit-card',
            'category' => 'marketing',
            'enum' => PageBlockTypeEnum::PricingCards,
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Section Title',
                    ],
                    'subtitle' => [
                        'type' => 'string',
                        'label' => 'Subtitle',
                    ],
                    'show_toggle' => [
                        'type' => 'boolean',
                        'label' => 'Show Monthly/Yearly Toggle',
                        'default' => true,
                    ],
                ],
            ],
        ],
    ],
];
