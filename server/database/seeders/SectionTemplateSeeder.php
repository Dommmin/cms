<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\SectionTemplate;
use Illuminate\Database\Seeder;

class SectionTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Hero Banner',
                'section_type' => 'hero',
                'variant' => 'hero',
                'category' => 'Marketing',
                'is_global' => true,
                'preset_data' => [
                    'blocks' => [
                        [
                            'type' => 'hero_banner',
                            'configuration' => [
                                'title' => 'Welcome to Our Store',
                                'subtitle' => 'Discover amazing products',
                                'cta_label' => 'Shop Now',
                                'cta_url' => '/products',
                                'overlay_opacity' => 0.4,
                            ],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Text + Image (Left)',
                'section_type' => 'two-col',
                'variant' => 'light',
                'category' => 'Content',
                'is_global' => true,
                'preset_data' => [
                    'blocks' => [
                        [
                            'type' => 'rich_text',
                            'configuration' => [
                                'content' => '<h2>About Us</h2><p>Tell your story here. Engage visitors with compelling content.</p>',
                            ],
                        ],
                        [
                            'type' => 'rich_text',
                            'configuration' => [
                                'content' => '<p>[Insert image here]</p>',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Product Grid',
                'section_type' => 'contained',
                'variant' => 'light',
                'category' => 'E-commerce',
                'is_global' => true,
                'preset_data' => [
                    'blocks' => [
                        [
                            'type' => 'featured_products',
                            'configuration' => [
                                'title' => 'Featured Products',
                                'columns' => 4,
                                'limit' => 8,
                            ],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Testimonials',
                'section_type' => 'contained',
                'variant' => 'muted',
                'category' => 'Social Proof',
                'is_global' => true,
                'preset_data' => [
                    'blocks' => [
                        [
                            'type' => 'testimonials',
                            'configuration' => [
                                'title' => 'What Our Customers Say',
                                'items' => [
                                    ['author' => 'Jane D.', 'text' => 'Great product, fast shipping!', 'rating' => 5],
                                    ['author' => 'John S.', 'text' => 'Exactly what I was looking for.', 'rating' => 5],
                                    ['author' => 'Maria K.', 'text' => 'Excellent quality, will buy again.', 'rating' => 5],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'FAQ Section',
                'section_type' => 'contained',
                'variant' => 'light',
                'category' => 'Content',
                'is_global' => true,
                'preset_data' => [
                    'blocks' => [
                        [
                            'type' => 'accordion',
                            'configuration' => [
                                'title' => 'Frequently Asked Questions',
                                'items' => [
                                    ['question' => 'What is your return policy?', 'answer' => 'We offer 30-day returns on all items.'],
                                    ['question' => 'How long does shipping take?', 'answer' => 'Standard shipping takes 3-5 business days.'],
                                    ['question' => 'Do you ship internationally?', 'answer' => 'Yes, we ship to over 50 countries worldwide.'],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'CTA Banner',
                'section_type' => 'contained',
                'variant' => 'brand',
                'category' => 'Marketing',
                'is_global' => true,
                'preset_data' => [
                    'blocks' => [
                        [
                            'type' => 'promotional_banner',
                            'configuration' => [
                                'title' => 'Special Offer — 20% Off',
                                'description' => 'Use code SAVE20 at checkout. Limited time only.',
                                'cta_label' => 'Claim Offer',
                                'cta_url' => '/products',
                                'badge' => 'Limited time',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Newsletter Signup',
                'section_type' => 'contained',
                'variant' => 'dark',
                'category' => 'Marketing',
                'is_global' => true,
                'preset_data' => [
                    'blocks' => [
                        [
                            'type' => 'newsletter_signup',
                            'configuration' => [
                                'title' => 'Stay in the Loop',
                                'description' => 'Subscribe for exclusive deals and early access.',
                                'placeholder' => 'Enter your email address',
                                'button_label' => 'Subscribe',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Team Grid',
                'section_type' => 'three-col',
                'variant' => 'light',
                'category' => 'Content',
                'is_global' => true,
                'preset_data' => [
                    'blocks' => [
                        [
                            'type' => 'rich_text',
                            'configuration' => [
                                'content' => '<div class="text-center"><img src="" alt="Team member" class="mx-auto mb-3 h-24 w-24 rounded-full object-cover" /><h3>Name</h3><p class="text-muted-foreground">Role</p></div>',
                            ],
                        ],
                        [
                            'type' => 'rich_text',
                            'configuration' => [
                                'content' => '<div class="text-center"><img src="" alt="Team member" class="mx-auto mb-3 h-24 w-24 rounded-full object-cover" /><h3>Name</h3><p class="text-muted-foreground">Role</p></div>',
                            ],
                        ],
                        [
                            'type' => 'rich_text',
                            'configuration' => [
                                'content' => '<div class="text-center"><img src="" alt="Team member" class="mx-auto mb-3 h-24 w-24 rounded-full object-cover" /><h3>Name</h3><p class="text-muted-foreground">Role</p></div>',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($templates as $template) {
            SectionTemplate::query()->firstOrCreate(['name' => $template['name']], $template);
        }
    }
}
