<?php

declare(strict_types=1);

/**
 * Block Patterns
 *
 * Predefined sets of blocks that can be inserted with a single click.
 * These complement the existing section_presets.php by offering
 * multi-section compositions for common page layouts.
 */
return [
    'hero-with-cta' => [
        'name' => 'Hero + CTA',
        'description' => 'Full-width hero section followed by a call-to-action block.',
        'sections' => [
            [
                'section_type' => 'hero',
                'layout' => 'full-width',
                'variant' => 'centered',
                'settings' => ['padding' => 'xl'],
                'blocks' => [
                    [
                        'type' => 'hero_banner',
                        'configuration' => [
                            'title' => 'Build Something Amazing',
                            'subtitle' => 'Start creating your dream project today.',
                            'cta_text' => 'Get Started',
                            'cta_url' => '/register',
                            'cta_style' => 'primary',
                        ],
                    ],
                ],
            ],
            [
                'section_type' => 'standard',
                'layout' => 'contained',
                'variant' => 'light',
                'settings' => ['padding' => 'lg'],
                'blocks' => [
                    [
                        'type' => 'call_to_action',
                        'configuration' => [
                            'title' => 'Ready to get started?',
                            'subtitle' => 'Join thousands of satisfied customers.',
                            'primary_label' => 'Sign Up',
                            'primary_url' => '/register',
                            'style' => 'brand',
                            'alignment' => 'center',
                        ],
                    ],
                ],
            ],
        ],
    ],

    'features-three-col' => [
        'name' => 'Features Grid',
        'description' => 'Three-column feature highlights with icons.',
        'sections' => [
            [
                'section_type' => 'standard',
                'layout' => 'contained',
                'variant' => 'light',
                'settings' => ['padding' => 'lg'],
                'blocks' => [
                    [
                        'type' => 'three_columns',
                        'configuration' => [
                            'heading' => 'Our Features',
                        ],
                    ],
                ],
            ],
        ],
    ],

    'pricing-with-faq' => [
        'name' => 'Pricing + FAQ',
        'description' => 'Pricing tables followed by frequently asked questions.',
        'sections' => [
            [
                'section_type' => 'standard',
                'layout' => 'contained',
                'variant' => 'light',
                'settings' => ['padding' => 'lg'],
                'blocks' => [
                    [
                        'type' => 'pricing_table',
                        'configuration' => [
                            'heading' => 'Choose Your Plan',
                        ],
                    ],
                ],
            ],
            [
                'section_type' => 'standard',
                'layout' => 'contained',
                'variant' => 'muted',
                'settings' => ['padding' => 'lg'],
                'blocks' => [
                    [
                        'type' => 'accordion',
                        'configuration' => [
                            'heading' => 'Frequently Asked Questions',
                        ],
                    ],
                ],
            ],
        ],
    ],

    'testimonials-with-stats' => [
        'name' => 'Testimonials + Stats',
        'description' => 'Social proof section with statistics.',
        'sections' => [
            [
                'section_type' => 'standard',
                'layout' => 'contained',
                'variant' => 'light',
                'settings' => ['padding' => 'lg'],
                'blocks' => [
                    [
                        'type' => 'testimonials',
                        'configuration' => [
                            'heading' => 'What Our Customers Say',
                        ],
                    ],
                    [
                        'type' => 'stats_counter',
                        'configuration' => [],
                    ],
                ],
            ],
        ],
    ],

    'blog-with-newsletter' => [
        'name' => 'Blog + Newsletter',
        'description' => 'Featured posts section with a newsletter signup.',
        'sections' => [
            [
                'section_type' => 'standard',
                'layout' => 'contained',
                'variant' => 'light',
                'settings' => ['padding' => 'lg'],
                'blocks' => [
                    [
                        'type' => 'featured_posts',
                        'configuration' => [
                            'heading' => 'Latest Articles',
                        ],
                    ],
                ],
            ],
            [
                'section_type' => 'standard',
                'layout' => 'contained',
                'variant' => 'brand',
                'settings' => ['padding' => 'md'],
                'blocks' => [
                    [
                        'type' => 'newsletter_signup',
                        'configuration' => [
                            'heading' => 'Stay Updated',
                            'subtitle' => 'Subscribe to our newsletter for the latest news.',
                        ],
                    ],
                ],
            ],
        ],
    ],
];
