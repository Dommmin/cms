<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BlockRelation;
use App\Models\BlogPost;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Faq;
use App\Models\Form;
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
            ['question' => 'How do I place an order?', 'answer' => '<p>Simply browse our catalogue, add items to your cart, and proceed to checkout. You can pay by card, PayPal, or bank transfer.</p>', 'category' => 'orders', 'position' => 1],
            ['question' => 'Can I modify or cancel my order?', 'answer' => '<p>Orders can be modified or cancelled within 1 hour of placement. After that the order enters fulfilment and cannot be changed. Contact support as quickly as possible.</p>', 'category' => 'orders', 'position' => 2],
            ['question' => 'How do I track my order?', 'answer' => '<p>Once your order ships you will receive an email with a tracking number. You can also check the status in <strong>My Account → Orders</strong>.</p>', 'category' => 'orders', 'position' => 3],
            ['question' => 'Do you offer gift wrapping?', 'answer' => '<p>Yes! During checkout you can add a gift-wrap option for a small fee and include a personalised message card.</p>', 'category' => 'orders', 'position' => 4],
            ['question' => 'How long does delivery take?', 'answer' => '<p>Standard shipping takes 3–5 business days. Express shipping (1–2 business days) is available at checkout for an additional fee.</p>', 'category' => 'shipping', 'position' => 1],
            ['question' => 'Do you ship internationally?', 'answer' => '<p>We currently ship to the EU, UK, USA, and Canada. International orders may be subject to customs duties which are the buyer\'s responsibility.</p>', 'category' => 'shipping', 'position' => 2],
            ['question' => 'Is free shipping available?', 'answer' => '<p>Free standard shipping is available on all orders over €75 within the EU.</p>', 'category' => 'shipping', 'position' => 3],
            ['question' => 'What is your return policy?', 'answer' => '<p>We offer a 30-day return window from the date of delivery. Items must be unused, in original packaging, and accompanied by a receipt.</p>', 'category' => 'returns', 'position' => 1],
            ['question' => 'How do I start a return?', 'answer' => '<p>Log in to your account, navigate to <strong>My Orders</strong>, select the item, and click <em>Request Return</em>. We\'ll email you a prepaid label within 24 hours.</p>', 'category' => 'returns', 'position' => 2],
            ['question' => 'When will I receive my refund?', 'answer' => '<p>Refunds are processed within 3–5 business days of us receiving the returned item. The credit may take a further 5–10 days to appear on your statement depending on your bank.</p>', 'category' => 'returns', 'position' => 3],
            ['question' => 'Can I exchange an item?', 'answer' => '<p>Yes. When submitting a return request, select <em>Exchange</em> and choose the replacement size or colour. We\'ll ship the new item as soon as we receive your return.</p>', 'category' => 'returns', 'position' => 4],
            ['question' => 'What payment methods do you accept?', 'answer' => '<p>We accept Visa, Mastercard, American Express, PayPal, Apple Pay, and Google Pay. All transactions are secured with 256-bit SSL encryption.</p>', 'category' => 'payments', 'position' => 1],
            ['question' => 'Is my payment information secure?', 'answer' => '<p>Absolutely. We never store card details. Payments are processed by a PCI-DSS Level 1 certified payment processor.</p>', 'category' => 'payments', 'position' => 2],
            ['question' => 'Can I pay in instalments?', 'answer' => '<p>Yes, we offer 0% instalment plans through Klarna for eligible orders over €100. Select Klarna at checkout to see your options.</p>', 'category' => 'payments', 'position' => 3],
            ['question' => 'How do I find the right size?', 'answer' => '<p>Each product page includes a detailed size guide. If you are between sizes, we recommend sizing up for a relaxed fit or sizing down for a tailored fit.</p>', 'category' => 'products', 'position' => 1],
            ['question' => 'Are your products ethically made?', 'answer' => '<p>We partner only with suppliers who meet our ethical manufacturing standards, including fair wages and safe working conditions. Many of our products are certified organic or recycled.</p>', 'category' => 'products', 'position' => 2],
            ['question' => 'Do you restock sold-out items?', 'answer' => '<p>Popular items are usually restocked within 4–6 weeks. Click the <em>Notify me</em> button on the product page and we\'ll email you as soon as it\'s back.</p>', 'category' => 'products', 'position' => 3],
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
    // HOMEPAGE  –  Full showcase of all new block types
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

        $page->allSections()->delete();

        $pos = 1;

        // ── 1 · Hero Banner ─────────────────────────────────────────────────
        $s = $this->section($page, 'hero', 'full-width', 'dark', [], $pos++);
        $this->block($page, $s, 'hero_banner', [
            'title' => 'Style Meets Substance',
            'subtitle' => 'Curated fashion, home décor and lifestyle essentials — crafted to last and designed to inspire.',
            'cta_text' => 'Shop Now',
            'cta_url' => '/products',
            'cta_style' => 'primary',
            'cta2_text' => 'Explore Collections',
            'cta2_url' => '/categories',
            'cta2_style' => 'outline',
            'overlay_opacity' => 45,
            'text_alignment' => 'center',
            'min_height' => 620,
        ], 1);

        // ── 2 · Trust Badges ─────────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'muted', ['padding' => 'md', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'trust_badges', [
            'style' => 'row',
            'badges' => [
                ['icon' => 'truck', 'label' => 'Free Shipping', 'sublabel' => 'On orders over €75'],
                ['icon' => 'return', 'label' => '30-Day Returns', 'sublabel' => 'Hassle-free returns'],
                ['icon' => 'lock', 'label' => 'Secure Payments', 'sublabel' => '256-bit SSL encryption'],
                ['icon' => 'award', 'label' => 'Premium Quality', 'sublabel' => 'Ethically sourced'],
                ['icon' => 'users', 'label' => '12,000+ Customers', 'sublabel' => 'Trusted worldwide'],
            ],
        ], 1);

        // ── 3 · Brands Slider ───────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'full-width', 'light', ['padding' => 'md', 'animation' => 'fade-in'], $pos++);
        $brandsBlock = $this->block($page, $s, 'brands_slider', [
            'title' => 'Our Featured Brands',
            'source' => 'all',
            'speed' => 'normal',
            'logo_height' => 44,
            'grayscale' => true,
        ], 1);
        $this->attachBrands($brandsBlock);

        // ── 4 · Stats Counter ───────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'stats_counter', [
            'title' => 'Numbers That Speak for Themselves',
            'subtitle' => 'Built on trust, driven by quality.',
            'style' => 'plain',
            'columns' => 4,
            'animate_numbers' => true,
            'stats' => [
                ['value' => '12000', 'suffix' => '+', 'label' => 'Happy Customers', 'icon' => 'users'],
                ['value' => '98', 'suffix' => '%', 'label' => 'Satisfaction Rate', 'icon' => 'star'],
                ['value' => '50', 'suffix' => '+', 'label' => 'Curated Brands', 'icon' => 'award'],
                ['value' => '30', 'suffix' => '', 'label' => 'Day Return Policy', 'icon' => 'shield'],
            ],
        ], 1);

        // ── 5 · Categories Grid ─────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'muted', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $catBlock = $this->block($page, $s, 'categories_grid', [
            'title' => 'Shop by Category',
            'subtitle' => 'Find exactly what you\'re looking for',
            'columns' => 4,
            'show_title' => true,
        ], 1);
        $topCats = Category::whereNull('parent_id')->orderBy('position')->take(4)->get();
        foreach ($topCats as $i => $cat) {
            BlockRelation::updateOrCreate(
                ['page_block_id' => $catBlock->id, 'relation_type' => 'category', 'relation_id' => $cat->id],
                ['relation_key' => 'categories', 'position' => $i + 1, 'metadata' => []]
            );
        }

        // ── 6 · How It Works ────────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'steps_process', [
            'title' => 'How It Works',
            'subtitle' => 'Shopping with us is simple, transparent, and enjoyable.',
            'layout' => 'horizontal',
            'steps' => [
                ['title' => 'Browse & Discover', 'description' => 'Explore hundreds of curated products across fashion, home, beauty, and sport.'],
                ['title' => 'Add to Cart', 'description' => 'Select your size, colour, and quantity. Save favourites to your wishlist.'],
                ['title' => 'Fast Secure Checkout', 'description' => 'Pay your way — card, PayPal, Apple Pay or BLIK. SSL-encrypted every time.'],
                ['title' => 'Delivered to You', 'description' => 'Tracked shipping in 3–5 days. Free on orders over €75.'],
            ],
        ], 1);

        // ── 7 · Featured Products (Bestsellers) ─────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'muted', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $featBlock = $this->block($page, $s, 'featured_products', [
            'title' => 'Bestsellers',
            'subtitle' => 'Our most-loved pieces, chosen by the community',
            'columns' => 4,
            'view_all_url' => '/products',
            'view_all_label' => 'View all products',
        ], 1);
        $bestsellers = Product::whereHas('flags', fn ($q) => $q->where('name', 'Bestseller'))->take(8)->get();
        if ($bestsellers->isEmpty()) {
            $bestsellers = Product::orderBy('id')->take(8)->get();
        }
        foreach ($bestsellers as $i => $product) {
            BlockRelation::updateOrCreate(
                ['page_block_id' => $featBlock->id, 'relation_type' => 'product', 'relation_id' => $product->id],
                ['relation_key' => 'products', 'position' => $i + 1, 'metadata' => []]
            );
        }

        // ── 8 · Why Choose Us (Icon List) ───────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-left'], $pos++);
        $this->block($page, $s, 'icon_list', [
            'title' => 'Why Thousands Choose Us',
            'subtitle' => 'We\'ve built every part of our service around what matters most to you.',
            'columns' => 2,
            'style' => 'horizontal',
            'items' => [
                ['icon' => 'leaf', 'title' => 'Ethically Sourced', 'description' => 'Every brand in our network is audited annually for fair wages, safe conditions, and sustainable sourcing practices.'],
                ['icon' => 'award', 'title' => 'Curated Quality', 'description' => 'Our team hand-picks each product. If it doesn\'t meet our standards for materials and craftsmanship, it doesn\'t make the cut.'],
                ['icon' => 'truck', 'title' => 'Fast & Free Shipping', 'description' => 'Free tracked delivery on all orders over €75. Orders placed before 1 PM are dispatched the same day.'],
                ['icon' => 'return', 'title' => 'Easy 30-Day Returns', 'description' => 'Changed your mind? No problem. Return anything within 30 days for a full refund, no questions asked.'],
                ['icon' => 'lock', 'title' => 'Bank-Grade Security', 'description' => 'Your payment data is protected by 256-bit SSL encryption and processed by a PCI-DSS Level 1 provider.'],
                ['icon' => 'users', 'title' => 'Dedicated Support', 'description' => 'Real humans available Monday–Friday 9–17. Average response time under 2 hours.'],
            ],
        ], 1);

        // ── 9 · Promotional CTA Banner ──────────────────────────────────────
        $s = $this->section($page, 'banner', 'full-width', 'dark', ['padding' => 'xl', 'animation' => 'zoom-in'], $pos++);
        $this->block($page, $s, 'call_to_action', [
            'title' => 'New Season. New Arrivals.',
            'subtitle' => 'Up to 40% off selected styles — this weekend only. Fresh drops across fashion, home, and beauty.',
            'alignment' => 'center',
            'style' => 'gradient',
            'badge_text' => '🔥 Weekend Flash Sale',
            'primary_label' => 'Shop the Sale',
            'primary_url' => '/sale',
            'secondary_label' => 'View New Arrivals',
            'secondary_url' => '/new-arrivals',
        ], 1);

        // ── 10 · Testimonials ───────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'muted', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'testimonials', [
            'title' => 'What Our Customers Say',
            'subtitle' => 'Over 12,000 satisfied customers and counting.',
            'layout' => 'grid',
            'columns' => 2,
            'items' => [
                [
                    'name' => 'Anna K.',
                    'rating' => 5,
                    'text' => 'Absolutely love the quality. The fabric on my new jacket is buttery soft and the fit is perfect. Delivery was faster than expected — will definitely be ordering again!',
                    'location' => 'Warsaw, Poland',
                ],
                [
                    'name' => 'Marcus T.',
                    'rating' => 5,
                    'text' => 'The packaging was beautiful and the candle set I ordered smells incredible. Perfect gift. Arrived in 2 days — seriously impressive.',
                    'location' => 'Berlin, Germany',
                ],
                [
                    'name' => 'Sophie R.',
                    'rating' => 5,
                    'text' => 'I was hesitant to buy shoes online but the size guide was spot on. They arrived exactly as pictured. Stunning craftsmanship — you can feel the quality.',
                    'location' => 'Paris, France',
                ],
                [
                    'name' => 'Liam O.',
                    'rating' => 5,
                    'text' => 'Great customer service when I needed to exchange a size. The process was seamless and the team replied within an hour. Exceptional all around.',
                    'location' => 'Dublin, Ireland',
                ],
            ],
        ], 1);

        // ── 11 · Featured Posts ─────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $postsBlock = $this->block($page, $s, 'featured_posts', [
            'title' => 'From the Journal',
            'subtitle' => 'Style guides, sustainability stories, and maker spotlights.',
            'source' => 'latest',
            'max_items' => 3,
            'columns' => 3,
            'display_mode' => 'card',
            'show_excerpt' => true,
            'show_date' => true,
            'show_author' => false,
            'cta_text' => 'Read all articles',
            'cta_url' => '/blog',
        ], 1);
        $latestPosts = BlogPost::published()->orderByDesc('published_at')->take(3)->get();
        foreach ($latestPosts as $i => $post) {
            BlockRelation::updateOrCreate(
                ['page_block_id' => $postsBlock->id, 'relation_type' => 'blog_post', 'relation_id' => $post->id],
                ['relation_key' => 'posts', 'position' => $i + 1, 'metadata' => []]
            );
        }

        // ── 12 · Countdown Timer (Flash Sale) ───────────────────────────────
        $saleEnd = now()->addDays(3)->setTime(23, 59, 0)->toIso8601String();
        $s = $this->section($page, 'banner', 'full-width', 'dark', ['padding' => 'xl', 'animation' => 'zoom-in'], $pos++);
        $this->block($page, $s, 'countdown_timer', [
            'title' => '⚡ Flash Sale — Ends In',
            'subtitle' => 'Up to 50% off selected items. Limited stock, limited time.',
            'target_date' => $saleEnd,
            'show_labels' => true,
            'expired_message' => 'This sale has ended. Check back for our next event!',
            'cta_label' => 'Shop Sale Now',
            'cta_url' => '/sale',
            'style' => 'dark',
        ], 1);

        // ── 13 · Newsletter Signup ──────────────────────────────────────────
        $s = $this->section($page, 'banner', 'full-width', 'brand', ['padding' => 'xl'], $pos++);
        $this->block($page, $s, 'newsletter_signup', [
            'title' => 'Join the Inner Circle',
            'subtitle' => 'Get early access to new drops, exclusive offers, and style inspiration — straight to your inbox.',
            'placeholder' => 'Enter your email address',
            'button_label' => 'Subscribe Free',
            'success_message' => 'Welcome aboard! Check your inbox for a 10% discount code.',
            'gdpr_note' => 'By subscribing you agree to our Privacy Policy. Unsubscribe at any time.',
        ], 1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ABOUT US  –  full use of Timeline, Team, Stats, Pricing
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
                'seo_description' => 'Learn about our mission to bring thoughtfully designed, ethically made products to everyday life.',
            ]
        );

        $page->allSections()->delete();
        $pos = 1;

        // ── 1 · Hero ─────────────────────────────────────────────────────────
        $s = $this->section($page, 'hero', 'full-width', 'dark', [], $pos++);
        $this->block($page, $s, 'hero_banner', [
            'title' => 'Made with Intention',
            'subtitle' => 'We believe great design should be accessible to everyone — without compromising on ethics or the planet.',
            'cta_text' => 'Our Story',
            'cta_url' => '#story',
            'cta_style' => 'primary',
            'cta2_text' => 'View Brands',
            'cta2_url' => '/brands',
            'cta2_style' => 'outline',
            'overlay_opacity' => 50,
            'text_alignment' => 'center',
            'min_height' => 480,
        ], 1);

        // ── 2 · Stats ────────────────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'stats_counter', [
            'style' => 'card',
            'columns' => 4,
            'animate_numbers' => true,
            'stats' => [
                ['value' => '2020', 'suffix' => '', 'label' => 'Founded'],
                ['value' => '50', 'suffix' => '+', 'label' => 'Partner Brands'],
                ['value' => '12000', 'suffix' => '+', 'label' => 'Customers Worldwide'],
                ['value' => '70', 'suffix' => '%', 'label' => 'Sustainable Materials'],
            ],
        ], 1);

        // ── 3 · Our Story (Rich Text) ────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'muted', ['padding' => 'xl', 'animation' => 'fade-left'], $pos++);
        $this->block($page, $s, 'rich_text', [
            'content' => '<h2>Our Story</h2><p>Founded in 2020, we started with a simple belief: everyday products should be both beautiful and built to last. We were frustrated by disposable fashion and mass-produced home goods that fell apart after a season.</p><p>So we set out to curate collections from artisan makers and ethical manufacturers who share our commitment to quality, sustainability, and fair practices. Today we partner with over 50 suppliers across Europe and beyond — each carefully selected for their craftsmanship and values.</p><p>Every product in our catalogue has been touched by human hands with care. We think you can feel the difference.</p>',
            'max_width' => '3xl',
            'text_align' => 'left',
        ], 1);

        // ── 4 · Values (Icon List) ───────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'icon_list', [
            'title' => 'What We Stand For',
            'subtitle' => 'Three principles guide every decision we make.',
            'columns' => 3,
            'style' => 'centered',
            'items' => [
                ['icon' => 'leaf', 'title' => 'Sustainability', 'description' => 'Over 70% of our products use recycled, organic, or responsibly sourced materials. We\'re on a path to full carbon neutrality by 2027.'],
                ['icon' => 'heart', 'title' => 'Fair Trade', 'description' => 'Every supplier in our network is audited annually for fair wages, safe conditions, and ethical sourcing practices.'],
                ['icon' => 'award', 'title' => 'Lasting Quality', 'description' => 'We design for longevity, not obsolescence. Our products come with extended warranties and repair programmes.'],
            ],
        ], 1);

        // ── 5 · Timeline ─────────────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'muted', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'timeline', [
            'title' => 'Our Journey',
            'subtitle' => 'From a small apartment to 12,000 happy customers.',
            'layout' => 'left',
            'items' => [
                ['date' => '2020', 'title' => 'Founded', 'description' => 'Started from a home office with 3 partner brands and a vision: make quality accessible without compromising ethics.'],
                ['date' => '2021', 'title' => 'First 1,000 Customers', 'description' => 'Grew to 15 brands and hit our first 1,000 orders milestone. Moved to a proper warehouse and hired our first team members.'],
                ['date' => '2022', 'title' => 'Sustainability Pledge', 'description' => 'Launched our sustainability audit programme. All new partners must meet our ethical sourcing criteria to join.'],
                ['date' => '2023', 'title' => 'European Expansion', 'description' => 'Opened shipping to 12 European countries. Launched Polish-language site and partnered with local artisan brands.'],
                ['date' => '2024', 'title' => '10,000 Customers', 'description' => 'Crossed the 10,000 customer milestone. Introduced our repair programme — extending the life of the products we sell.'],
                ['date' => '2025', 'title' => 'New Platform', 'description' => 'Rebuilt our entire digital experience to be faster, more personal, and truly accessible across all devices.'],
            ],
        ], 1);

        // ── 6 · Team Members ─────────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'team_members', [
            'title' => 'The People Behind the Brand',
            'subtitle' => 'Small team, big passion for quality and sustainability.',
            'columns' => 4,
            'members' => [
                ['name' => 'Marta Kowalska', 'role' => 'Founder & CEO', 'bio' => 'Former fashion buyer with 10 years at major European retailers. Started the brand after one too many fast-fashion frustrations.'],
                ['name' => 'James Chen', 'role' => 'Head of Product', 'bio' => 'Industrial designer turned product curator. Obsessed with materials, construction, and the story behind every object.'],
                ['name' => 'Aleksandra Nowak', 'role' => 'Sustainability Lead', 'bio' => 'MSc in Environmental Management. Audits all supplier relationships and drives our carbon reduction roadmap.'],
                ['name' => 'Tom Bauer', 'role' => 'Customer Experience', 'bio' => 'Believes every support interaction is a brand moment. Leads a team that maintains our sub-2h response SLA.'],
            ],
        ], 1);

        // ── 7 · CTA ──────────────────────────────────────────────────────────
        $s = $this->section($page, 'banner', 'full-width', 'dark', ['padding' => 'xl', 'animation' => 'zoom-in'], $pos++);
        $this->block($page, $s, 'call_to_action', [
            'title' => 'Shop Our Collections',
            'subtitle' => 'Every purchase supports the artisans behind our products and moves us closer to a more sustainable future.',
            'alignment' => 'center',
            'style' => 'gradient',
            'primary_label' => 'Browse All Products',
            'primary_url' => '/products',
            'secondary_label' => 'Meet Our Brands',
            'secondary_url' => '/brands',
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
            $p = Page::updateOrCreate(
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
            $p->allSections()->delete();
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
    // SHIPPING / RETURN / COOKIE POLICY
    // ─────────────────────────────────────────────────────────────────────────

    private function seedShippingPage(): void
    {
        $p = Page::updateOrCreate(
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
        $p->allSections()->delete();
    }

    private function seedReturnPolicyPage(): void
    {
        $p = Page::updateOrCreate(
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
        $p->allSections()->delete();
    }

    private function seedCookiePolicyPage(): void
    {
        $p = Page::updateOrCreate(
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
        $p->allSections()->delete();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CONTACT PAGE
    // ─────────────────────────────────────────────────────────────────────────

    private function seedContactPage(): void
    {
        $contactForm = Form::query()->where('slug', 'contact')->first();

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
                'seo_description' => 'Have a question or need help? Reach out and we\'ll get back to you within 1–2 business days.',
            ]
        );

        $page->allSections()->delete();
        $pos = 1;

        // Hero
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl'], $pos++);
        $this->block($page, $s, 'rich_text', [
            'content' => '<h1 style="text-align:center">Contact Us</h1><p style="text-align:center;max-width:640px;margin:0 auto">Have a question or need help? We\'d love to hear from you. Fill out the form below and we\'ll get back to you within 1–2 business days.</p>',
        ], 1);

        // Trust badges
        $s = $this->section($page, 'standard', 'contained', 'muted', ['padding' => 'md', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'trust_badges', [
            'style' => 'minimal',
            'badges' => [
                ['icon' => 'clock', 'label' => 'Reply within 2 hours'],
                ['icon' => 'users', 'label' => 'Real humans, no bots'],
                ['icon' => 'phone', 'label' => 'Mon–Fri 9–17 CET'],
                ['icon' => 'mail', 'label' => 'support@example.com'],
            ],
        ], 1);

        // Contact Form
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $formBlock = $this->block($page, $s, 'form_embed', [
            'title' => 'Send Us a Message',
            'description' => 'We typically respond within 2 hours during business hours.',
        ], 1);
        if ($contactForm) {
            BlockRelation::updateOrCreate(
                ['page_block_id' => $formBlock->id, 'relation_type' => 'form', 'relation_id' => $contactForm->id],
                ['relation_key' => 'form', 'position' => 1, 'metadata' => []]
            );
        }

        // Map
        $s = $this->section($page, 'standard', 'flush', 'light', ['padding' => 'none', 'animation' => 'fade-in'], $pos++);
        $this->block($page, $s, 'map', [
            'title' => 'Our Office',
            'lat' => 52.229676,
            'lng' => 21.012229,
            'zoom' => 14,
            'height' => 400,
        ], 1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private function section(
        Page $page,
        string $type,
        string $layout,
        ?string $variant,
        array $settings,
        int $position
    ): PageSection {
        return PageSection::create([
            'page_id' => $page->id,
            'section_type' => $type,
            'layout' => $layout,
            'variant' => $variant,
            'settings' => $settings ?: null,
            'position' => $position,
            'is_active' => true,
        ]);
    }

    private function block(
        Page $page,
        PageSection $section,
        string $type,
        array $configuration,
        int $position
    ): PageBlock {
        return PageBlock::create([
            'page_id' => $page->id,
            'section_id' => $section->id,
            'type' => $type,
            'configuration' => $configuration,
            'position' => $position,
            'is_active' => true,
        ]);
    }

    /** Attach all active brands to a block as 'brands' relations */
    private function attachBrands(PageBlock $block): void
    {
        $brands = Brand::where('is_active', true)->orderBy('position')->get();
        foreach ($brands as $i => $brand) {
            BlockRelation::updateOrCreate(
                ['page_block_id' => $block->id, 'relation_type' => 'brand', 'relation_id' => $brand->id],
                ['relation_key' => 'brands', 'position' => $i + 1, 'metadata' => []]
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LEGAL HTML CONTENT (unchanged)
    // ─────────────────────────────────────────────────────────────────────────

    private function privacyPolicyHtml(): string
    {
        return <<<'HTML'
<h1>Privacy Policy</h1>
<p><em>Last updated: February 2026</em></p>
<p>We are committed to protecting your personal data and your right to privacy.</p>
<h2>1. Data Controller</h2>
<p>Contact us at <a href="mailto:privacy@example.com">privacy@example.com</a>.</p>
<h2>2. Information We Collect</h2>
<ul>
  <li><strong>Account data:</strong> name, email, password (hashed).</li>
  <li><strong>Order data:</strong> billing/delivery address, order history, payment method (last 4 digits only).</li>
  <li><strong>Usage data:</strong> IP address, browser type, pages visited (via cookies).</li>
</ul>
<h2>3. Legal Basis</h2>
<ul>
  <li><strong>Contract performance</strong> — to fulfil orders.</li>
  <li><strong>Legitimate interests</strong> — to improve services and prevent fraud.</li>
  <li><strong>Consent</strong> — for marketing emails and non-essential cookies.</li>
  <li><strong>Legal obligation</strong> — compliance with applicable law.</li>
</ul>
<h2>4. Your Rights</h2>
<p>Under GDPR you may access, rectify, erase, or port your data, and withdraw consent at any time. Contact <a href="mailto:privacy@example.com">privacy@example.com</a>.</p>
<h2>5. Retention</h2>
<p>Order records are kept 7 years for legal compliance. Account data is deleted on request.</p>
HTML;
    }

    private function termsOfServiceHtml(): string
    {
        return <<<'HTML'
<h1>Terms of Service</h1>
<p><em>Last updated: February 2026</em></p>
<p>By placing an order you agree to these terms.</p>
<h2>1. Orders</h2>
<p>A binding contract forms when we send an order confirmation. We reserve the right to cancel orders due to pricing errors or stock issues (full refund issued).</p>
<h2>2. Pricing</h2>
<p>Prices include VAT where applicable. The price at order confirmation is final.</p>
<h2>3. Returns</h2>
<p>You have 30 days from delivery to return unused items. See our Return Policy for details.</p>
<h2>4. Governing Law</h2>
<p>These terms are governed by Polish law. Disputes are subject to the courts of Warsaw.</p>
HTML;
    }

    private function shippingPolicyHtml(): string
    {
        return <<<'HTML'
<h1>Shipping Policy</h1>
<p><em>Last updated: February 2026</em></p>
<h2>Standard Shipping</h2>
<ul><li>3–5 business days (EU) — €4.99 / <strong>Free over €75</strong></li></ul>
<h2>Express Shipping</h2>
<ul><li>1–2 business days (EU) — €12.99</li></ul>
<h2>International</h2>
<ul>
  <li>UK: 4–7 days — €9.99</li>
  <li>USA / Canada: 7–14 days — €19.99</li>
</ul>
<h2>Tracking</h2>
<p>A tracking number is emailed when your order ships. Allow 24 h for tracking to activate.</p>
HTML;
    }

    private function returnPolicyHtml(): string
    {
        return <<<'HTML'
<h1>Return &amp; Refund Policy</h1>
<p><em>Last updated: February 2026</em></p>
<p><strong>30-day</strong> return window from delivery date.</p>
<h2>Eligibility</h2>
<ul>
  <li>Unused, in original packaging with tags attached.</li>
  <li>Non-returnable: intimates, personalised items, digital downloads.</li>
</ul>
<h2>How to Return</h2>
<ol>
  <li>Log in → My Orders → Request Return.</li>
  <li>Prepaid label emailed within 24 h.</li>
  <li>Refund processed within 3–5 days of receiving the return.</li>
</ol>
HTML;
    }

    private function cookiePolicyHtml(): string
    {
        return <<<'HTML'
<h1>Cookie Policy</h1>
<p><em>Last updated: February 2026</em></p>
<h2>Types of Cookies</h2>
<ul>
  <li><strong>Strictly Necessary</strong> — session, cart, CSRF. Cannot be disabled.</li>
  <li><strong>Preference</strong> — language, currency, theme. Legal basis: Consent.</li>
  <li><strong>Analytics</strong> — anonymous page-view tracking. Legal basis: Consent.</li>
  <li><strong>Marketing</strong> — advertising personalisation. Legal basis: Consent.</li>
</ul>
<h2>Managing Cookies</h2>
<p>Use the cookie banner in the footer to update your preferences at any time.</p>
HTML;
    }
}
