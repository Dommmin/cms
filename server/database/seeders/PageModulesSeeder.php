<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Services\ModuleRegistryService;
use Illuminate\Database\Seeder;

class PageModulesSeeder extends Seeder
{
    public function run(ModuleRegistryService $registry): void
    {
        $this->registerEcommerceModule($registry);
        $this->registerJobOffersModule($registry);
        $this->registerBlogModule($registry);

        // Sync all registered modules to database
        $registry->sync();

        $this->command->info('✓ Page modules synced successfully!');
    }

    private function registerEcommerceModule(ModuleRegistryService $registry): void
    {
        $registry->registerModule('ecommerce', [
            'name' => 'E-commerce',
            'icon' => 'shopping-cart',
            'description' => 'Product listings and detail pages',
            'has_list_page' => true,
            'has_detail_page' => true,
            'list_route_pattern' => '/shop',
            'detail_route_pattern' => '/shop/{slug}',
            'model_class' => \App\Models\Product::class,
            'route_key_name' => 'slug',

            // List layouts
            'list_layouts' => [
                'grid' => [
                    'name' => 'Grid Layout',
                    'component' => 'ProductGridLayout',
                    'preview_image' => '/images/previews/product-grid.png',
                    'config_schema' => [
                        'items_per_row' => [
                            'type' => 'integer',
                            'label' => 'Items per Row',
                            'default' => 4,
                            'min' => 1,
                            'max' => 6,
                        ],
                        'show_filters' => [
                            'type' => 'boolean',
                            'label' => 'Show Filters',
                            'default' => true,
                        ],
                        'show_sorting' => [
                            'type' => 'boolean',
                            'label' => 'Show Sorting',
                            'default' => true,
                        ],
                        'show_pagination' => [
                            'type' => 'boolean',
                            'label' => 'Show Pagination',
                            'default' => true,
                        ],
                    ],
                    'default_config' => [
                        'items_per_row' => 4,
                        'show_filters' => true,
                        'show_sorting' => true,
                        'show_pagination' => true,
                    ],
                ],
                'list' => [
                    'name' => 'List Layout',
                    'component' => 'ProductListLayout',
                    'preview_image' => '/images/previews/product-list.png',
                    'config_schema' => [
                        'compact' => [
                            'type' => 'boolean',
                            'label' => 'Compact Mode',
                            'default' => false,
                        ],
                        'show_description' => [
                            'type' => 'boolean',
                            'label' => 'Show Description',
                            'default' => true,
                        ],
                    ],
                    'default_config' => [
                        'compact' => false,
                        'show_description' => true,
                    ],
                ],
                'masonry' => [
                    'name' => 'Masonry Grid',
                    'component' => 'ProductMasonryLayout',
                    'preview_image' => '/images/previews/product-masonry.png',
                    'config_schema' => [
                        'columns' => [
                            'type' => 'integer',
                            'label' => 'Number of Columns',
                            'default' => 3,
                            'min' => 2,
                            'max' => 5,
                        ],
                    ],
                    'default_config' => [
                        'columns' => 3,
                    ],
                ],
            ],

            // Detail layouts
            'detail_layouts' => [
                'single_column' => [
                    'name' => 'Single Column',
                    'component' => 'ProductDetailSingleColumn',
                    'preview_image' => '/images/previews/product-detail-single.png',
                    'config_schema' => [
                        'show_related' => [
                            'type' => 'boolean',
                            'label' => 'Show Related Products',
                            'default' => true,
                        ],
                        'gallery_position' => [
                            'type' => 'select',
                            'label' => 'Gallery Position',
                            'options' => ['left', 'right', 'top'],
                            'default' => 'left',
                        ],
                        'show_reviews' => [
                            'type' => 'boolean',
                            'label' => 'Show Reviews',
                            'default' => true,
                        ],
                    ],
                    'default_config' => [
                        'show_related' => true,
                        'gallery_position' => 'left',
                        'show_reviews' => true,
                    ],
                ],
                'split' => [
                    'name' => 'Split Layout (50/50)',
                    'component' => 'ProductDetailSplit',
                    'preview_image' => '/images/previews/product-detail-split.png',
                    'config_schema' => [
                        'sticky_gallery' => [
                            'type' => 'boolean',
                            'label' => 'Sticky Gallery on Scroll',
                            'default' => true,
                        ],
                    ],
                    'default_config' => [
                        'sticky_gallery' => true,
                    ],
                ],
            ],
        ]);
    }

