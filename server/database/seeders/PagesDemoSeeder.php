<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Faq;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageSection;
use App\Models\Product;
use Illuminate\Database\Seeder;

class PagesDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedFaqs();
        $this->seedHomepage();
        $this->seedAboutPage();
        $this->seedLegalPages();
        $this->seedFaqPage();
        $this->seedShippingPage();
        $this->seedReturnPolicyPage();
        $this->seedCookiePolicyPage();
        $this->seedContactPage();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FAQs
    // ─────────────────────────────────────────────────────────────────────────

    private function seedFaqs(): void
    {
        $faqs = [
            // Orders
            ['question' => 'How do I place an order?', 'answer' => '<p>Simply browse our catalogue, add items to your cart, and proceed to checkout. You can pay by card, PayPal, or bank transfer.</p>', 'category' => 'orders', 'position' => 1],
            ['question' => 'Can I modify or cancel my order?', 'answer' => '<p>Orders can be modified or cancelled within 1 hour of placement. After that the order enters fulfilment and cannot be changed. Contact support as quickly as possible.</p>', 'category' => 'orders', 'position' => 2],
            ['question' => 'How do I track my order?', 'answer' => '<p>Once your order ships you will receive an email with a tracking number. You can also check the status in <strong>My Account → Orders</strong>.</p>', 'category' => 'orders', 'position' => 3],
            ['question' => 'Do you offer gift wrapping?', 'answer' => '<p>Yes! During checkout you can add a gift-wrap option for a small fee and include a personalised message card.</p>', 'category' => 'orders', 'position' => 4],

            // Shipping
            ['question' => 'How long does delivery take?', 'answer' => '<p>Standard shipping takes 3–5 business days. Express shipping (1–2 business days) is available at checkout for an additional fee.</p>', 'category' => 'shipping', 'position' => 1],
            ['question' => 'Do you ship internationally?', 'answer' => '<p>We currently ship to the EU, UK, USA, and Canada. International orders may be subject to customs duties which are the buyer\'s responsibility.</p>', 'category' => 'shipping', 'position' => 2],
            ['question' => 'Is free shipping available?', 'answer' => '<p>Free standard shipping is available on all orders over €75 within the EU.</p>', 'category' => 'shipping', 'position' => 3],

            // Returns
            ['question' => 'What is your return policy?', 'answer' => '<p>We offer a 30-day return window from the date of delivery. Items must be unused, in original packaging, and accompanied by a receipt.</p>', 'category' => 'returns', 'position' => 1],
            ['question' => 'How do I start a return?', 'answer' => '<p>Log in to your account, navigate to <strong>My Orders</strong>, select the item, and click <em>Request Return</em>. We\'ll email you a prepaid label within 24 hours.</p>', 'category' => 'returns', 'position' => 2],
            ['question' => 'When will I receive my refund?', 'answer' => '<p>Refunds are processed within 3–5 business days of us receiving the returned item. The credit may take a further 5–10 days to appear on your statement depending on your bank.</p>', 'category' => 'returns', 'position' => 3],
            ['question' => 'Can I exchange an item?', 'answer' => '<p>Yes. When submitting a return request, select <em>Exchange</em> and choose the replacement size or colour. We\'ll ship the new item as soon as we receive your return.</p>', 'category' => 'returns', 'position' => 4],

            // Payments
            ['question' => 'What payment methods do you accept?', 'answer' => '<p>We accept Visa, Mastercard, American Express, PayPal, Apple Pay, and Google Pay. All transactions are secured with 256-bit SSL encryption.</p>', 'category' => 'payments', 'position' => 1],
            ['question' => 'Is my payment information secure?', 'answer' => '<p>Absolutely. We never store card details. Payments are processed by a PCI-DSS Level 1 certified payment processor.</p>', 'category' => 'payments', 'position' => 2],
            ['question' => 'Can I pay in instalments?', 'answer' => '<p>Yes, we offer 0% instalment plans through Klarna for eligible orders over €100. Select Klarna at checkout to see your options.</p>', 'category' => 'payments', 'position' => 3],

            // Products
            ['question' => 'How do I find the right size?', 'answer' => '<p>Each product page includes a detailed size guide. If you are between sizes, we recommend sizing up for a relaxed fit or sizing down for a tailored fit.</p>', 'category' => 'products', 'position' => 1],
            ['question' => 'Are your products ethically made?', 'answer' => '<p>We partner only with suppliers who meet our ethical manufacturing standards, including fair wages and safe working conditions. Many of our products are certified organic or recycled.</p>', 'category' => 'products', 'position' => 2],
            ['question' => 'Do you restock sold-out items?', 'answer' => '<p>Popular items are usually restocked within 4–6 weeks. Click the <em>Notify me</em> button on the product page and we\'ll email you as soon as it\'s back.</p>', 'category' => 'products', 'position' => 3],

            // Account
            ['question' => 'How do I create an account?', 'answer' => '<p>Click <em>Sign Up</em> at the top of any page, enter your email and a password, and verify your email address. It takes less than a minute.</p>', 'category' => 'account', 'position' => 1],
            ['question' => 'I forgot my password. What should I do?', 'answer' => '<p>Click <em>Forgot password?</em> on the login page and enter your email. We\'ll send a reset link that is valid for 60 minutes.</p>', 'category' => 'account', 'position' => 2],
            ['question' => 'How do I delete my account?', 'answer' => '<p>You can request account deletion from <strong>Settings → Privacy → Delete Account</strong>. All personal data is permanently removed within 30 days in accordance with GDPR.</p>', 'category' => 'account', 'position' => 3],
        ];

        foreach ($faqs as $faq) {
            Faq::updateOrCreate(
                ['question' => $faq['question']],
                array_merge($faq, ['is_active' => true])
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HOMEPAGE
    // ─────────────────────────────────────────────────────────────────────────

    private function seedHomepage(): void
    {
        $page = Page::updateOrCreate(
            ['slug' => 'home'],
            [
                'parent_id' => null,
                'title' => ['en' => 'Home', 'pl' => 'Strona główna'],
                'slug_translations' => ['pl' => 'strona-glowna'],
                'page_type' => 'blocks',
                'is_published' => true,
                'published_at' => now(),
                'position' => 1,
                'seo_title' => 'Shop the Best Fashion, Home & Lifestyle',
                'seo_description' => 'Discover curated collections of fashion, home décor, beauty, and sportswear. Free shipping on orders over €75.',
            ]
        );

        // Clear existing sections so re-seeding is clean
        $page->allSections()->delete();

        // 1 ── Hero Banner
        $heroSection = $this->createSection($page, 'hero', 'full_width', 'dark', [], 1);
        $this->createBlock($page, $heroSection, 'hero_banner', [
            'title' => 'Style Meets Substance',
            'subtitle' => 'Curated fashion, home décor and lifestyle essentials — crafted to last.',
            'cta_text' => 'Shop Now',
            'cta_url' => '/products',
            'cta_secondary_text' => 'Explore Collections',
            'cta_secondary_url' => '/categories',
            'overlay_opacity' => 45,
            'text_alignment' => 'center',
            'min_height' => 600,
        ], 1);

        // 2 ── Categories Grid
        $catSection = $this->createSection($page, 'categories', 'contained', null, ['padding' => 'lg', 'background' => '#ffffff'], 2);
        $catBlock = $this->createBlock($page, $catSection, 'categories_grid', [
            'title' => 'Shop by Category',
            'subtitle' => 'Find exactly what you\'re looking for',
            'columns' => 4,
            'show_title' => true,
        ], 1);

        // Attach top-level categories to the block
        $topCategories = Category::whereNull('parent_id')->take(4)->get();
        foreach ($topCategories as $i => $cat) {
            \App\Models\BlockRelation::updateOrCreate(
                ['page_block_id' => $catBlock->id, 'relation_type' => 'category', 'relation_id' => $cat->id],
                ['relation_key' => 'categories', 'position' => $i + 1, 'metadata' => ['label' => $cat->name]]
            );
        }

        // 3 ── Featured Products (Bestsellers)
        $featSection = $this->createSection($page, 'featured', 'contained', null, ['padding' => 'lg', 'background' => '#f8f8f8'], 3);
        $featBlock = $this->createBlock($page, $featSection, 'featured_products', [
            'title' => 'Bestsellers',
            'subtitle' => 'Our most-loved pieces, chosen by our community',
            'columns' => 4,
            'show_price' => true,
            'show_rating' => true,
        ], 1);

        // Attach bestseller products (flagged or first 8)
        $bestsellers = Product::whereHas('flags', fn ($q) => $q->where('name', 'Bestseller'))
            ->take(8)->get();
        if ($bestsellers->isEmpty()) {
            $bestsellers = Product::take(8)->get();
        }
        foreach ($bestsellers as $i => $product) {
            \App\Models\BlockRelation::updateOrCreate(
                ['page_block_id' => $featBlock->id, 'relation_type' => 'product', 'relation_id' => $product->id],
                ['relation_key' => 'products', 'position' => $i + 1, 'metadata' => []]
            );
        }

        // 4 ── Promotional Banner
        $promoSection = $this->createSection($page, 'promo', 'full_width', null, ['padding' => 'none'], 4);
        $this->createBlock($page, $promoSection, 'promotional_banner', [
            'title' => 'New Season, New You',
            'subtitle' => 'Up to 40% off selected styles — this weekend only.',
            'cta_text' => 'Shop the Sale',
            'cta_url' => '/sale',
            'layout' => 'left',
        ], 1);

        // 5 ── USP Three Columns
        $uspSection = $this->createSection($page, 'usp', 'contained', null, ['padding' => 'lg', 'background' => '#ffffff'], 5);
        $this->createBlock($page, $uspSection, 'three_columns', [
            'columns' => [
                [
                    'icon' => '🚚',
                    'title' => 'Free Shipping',
                    'content' => 'On all orders over €75. Fast, tracked delivery to your door.',
                ],
                [
                    'icon' => '↩️',
                    'title' => '30-Day Returns',
                    'content' => 'Not happy? Return any item within 30 days for a full refund.',
                    'cta_label' => 'Learn more',
                    'cta_url' => '/return-policy',
                ],
                [
                    'icon' => '🔒',
                    'title' => 'Secure Payments',
                    'content' => 'Shop with confidence. All transactions are SSL encrypted.',
                ],
            ],
        ], 1);

        // 6 ── Testimonials
        $testSection = $this->createSection($page, 'testimonials', 'contained', null, ['padding' => 'lg', 'background' => '#f8f8f8'], 6);
        $this->createBlock($page, $testSection, 'testimonials', [
            'title' => 'What Our Customers Say',
            'items' => [
                [
                    'name' => 'Anna K.',
                    'rating' => 5,
                    'text' => 'Absolutely love the quality. The fabric on my new jacket is buttery soft and the fit is perfect. Will definitely be ordering again!',
                    'location' => 'Warsaw, Poland',
                ],
                [
                    'name' => 'Marcus T.',
                    'rating' => 5,
                    'text' => 'Delivery was super fast and the packaging was beautiful. The candle set I ordered smells incredible. Perfect gift.',
                    'location' => 'Berlin, Germany',
                ],
                [
                    'name' => 'Sophie R.',
                    'rating' => 5,
                    'text' => 'I was hesitant to buy shoes online, but the size guide was spot on. They arrived exactly as pictured. Stunning!',
                    'location' => 'Paris, France',
                ],
                [
                    'name' => 'Liam O.',
                    'rating' => 4,
                    'text' => 'Great customer service when I needed to exchange a size. The process was seamless and the team was incredibly helpful.',
                    'location' => 'Dublin, Ireland',
                ],
            ],
            'layout' => 'grid',
            'columns' => 2,
        ], 1);

        // 7 ── Newsletter Signup
        $nlSection = $this->createSection($page, 'newsletter', 'full_width', null, ['padding' => 'lg', 'background' => '#1a1a2e'], 7);
        $this->createBlock($page, $nlSection, 'newsletter_signup', [
            'title' => 'Join the Inner Circle',
            'subtitle' => 'Get early access to new drops, exclusive offers, and style inspiration delivered to your inbox.',
            'placeholder' => 'Enter your email address',
            'button_label' => 'Subscribe',
            'success_message' => 'Welcome aboard! Check your inbox for a 10% discount code.',
            'gdpr_note' => 'By subscribing you agree to our Privacy Policy. Unsubscribe at any time.',
        ], 1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ABOUT US
    // ─────────────────────────────────────────────────────────────────────────

    private function seedAboutPage(): void
    {
        $page = Page::updateOrCreate(
            ['slug' => 'about-us'],
            [
                'parent_id' => null,
                'title' => ['en' => 'About Us', 'pl' => 'O nas'],
                'slug_translations' => ['pl' => 'o-nas'],
                'page_type' => 'blocks',
                'is_published' => true,
                'published_at' => now(),
                'position' => 10,
                'seo_title' => 'About Us — Our Story & Values',
                'seo_description' => 'Learn about our mission to bring thoughtfully designed products to everyday life.',
            ]
        );

        $page->allSections()->delete();

        // Hero
        $s1 = $this->createSection($page, 'hero', 'full_width', 'dark', [], 1);
        $this->createBlock($page, $s1, 'hero_banner', [
            'title' => 'Made with Intention',
            'subtitle' => 'We believe great design should be accessible to everyone.',
            'overlay_opacity' => 50,
            'text_alignment' => 'center',
            'min_height' => 400,
        ], 1);

        // Our Story
        $s2 = $this->createSection($page, 'story', 'contained', null, ['padding' => 'xl'], 2);
        $this->createBlock($page, $s2, 'two_columns', [
            'layout' => 'text_image',
            'ratio' => '1:1',
            'left' => [
                'title' => 'Our Story',
                'text' => '<p>Founded in 2020, we started with a simple belief: that everyday products should be both beautiful and built to last. We were frustrated by disposable fashion and mass-produced home goods that fell apart after a season.</p><p>So we set out to curate collections from artisan makers and ethical manufacturers who share our commitment to quality, sustainability, and fair practices.</p><p>Today we work with over 50 suppliers across Europe and beyond, each carefully vetted for their craftsmanship and values.</p>',
                'cta_label' => 'Meet our brands',
                'cta_url' => '/brands',
            ],
            'right' => [
                'image_url' => '',
                'image_alt' => 'Our workshop',
            ],
        ], 1);

        // Values
        $s3 = $this->createSection($page, 'values', 'contained', null, ['padding' => 'lg', 'background' => '#f8f8f8'], 3);
        $this->createBlock($page, $s3, 'three_columns', [
            'title' => 'What We Stand For',
            'columns' => [
                [
                    'icon' => '🌱',
                    'title' => 'Sustainability',
                    'content' => 'Over 70% of our products use recycled, organic, or responsibly sourced materials. We\'re on a path to full carbon neutrality by 2027.',
                ],
                [
                    'icon' => '🤝',
                    'title' => 'Fair Trade',
                    'content' => 'Every supplier in our network is audited annually for fair wages, safe conditions, and ethical sourcing.',
                ],
                [
                    'icon' => '💎',
                    'title' => 'Lasting Quality',
                    'content' => 'We design for longevity, not obsolescence. Our products come with extended warranties and repair programmes.',
                ],
            ],
        ], 1);

        // CTA
        $s4 = $this->createSection($page, 'cta', 'full_width', null, ['padding' => 'lg', 'background' => '#1a1a2e'], 4);
        $this->createBlock($page, $s4, 'promotional_banner', [
            'title' => 'Shop Our Collections',
            'subtitle' => 'Every purchase supports the artisans behind our products.',
            'cta_text' => 'Browse Now',
            'cta_url' => '/products',
            'layout' => 'center',
        ], 1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LEGAL PAGES
    // ─────────────────────────────────────────────────────────────────────────

    private function seedLegalPages(): void
    {
        $legalPages = [
            [
                'slug' => 'privacy-policy',
                'title' => ['en' => 'Privacy Policy', 'pl' => 'Polityka prywatności'],
                'slug_translations' => ['pl' => 'polityka-prywatnosci'],
                'position' => 20,
                'seo_title' => 'Privacy Policy',
                'seo_description' => 'Learn how we collect, use, and protect your personal data.',
                'content' => $this->privacyPolicyHtml(),
            ],
            [
                'slug' => 'terms-of-service',
                'title' => ['en' => 'Terms of Service', 'pl' => 'Regulamin'],
                'slug_translations' => ['pl' => 'regulamin'],
                'position' => 21,
                'seo_title' => 'Terms of Service',
                'seo_description' => 'Our terms and conditions governing the use of our website and services.',
                'content' => $this->termsOfServiceHtml(),
            ],
        ];

        foreach ($legalPages as $def) {
            $page = Page::updateOrCreate(
                ['slug' => $def['slug']],
                [
                    'parent_id' => null,
                    'title' => $def['title'],
                    'slug_translations' => $def['slug_translations'],
                    'page_type' => 'module',
                    'module_name' => 'content',
                    'module_config' => ['html' => $def['content']],
                    'content' => $def['content'],
                    'is_published' => true,
                    'published_at' => now(),
                    'position' => $def['position'],
                    'seo_title' => $def['seo_title'],
                    'seo_description' => $def['seo_description'],
                ]
            );

            $page->allSections()->delete();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FAQ PAGE
    // ─────────────────────────────────────────────────────────────────────────

    private function seedFaqPage(): void
    {
        $faqs = Faq::active()->orderBy('category')->orderBy('position')->get();

        $page = Page::updateOrCreate(
            ['slug' => 'faq'],
            [
                'parent_id' => null,
                'title' => ['en' => 'Frequently Asked Questions', 'pl' => 'Najczęstsze pytania'],
                'slug_translations' => ['pl' => 'faq'],
                'page_type' => 'module',
                'module_name' => 'faq',
                'module_config' => [
                    'items' => $faqs->map(fn ($f) => [
                        'id' => $f->id,
                        'question' => $f->question,
                        'answer' => $f->answer,
                        'category' => $f->category,
                    ])->values()->toArray(),
                ],
                'is_published' => true,
                'published_at' => now(),
                'position' => 30,
                'seo_title' => 'FAQ — Frequently Asked Questions',
                'seo_description' => 'Answers to common questions about ordering, shipping, returns, and more.',
            ]
        );

        $page->allSections()->delete();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SHIPPING POLICY
    // ─────────────────────────────────────────────────────────────────────────

    private function seedShippingPage(): void
    {
        $page = Page::updateOrCreate(
            ['slug' => 'shipping-policy'],
            [
                'parent_id' => null,
                'title' => ['en' => 'Shipping Policy', 'pl' => 'Polityka wysyłki'],
                'slug_translations' => ['pl' => 'polityka-wysylki'],
                'page_type' => 'module',
                'module_name' => 'content',
                'module_config' => ['html' => $this->shippingPolicyHtml()],
                'content' => $this->shippingPolicyHtml(),
                'is_published' => true,
                'published_at' => now(),
                'position' => 22,
                'seo_title' => 'Shipping Policy',
                'seo_description' => 'Everything you need to know about our shipping options, delivery times, and costs.',
            ]
        );

        $page->allSections()->delete();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN POLICY
    // ─────────────────────────────────────────────────────────────────────────

    private function seedReturnPolicyPage(): void
    {
        $page = Page::updateOrCreate(
            ['slug' => 'return-policy'],
            [
                'parent_id' => null,
                'title' => ['en' => 'Return & Refund Policy', 'pl' => 'Polityka zwrotów'],
                'slug_translations' => ['pl' => 'polityka-zwrotow'],
                'page_type' => 'module',
                'module_name' => 'content',
                'module_config' => ['html' => $this->returnPolicyHtml()],
                'content' => $this->returnPolicyHtml(),
                'is_published' => true,
                'published_at' => now(),
                'position' => 23,
                'seo_title' => 'Return & Refund Policy',
                'seo_description' => 'Our hassle-free 30-day return and refund policy.',
            ]
        );

        $page->allSections()->delete();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COOKIE POLICY
    // ─────────────────────────────────────────────────────────────────────────

    private function seedCookiePolicyPage(): void
    {
        $page = Page::updateOrCreate(
            ['slug' => 'cookie-policy'],
            [
                'parent_id' => null,
                'title' => ['en' => 'Cookie Policy', 'pl' => 'Polityka cookies'],
                'slug_translations' => ['pl' => 'polityka-cookies'],
                'page_type' => 'module',
                'module_name' => 'content',
                'module_config' => ['html' => $this->cookiePolicyHtml()],
                'content' => $this->cookiePolicyHtml(),
                'is_published' => true,
                'published_at' => now(),
                'position' => 24,
                'seo_title' => 'Cookie Policy',
                'seo_description' => 'How we use cookies and similar technologies on our website.',
            ]
        );

        $page->allSections()->delete();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CONTACT PAGE
    // ─────────────────────────────────────────────────────────────────────────

    private function seedContactPage(): void
    {
        $contactForm = \App\Models\Form::query()->where('slug', 'contact')->first();

        $page = Page::updateOrCreate(
            ['slug' => 'contact'],
            [
                'parent_id' => null,
                'title' => ['en' => 'Contact Us', 'pl' => 'Kontakt'],
                'slug_translations' => ['pl' => 'kontakt'],
                'page_type' => 'blocks',
                'is_published' => true,
                'published_at' => now(),
                'position' => 20,
                'seo_title' => 'Contact Us — We\'d Love to Hear From You',
                'seo_description' => 'Have a question or need help? Reach out to our team and we\'ll get back to you within 1-2 business days.',
            ]
        );

        $page->allSections()->delete();

        // Hero
        $s1 = $this->createSection($page, 'hero', 'contained', null, ['padding' => 'lg'], 1);
        $this->createBlock($page, $s1, 'rich_text', [
            'content' => '<h1>Contact Us</h1><p class="lead">Have a question or need help? We\'d love to hear from you. Fill out the form below and we\'ll get back to you within 1-2 business days.</p>',
            'text_align' => 'center',
        ], 1);

        // Contact Form
        $s2 = $this->createSection($page, 'form', 'contained', null, ['padding' => 'lg'], 2);
        $this->createBlock($page, $s2, 'form_embed', [
            'form_id' => $contactForm?->id,
            'title' => 'Send Us a Message',
            'submit_label' => 'Send Message',
        ], 1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private function createSection(Page $page, string $type, string $layout, ?string $variant, array $settings, int $position): PageSection
    {
        return PageSection::create([
            'page_id' => $page->id,
            'section_type' => $type,
            'layout' => $layout,
            'variant' => $variant,
            'settings' => $settings,
            'position' => $position,
            'is_active' => true,
        ]);
    }

    private function createBlock(Page $page, PageSection $section, string $type, array $configuration, int $position): PageBlock
    {
        return PageBlock::create([
            'page_id' => $page->id,
            'section_id' => $section->id,
            'type' => $type,
            'configuration' => $configuration,
            'position' => $position,
            'is_active' => true,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LEGAL HTML CONTENT
    // ─────────────────────────────────────────────────────────────────────────

    private function privacyPolicyHtml(): string
    {
        return <<<'HTML'
<h1>Privacy Policy</h1>
<p><em>Last updated: February 2026</em></p>

<p>We are committed to protecting your personal data and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it.</p>

<h2>1. Data Controller</h2>
<p>The data controller responsible for your personal data is our company. You can contact us at <a href="mailto:privacy@example.com">privacy@example.com</a>.</p>

<h2>2. Information We Collect</h2>
<p>We collect the following categories of personal data:</p>
<ul>
  <li><strong>Account data:</strong> name, email address, password (hashed), and account preferences.</li>
  <li><strong>Order data:</strong> billing and delivery address, order history, payment method (last 4 digits only — full card numbers are never stored).</li>
  <li><strong>Usage data:</strong> IP address, browser type, pages visited, and time spent on the site (collected via cookies — see our Cookie Policy).</li>
  <li><strong>Communications:</strong> messages you send to our support team, newsletter preferences.</li>
</ul>

<h2>3. Legal Basis for Processing</h2>
<p>We process your data on the following legal bases under GDPR Article 6:</p>
<ul>
  <li><strong>Contract performance</strong> — to fulfil your orders and manage your account.</li>
  <li><strong>Legitimate interests</strong> — to improve our services and prevent fraud.</li>
  <li><strong>Consent</strong> — for marketing emails and non-essential cookies (which you can withdraw at any time).</li>
  <li><strong>Legal obligation</strong> — to comply with applicable laws and regulations.</li>
</ul>

<h2>4. How We Use Your Information</h2>
<ul>
  <li>To process and deliver your orders.</li>
  <li>To send transactional emails (order confirmations, shipping updates).</li>
  <li>To send marketing communications where you have opted in.</li>
  <li>To improve our website and personalise your shopping experience.</li>
  <li>To detect and prevent fraud and abuse.</li>
  <li>To comply with legal obligations (e.g., VAT records).</li>
</ul>

<h2>5. Data Sharing</h2>
<p>We do not sell your personal data. We share it only with:</p>
<ul>
  <li><strong>Shipping carriers</strong> — to deliver your orders.</li>
  <li><strong>Payment processors</strong> — to handle transactions securely (PCI-DSS compliant).</li>
  <li><strong>Cloud infrastructure providers</strong> — who process data on our behalf under strict data-processing agreements.</li>
  <li><strong>Legal authorities</strong> — when required by law.</li>
</ul>

<h2>6. International Transfers</h2>
<p>Where data is transferred outside the EEA, we ensure appropriate safeguards are in place (Standard Contractual Clauses or adequacy decisions).</p>

<h2>7. Data Retention</h2>
<p>We retain personal data for as long as necessary to fulfil the purposes outlined above. Order records are kept for 7 years for tax and legal compliance. You may request deletion of your account data at any time (subject to legal retention requirements).</p>

<h2>8. Your Rights</h2>
<p>Under GDPR you have the right to:</p>
<ul>
  <li>Access your personal data.</li>
  <li>Rectify inaccurate data.</li>
  <li>Erase your data ("right to be forgotten").</li>
  <li>Restrict or object to processing.</li>
  <li>Data portability (receive your data in a machine-readable format).</li>
  <li>Withdraw consent at any time.</li>
  <li>Lodge a complaint with your national supervisory authority.</li>
</ul>
<p>To exercise any of these rights, contact us at <a href="mailto:privacy@example.com">privacy@example.com</a>.</p>

<h2>9. Security</h2>
<p>We implement appropriate technical and organisational measures to protect your data, including encryption at rest and in transit, access controls, and regular security audits.</p>

<h2>10. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or a prominent notice on our website.</p>
HTML;
    }

    private function termsOfServiceHtml(): string
    {
        return <<<'HTML'
<h1>Terms of Service</h1>
<p><em>Last updated: February 2026</em></p>

<p>Please read these Terms of Service carefully before using our website and services. By accessing or placing an order, you agree to be bound by these terms.</p>

<h2>1. About Us</h2>
<p>We operate an online retail platform offering fashion, home décor, beauty, and lifestyle products. References to "we", "us", or "our" refer to the company operating this website.</p>

<h2>2. Eligibility</h2>
<p>You must be at least 18 years old (or have parental consent) to create an account or place an order. By using our services you represent that you meet this requirement.</p>

<h2>3. Orders and Contract</h2>
<p>An order placed through our website constitutes an offer to purchase. A binding contract is formed when we send an order confirmation email. We reserve the right to cancel any order at our discretion (e.g., due to pricing errors or stock unavailability), in which case a full refund will be issued.</p>

<h2>4. Pricing</h2>
<p>All prices are displayed in EUR and include VAT where applicable. We reserve the right to change prices at any time. The price charged will be the price displayed at the time of order confirmation.</p>

<h2>5. Payment</h2>
<p>Payment is required in full at the time of order. We accept major credit/debit cards, PayPal, and other methods listed at checkout. All payment processing is handled by PCI-DSS certified providers.</p>

<h2>6. Shipping and Delivery</h2>
<p>Estimated delivery times are provided at checkout and are not guaranteed. We are not liable for delays caused by third-party carriers, customs, or events beyond our control. Title and risk pass to you upon delivery.</p>

<h2>7. Returns and Refunds</h2>
<p>You have a statutory right to cancel orders within 14 days of receipt (EU Consumer Rights Directive). We extend this to 30 days as a courtesy. Items must be in their original, unused condition. Please refer to our Return Policy for full details.</p>

<h2>8. Intellectual Property</h2>
<p>All content on this website (text, images, logos, designs) is owned by us or our licensors and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.</p>

<h2>9. User Accounts</h2>
<p>You are responsible for maintaining the security of your account credentials and for all activities under your account. Notify us immediately of any unauthorised access at <a href="mailto:security@example.com">security@example.com</a>.</p>

<h2>10. Prohibited Conduct</h2>
<p>You agree not to: use our services for unlawful purposes; attempt to gain unauthorised access to our systems; submit false or misleading information; engage in fraudulent transactions; or infringe the intellectual property rights of others.</p>

<h2>11. Limitation of Liability</h2>
<p>To the fullest extent permitted by law, we shall not be liable for indirect, incidental, or consequential damages arising from your use of our services. Our total liability to you shall not exceed the amount paid for the relevant order.</p>

<h2>12. Governing Law</h2>
<p>These terms are governed by the laws of Poland. Any disputes shall be subject to the exclusive jurisdiction of the courts of Warsaw, without prejudice to your statutory consumer rights.</p>

<h2>13. Changes to Terms</h2>
<p>We may update these Terms from time to time. Continued use of our services after changes constitutes acceptance of the updated terms.</p>

<h2>14. Contact</h2>
<p>For questions about these Terms, contact us at <a href="mailto:legal@example.com">legal@example.com</a>.</p>
HTML;
    }

    private function shippingPolicyHtml(): string
    {
        return <<<'HTML'
<h1>Shipping Policy</h1>
<p><em>Last updated: February 2026</em></p>

<p>We aim to get your order to you as quickly as possible. Here is everything you need to know about our shipping options.</p>

<h2>Processing Time</h2>
<p>Orders are processed Monday–Friday (excluding public holidays). Orders placed before 13:00 CET are typically dispatched the same day. Orders placed after 13:00 CET or on weekends are dispatched the next business day.</p>

<h2>Shipping Options</h2>

<h3>Standard Shipping</h3>
<ul>
  <li><strong>Delivery time:</strong> 3–5 business days (EU)</li>
  <li><strong>Cost:</strong> €4.99</li>
  <li><strong>Free</strong> on all orders over €75</li>
</ul>

<h3>Express Shipping</h3>
<ul>
  <li><strong>Delivery time:</strong> 1–2 business days (EU)</li>
  <li><strong>Cost:</strong> €12.99</li>
</ul>

<h3>International Shipping</h3>
<ul>
  <li><strong>UK:</strong> 4–7 business days — €9.99</li>
  <li><strong>USA &amp; Canada:</strong> 7–14 business days — €19.99</li>
</ul>

<h2>Tracking</h2>
<p>Once your order has been dispatched you will receive an email with a tracking number and a link to the carrier's tracking page. Please allow up to 24 hours for tracking information to appear.</p>

<h2>Customs and Import Duties</h2>
<p>For orders shipped outside the EU, customs duties and import taxes may apply. These charges are the responsibility of the recipient and are not included in our prices or shipping fees.</p>

<h2>Undeliverable Packages</h2>
<p>If a package is returned to us due to an incorrect address or failed delivery attempts, we will contact you to arrange re-delivery. Additional shipping costs may apply.</p>

<h2>Damaged or Lost Packages</h2>
<p>If your package arrives damaged or does not arrive within the expected timeframe, please contact us at <a href="mailto:support@example.com">support@example.com</a> within 14 days. We will work with the carrier to resolve the issue.</p>
HTML;
    }

    private function returnPolicyHtml(): string
    {
        return <<<'HTML'
<h1>Return &amp; Refund Policy</h1>
<p><em>Last updated: February 2026</em></p>

<p>We want you to love everything you buy from us. If something isn't right, we make returns simple.</p>

<h2>Return Window</h2>
<p>You have <strong>30 days</strong> from the date of delivery to return an item, exceeding the 14-day statutory requirement under EU consumer law.</p>

<h2>Eligibility</h2>
<p>To be eligible for a return, items must be:</p>
<ul>
  <li>Unused, unworn, and unwashed.</li>
  <li>In their original packaging with all tags attached.</li>
  <li>Accompanied by the original order confirmation or receipt.</li>
</ul>
<p>The following items are <strong>non-returnable</strong>:</p>
<ul>
  <li>Personalised or custom-made items.</li>
  <li>Intimates, swimwear, and pierced jewellery (for hygiene reasons).</li>
  <li>Digital downloads and gift cards.</li>
  <li>Items marked as Final Sale.</li>
</ul>

<h2>How to Return</h2>
<ol>
  <li>Log in to your account and navigate to <strong>My Orders</strong>.</li>
  <li>Select the item(s) you wish to return and click <em>Request Return</em>.</li>
  <li>Select your reason for return.</li>
  <li>We will email you a prepaid returns label within 24 hours.</li>
  <li>Package the item securely and drop it off at any designated carrier point.</li>
</ol>

<h2>Refunds</h2>
<p>Once we have received and inspected your return (within 3–5 business days of arrival), we will issue your refund to the original payment method. Please allow a further 5–10 business days for the funds to appear on your statement, depending on your bank.</p>

<h2>Exchanges</h2>
<p>If you would like a different size or colour, select <em>Exchange</em> when submitting your return request. The replacement item will be dispatched as soon as we receive your return.</p>

<h2>Faulty or Incorrect Items</h2>
<p>If you receive a faulty or incorrect item, please contact us at <a href="mailto:support@example.com">support@example.com</a> within 48 hours of receipt. We will cover return shipping and dispatch a replacement or issue a full refund immediately, no need to wait for the return to arrive.</p>

<h2>Contact</h2>
<p>For return queries: <a href="mailto:returns@example.com">returns@example.com</a></p>
HTML;
    }

    private function cookiePolicyHtml(): string
    {
        return <<<'HTML'
<h1>Cookie Policy</h1>
<p><em>Last updated: February 2026</em></p>

<p>This Cookie Policy explains how we use cookies and similar tracking technologies on our website, in accordance with the EU ePrivacy Directive and GDPR.</p>

<h2>What Are Cookies?</h2>
<p>Cookies are small text files placed on your device by a website. They allow the site to remember your preferences and actions over time, improving your experience.</p>

<h2>Types of Cookies We Use</h2>

<h3>Strictly Necessary Cookies</h3>
<p>These cookies are essential for the website to function and cannot be disabled. They include session cookies that maintain your login state, your shopping cart contents, and security tokens (CSRF protection).</p>
<p><em>Legal basis: Legitimate interest / contract performance</em></p>

<h3>Preference / Functional Cookies</h3>
<p>These remember your choices (e.g., language, currency, theme) and persist across sessions to avoid you having to reconfigure them each visit.</p>
<p><em>Legal basis: Consent</em></p>

<h3>Analytics Cookies</h3>
<p>We use analytics tools (e.g., a self-hosted Plausible or Matomo instance) to understand how visitors use our site — which pages are popular, where users drop off, and how to improve the experience. No personally identifiable information is sent to third parties.</p>
<p><em>Legal basis: Consent</em></p>

<h3>Marketing / Advertising Cookies</h3>
<p>If you have consented, we may set advertising cookies to show you relevant ads on third-party platforms. You can opt out at any time via our cookie banner.</p>
<p><em>Legal basis: Consent</em></p>

<h2>Third-Party Cookies</h2>
<p>Some features on our site embed content from third parties (e.g., YouTube videos, social media widgets). These third parties may set their own cookies. We have no control over third-party cookies and recommend reviewing their respective privacy policies.</p>

<h2>How to Manage Cookies</h2>
<p>You can manage your cookie preferences at any time:</p>
<ul>
  <li><strong>Cookie banner:</strong> Click "Cookie Settings" in the footer to update your consent choices.</li>
  <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies via their privacy settings.</li>
  <li><strong>Opt-out tools:</strong> Visit <a href="https://youronlinechoices.eu" target="_blank" rel="noopener">youronlinechoices.eu</a> for advertising opt-outs.</li>
</ul>
<p>Please note that disabling certain cookies may affect website functionality.</p>

<h2>Cookie List</h2>
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Duration</th><th>Purpose</th></tr>
  </thead>
  <tbody>
    <tr><td>auth_token</td><td>Strictly Necessary</td><td>7 days</td><td>Keeps you logged in securely</td></tr>
    <tr><td>cart_token</td><td>Strictly Necessary</td><td>30 days</td><td>Persists your shopping cart</td></tr>
    <tr><td>XSRF-TOKEN</td><td>Strictly Necessary</td><td>Session</td><td>CSRF protection</td></tr>
    <tr><td>currency</td><td>Preference</td><td>1 year</td><td>Remembers your preferred currency</td></tr>
    <tr><td>locale</td><td>Preference</td><td>1 year</td><td>Remembers your language preference</td></tr>
    <tr><td>_analytics</td><td>Analytics</td><td>1 year</td><td>Tracks anonymous page views</td></tr>
    <tr><td>cookie_consent</td><td>Strictly Necessary</td><td>1 year</td><td>Stores your cookie consent choices</td></tr>
  </tbody>
</table>

<h2>Contact</h2>
<p>If you have questions about our use of cookies, contact us at <a href="mailto:privacy@example.com">privacy@example.com</a>.</p>
HTML;
    }
}