    private function registerJobOffersModule(ModuleRegistryService $registry): void
    {
        $registry->registerModule('job_offers', [
            'name' => 'Job Offers',
            'icon' => 'briefcase',
            'description' => 'Job listings and detail pages',
            'has_list_page' => true,
            'has_detail_page' => true,
            'list_route_pattern' => '/careers',
            'detail_route_pattern' => '/careers/{slug}',
            'model_class' => null, // Można później dodać JobOffer::class
            'route_key_name' => 'slug',

            'list_layouts' => [
                'cards' => [
                    'name' => 'Job Cards',
                    'component' => 'JobOffersCardLayout',
                    'preview_image' => '/images/previews/job-cards.png',
                    'config_schema' => [
                        'show_location' => [
                            'type' => 'boolean',
                            'label' => 'Show Location',
                            'default' => true,
                        ],
                        'show_salary' => [
                            'type' => 'boolean',
                            'label' => 'Show Salary Range',
                            'default' => true,
                        ],
                        'group_by_department' => [
                            'type' => 'boolean',
                            'label' => 'Group by Department',
                            'default' => false,
                        ],
                    ],
                    'default_config' => [
                        'show_location' => true,
                        'show_salary' => true,
                        'group_by_department' => false,
                    ],
                ],
                'table' => [
                    'name' => 'Table View',
                    'component' => 'JobOffersTableLayout',
                    'preview_image' => '/images/previews/job-table.png',
                    'config_schema' => [
                        'columns' => [
                            'type' => 'multiselect',
                            'label' => 'Visible Columns',
                            'options' => ['position', 'department', 'location', 'type', 'salary', 'posted_date'],
                            'default' => ['position', 'department', 'location', 'type'],
                        ],
                    ],
                    'default_config' => [
                        'columns' => ['position', 'department', 'location', 'type'],
                    ],
                ],
            ],

            'detail_layouts' => [
                'default' => [
                    'name' => 'Job Details',
                    'component' => 'JobOfferDetailLayout',
                    'preview_image' => '/images/previews/job-detail.png',
                    'config_schema' => [
                        'show_apply_form' => [
                            'type' => 'boolean',
                            'label' => 'Show Application Form',
                            'default' => true,
                        ],
                        'show_similar_jobs' => [
                            'type' => 'boolean',
                            'label' => 'Show Similar Jobs',
                            'default' => true,
                        ],
                    ],
                    'default_config' => [
                        'show_apply_form' => true,
                        'show_similar_jobs' => true,
                    ],
                ],
            ],
        ]);
    }

    private function registerBlogModule(ModuleRegistryService $registry): void
    {
        $registry->registerModule('blog', [
            'name' => 'Blog',
            'icon' => 'newspaper',
            'description' => 'Blog posts listing and detail pages',
            'has_list_page' => true,
            'has_detail_page' => true,
            'list_route_pattern' => '/blog',
            'detail_route_pattern' => '/blog/{slug}',
            'model_class' => null, // Można później dodać BlogPost::class
            'route_key_name' => 'slug',

            'list_layouts' => [
                'grid' => [
                    'name' => 'Blog Grid',
                    'component' => 'BlogGridLayout',
                    'preview_image' => '/images/previews/blog-grid.png',
                    'config_schema' => [
                        'posts_per_row' => [
                            'type' => 'integer',
                            'label' => 'Posts per Row',
                            'default' => 3,
                            'min' => 2,
                            'max' => 4,
                        ],
                        'show_excerpts' => [
                            'type' => 'boolean',
                            'label' => 'Show Excerpts',
                            'default' => true,
                        ],
                        'show_author' => [
                            'type' => 'boolean',
                            'label' => 'Show Author',
                            'default' => true,
                        ],
                        'show_categories' => [
                            'type' => 'boolean',
                            'label' => 'Show Categories',
                            'default' => true,
                        ],
                    ],
                    'default_config' => [
                        'posts_per_row' => 3,
                        'show_excerpts' => true,
                        'show_author' => true,
                        'show_categories' => true,
                    ],
                ],
                'magazine' => [
                    'name' => 'Magazine Style',
                    'component' => 'BlogMagazineLayout',
                    'preview_image' => '/images/previews/blog-magazine.png',
                    'config_schema' => [
                        'featured_posts' => [
                            'type' => 'integer',
                            'label' => 'Number of Featured Posts',
                            'default' => 1,
                            'min' => 0,
                            'max' => 3,
                        ],
                    ],
                    'default_config' => [
                        'featured_posts' => 1,
                    ],
                ],
            ],

            'detail_layouts' => [
                'standard' => [
                    'name' => 'Standard Post',
                    'component' => 'BlogPostStandard',
                    'preview_image' => '/images/previews/blog-post-standard.png',
                    'config_schema' => [
                        'show_share_buttons' => [
                            'type' => 'boolean',
                            'label' => 'Show Share Buttons',
                            'default' => true,
                        ],
                        'show_comments' => [
                            'type' => 'boolean',
                            'label' => 'Show Comments',
                            'default' => true,
                        ],
                        'show_related_posts' => [
                            'type' => 'boolean',
                            'label' => 'Show Related Posts',
                            'default' => true,
                        ],
                    ],
                    'default_config' => [
                        'show_share_buttons' => true,
                        'show_comments' => true,
                        'show_related_posts' => true,
                    ],
                ],
            ],
        ]);
    }
}
