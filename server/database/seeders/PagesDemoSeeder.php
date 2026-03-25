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
        // Polish locale site
        $this->seedPolishHomepage();
        $this->seedPolishAboutPage();
        $this->seedPolishLegalPages();
        $this->seedPolishFaqPage();
        $this->seedPolishShippingPage();
        $this->seedPolishReturnPolicyPage();
        $this->seedPolishCookiePolicyPage();
        $this->seedPolishContactPage();
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
            ['question' => 'Do you ship internationally?', 'answer' => "<p>We currently ship to the EU, UK, USA, and Canada. International orders may be subject to customs duties which are the buyer's responsibility.</p>", 'category' => 'shipping', 'position' => 2],
            ['question' => 'Is free shipping available?', 'answer' => '<p>Free standard shipping is available on all orders over €75 within the EU.</p>', 'category' => 'shipping', 'position' => 3],
            ['question' => 'What is your return policy?', 'answer' => '<p>We offer a 30-day return window from the date of delivery. Items must be unused, in original packaging, and accompanied by a receipt.</p>', 'category' => 'returns', 'position' => 1],
            ['question' => 'How do I start a return?', 'answer' => "<p>Log in to your account, navigate to <strong>My Orders</strong>, select the item, and click <em>Request Return</em>. We'll email you a prepaid label within 24 hours.</p>", 'category' => 'returns', 'position' => 2],
            ['question' => 'When will I receive my refund?', 'answer' => '<p>Refunds are processed within 3–5 business days of us receiving the returned item. The credit may take a further 5–10 days to appear on your statement depending on your bank.</p>', 'category' => 'returns', 'position' => 3],
            ['question' => 'Can I exchange an item?', 'answer' => "<p>Yes. When submitting a return request, select <em>Exchange</em> and choose the replacement size or colour. We'll ship the new item as soon as we receive your return.</p>", 'category' => 'returns', 'position' => 4],
            ['question' => 'What payment methods do you accept?', 'answer' => '<p>We accept Visa, Mastercard, American Express, PayPal, Apple Pay, and Google Pay. All transactions are secured with 256-bit SSL encryption.</p>', 'category' => 'payments', 'position' => 1],
            ['question' => 'Is my payment information secure?', 'answer' => '<p>Absolutely. We never store card details. Payments are processed by a PCI-DSS Level 1 certified payment processor.</p>', 'category' => 'payments', 'position' => 2],
            ['question' => 'Can I pay in instalments?', 'answer' => '<p>Yes, we offer 0% instalment plans through Klarna for eligible orders over €100. Select Klarna at checkout to see your options.</p>', 'category' => 'payments', 'position' => 3],
            ['question' => 'How do I find the right size?', 'answer' => '<p>Each product page includes a detailed size guide. If you are between sizes, we recommend sizing up for a relaxed fit or sizing down for a tailored fit.</p>', 'category' => 'products', 'position' => 1],
            ['question' => 'Are your products ethically made?', 'answer' => '<p>We partner only with suppliers who meet our ethical manufacturing standards, including fair wages and safe working conditions. Many of our products are certified organic or recycled.</p>', 'category' => 'products', 'position' => 2],
            ['question' => 'Do you restock sold-out items?', 'answer' => '<p>Popular items are usually restocked within 4–6 weeks. Click the <em>Notify me</em> button on the product page and we\'ll email you as soon as it\'s back.</p>', 'category' => 'products', 'position' => 3],
            ['question' => 'How do I create an account?', 'answer' => '<p>Click <em>Sign Up</em> at the top of any page, enter your email and a password, and verify your email address. It takes less than a minute.</p>', 'category' => 'account', 'position' => 1],
            ['question' => 'I forgot my password. What should I do?', 'answer' => "<p>Click <em>Forgot password?</em> on the login page and enter your email. We'll send a reset link that is valid for 60 minutes.</p>", 'category' => 'account', 'position' => 2],
            ['question' => 'How do I delete my account?', 'answer' => '<p>You can request account deletion from <strong>Settings → Privacy → Delete Account</strong>. All personal data is permanently removed within 30 days in accordance with GDPR.</p>', 'category' => 'account', 'position' => 3],
        ];

        foreach ($faqs as $faq) {
            Faq::query()->updateOrCreate(['question' => $faq['question']], array_merge($faq, ['is_active' => true]));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HOMEPAGE  –  Full showcase of all new block types
    // ─────────────────────────────────────────────────────────────────────────

    private function seedHomepage(): void
    {
        $page = Page::query()->updateOrCreate(['slug' => 'home'], [
            'parent_id' => null,
            'title' => ['en' => 'Home', 'pl' => 'Strona główna'],
            'slug_translations' => ['pl' => 'strona-glowna'],
            'page_type' => 'blocks',
            'is_published' => true,
            'published_at' => now(),
            'position' => 1,
            'seo_title' => 'Shop the Best Fashion, Home & Lifestyle',
            'seo_description' => 'Discover curated collections of fashion, home décor, beauty, and sportswear. Free shipping on orders over €75.',
        ]);

        $page->allSections()->delete();

        $pos = 1;

        // ── 1 · Hero Banner ─────────────────────────────────────────────────
        $s = $this->section($page, 'hero', 'full-width', 'light', ['padding' => 'none'], $pos++);
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
            'subtitle' => "Find exactly what you're looking for",
            'columns' => 4,
            'show_title' => true,
        ], 1);
        $topCats = Category::query()->whereNull('parent_id')->orderBy('position')->take(4)->get();
        foreach ($topCats as $i => $cat) {
            BlockRelation::query()->updateOrCreate(['page_block_id' => $catBlock->id, 'relation_type' => 'category', 'relation_id' => $cat->id], ['relation_key' => 'categories', 'position' => $i + 1, 'metadata' => []]);
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
        $bestsellers = Product::query()->whereHas('flags', fn ($q) => $q->where('name', 'Bestseller'))->take(8)->get();
        if ($bestsellers->isEmpty()) {
            $bestsellers = Product::query()->orderBy('id')->take(8)->get();
        }

        foreach ($bestsellers as $i => $product) {
            BlockRelation::query()->updateOrCreate(['page_block_id' => $featBlock->id, 'relation_type' => 'product', 'relation_id' => $product->id], ['relation_key' => 'products', 'position' => $i + 1, 'metadata' => []]);
        }

        // ── 8 · Why Choose Us (Icon List) ───────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-left'], $pos++);
        $this->block($page, $s, 'icon_list', [
            'title' => 'Why Thousands Choose Us',
            'subtitle' => "We've built every part of our service around what matters most to you.",
            'columns' => 2,
            'style' => 'horizontal',
            'items' => [
                ['icon' => 'leaf', 'title' => 'Ethically Sourced', 'description' => 'Every brand in our network is audited annually for fair wages, safe conditions, and sustainable sourcing practices.'],
                ['icon' => 'award', 'title' => 'Curated Quality', 'description' => "Our team hand-picks each product. If it doesn't meet our standards for materials and craftsmanship, it doesn't make the cut."],
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
                    'author' => 'Anna K.',
                    'rating' => 5,
                    'content' => 'Absolutely love the quality. The fabric on my new jacket is buttery soft and the fit is perfect. Delivery was faster than expected — will definitely be ordering again!',
                    'role' => 'Warsaw, Poland',
                ],
                [
                    'author' => 'Marcus T.',
                    'rating' => 5,
                    'content' => 'The packaging was beautiful and the candle set I ordered smells incredible. Perfect gift. Arrived in 2 days — seriously impressive.',
                    'role' => 'Berlin, Germany',
                ],
                [
                    'author' => 'Sophie R.',
                    'rating' => 5,
                    'content' => 'I was hesitant to buy shoes online but the size guide was spot on. They arrived exactly as pictured. Stunning craftsmanship — you can feel the quality.',
                    'role' => 'Paris, France',
                ],
                [
                    'author' => 'Liam O.',
                    'rating' => 5,
                    'content' => 'Great customer service when I needed to exchange a size. The process was seamless and the team replied within an hour. Exceptional all around.',
                    'role' => 'Dublin, Ireland',
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
        $latestPosts = BlogPost::query()->published()->orderByDesc('published_at')->take(3)->get();
        foreach ($latestPosts as $i => $post) {
            BlockRelation::query()->updateOrCreate(['page_block_id' => $postsBlock->id, 'relation_type' => 'blog_post', 'relation_id' => $post->id], ['relation_key' => 'posts', 'position' => $i + 1, 'metadata' => []]);
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
        $page = Page::query()->updateOrCreate(['slug' => 'about-us'], [
            'parent_id' => null,
            'title' => ['en' => 'About Us', 'pl' => 'O nas'],
            'slug_translations' => ['pl' => 'o-nas'],
            'page_type' => 'blocks',
            'is_published' => true,
            'published_at' => now(),
            'position' => 10,
            'seo_title' => 'About Us — Our Story & Values',
            'seo_description' => 'Learn about our mission to bring thoughtfully designed, ethically made products to everyday life.',
        ]);

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
                ['icon' => 'leaf', 'title' => 'Sustainability', 'description' => "Over 70% of our products use recycled, organic, or responsibly sourced materials. We're on a path to full carbon neutrality by 2027."],
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
            $p = Page::query()->updateOrCreate(['slug' => $def['slug']], [
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
            ]);
            $p->allSections()->delete();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FAQ PAGE
    // ─────────────────────────────────────────────────────────────────────────

    private function seedFaqPage(): void
    {
        $faqs = Faq::active()->orderBy('category')->orderBy('position')->get();

        $page = Page::query()->updateOrCreate(['slug' => 'faq'], [
            'parent_id' => null,
            'title' => ['en' => 'Frequently Asked Questions', 'pl' => 'Najczęstsze pytania'],
            'slug_translations' => ['pl' => 'faq'],
            'page_type' => 'module',
            'module_name' => 'faq',
            'module_config' => [
                'items' => $faqs->map(fn ($f): array => [
                    'id' => $f->id,
                    'question' => $f->question,
                    'answer' => $f->answer,
                    'category' => $f->category,
                ])->values()->all(),
            ],
            'is_published' => true,
            'published_at' => now(),
            'position' => 30,
            'seo_title' => 'FAQ — Frequently Asked Questions',
            'seo_description' => 'Answers to common questions about ordering, shipping, returns, and more.',
        ]);
        $page->allSections()->delete();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SHIPPING / RETURN / COOKIE POLICY
    // ─────────────────────────────────────────────────────────────────────────

    private function seedShippingPage(): void
    {
        $p = Page::query()->updateOrCreate(['slug' => 'shipping-policy'], [
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
        ]);
        $p->allSections()->delete();
    }

    private function seedReturnPolicyPage(): void
    {
        $p = Page::query()->updateOrCreate(['slug' => 'return-policy'], [
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
        ]);
        $p->allSections()->delete();
    }

    private function seedCookiePolicyPage(): void
    {
        $p = Page::query()->updateOrCreate(['slug' => 'cookie-policy'], [
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
        ]);
        $p->allSections()->delete();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CONTACT PAGE
    // ─────────────────────────────────────────────────────────────────────────

    private function seedContactPage(): void
    {
        $contactForm = Form::query()->where('slug', 'contact')->first();

        $page = Page::query()->updateOrCreate(['slug' => 'contact'], [
            'parent_id' => null,
            'title' => ['en' => 'Contact Us', 'pl' => 'Kontakt'],
            'slug_translations' => ['pl' => 'kontakt'],
            'page_type' => 'blocks',
            'is_published' => true,
            'published_at' => now(),
            'position' => 20,
            'seo_title' => 'Contact Us — We\'d Love to Hear From You',
            'seo_description' => 'Have a question or need help? Reach out and we\'ll get back to you within 1–2 business days.',
        ]);

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
            'form_id' => $contactForm?->id,
        ], 1);
        if ($contactForm) {
            BlockRelation::query()->updateOrCreate(['page_block_id' => $formBlock->id, 'relation_type' => 'form', 'relation_id' => $contactForm->id], ['relation_key' => 'form', 'position' => 1, 'metadata' => []]);
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
    // POLISH LOCALE SITE
    // ─────────────────────────────────────────────────────────────────────────

    private function seedPolishHomepage(): void
    {
        $page = Page::query()->updateOrCreate(['slug' => 'strona-glowna', 'locale' => 'pl'], [
            'parent_id' => null,
            'title' => ['pl' => 'Strona główna', 'en' => 'Home'],
            'page_type' => 'blocks',
            'is_published' => true,
            'published_at' => now(),
            'position' => 1,
            'seo_title' => 'Kupuj modę, dom i lifestyle w najlepszej jakości',
            'seo_description' => 'Odkryj starannie wyselekcjonowane kolekcje mody, dekoracji domu, urody i sportu. Darmowa dostawa od 299 zł.',
        ]);

        $page->allSections()->delete();
        $pos = 1;

        // ── 1 · Hero Banner ─────────────────────────────────────────────────
        $s = $this->section($page, 'hero', 'full-width', 'light', ['padding' => 'none'], $pos++);
        $this->block($page, $s, 'hero_banner', [
            'title' => 'Styl i Jakość w Jednym',
            'subtitle' => 'Starannie wyselekcjonowana moda, dekoracje domu i niezbędniki lifestyle\'owe — stworzone na lata, zaprojektowane z inspiracją.',
            'cta_text' => 'Kup teraz',
            'cta_url' => '/produkty',
            'cta_style' => 'primary',
            'cta2_text' => 'Przeglądaj kolekcje',
            'cta2_url' => '/kategorie',
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
                ['icon' => 'truck', 'label' => 'Darmowa dostawa', 'sublabel' => 'Przy zamówieniach od 299 zł'],
                ['icon' => 'return', 'label' => '30-dniowe zwroty', 'sublabel' => 'Bez zbędnych pytań'],
                ['icon' => 'lock', 'label' => 'Bezpieczne płatności', 'sublabel' => 'Szyfrowanie SSL 256-bit'],
                ['icon' => 'award', 'label' => 'Najwyższa jakość', 'sublabel' => 'Etyczne źródła'],
                ['icon' => 'users', 'label' => '12 000+ klientów', 'sublabel' => 'Zaufanych na całym świecie'],
            ],
        ], 1);

        // ── 3 · Brands Slider ───────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'full-width', 'light', ['padding' => 'md', 'animation' => 'fade-in'], $pos++);
        $brandsBlock = $this->block($page, $s, 'brands_slider', [
            'title' => 'Nasze marki',
            'source' => 'all',
            'speed' => 'normal',
            'logo_height' => 44,
            'grayscale' => true,
        ], 1);
        $this->attachBrands($brandsBlock);

        // ── 4 · Stats Counter ───────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'stats_counter', [
            'title' => 'Liczby mówią same za siebie',
            'subtitle' => 'Zbudowani na zaufaniu, napędzani jakością.',
            'style' => 'plain',
            'columns' => 4,
            'animate_numbers' => true,
            'stats' => [
                ['value' => '12000', 'suffix' => '+', 'label' => 'Zadowolonych klientów', 'icon' => 'users'],
                ['value' => '98', 'suffix' => '%', 'label' => 'Wskaźnik satysfakcji', 'icon' => 'star'],
                ['value' => '50', 'suffix' => '+', 'label' => 'Wyselekcjonowanych marek', 'icon' => 'award'],
                ['value' => '30', 'suffix' => '', 'label' => 'Dni na zwrot towaru', 'icon' => 'shield'],
            ],
        ], 1);

        // ── 5 · Categories Grid ─────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'muted', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $catBlock = $this->block($page, $s, 'categories_grid', [
            'title' => 'Kup według kategorii',
            'subtitle' => 'Znajdź dokładnie to, czego szukasz',
            'columns' => 4,
            'show_title' => true,
        ], 1);
        $topCats = Category::query()->whereNull('parent_id')->orderBy('position')->take(4)->get();
        foreach ($topCats as $i => $cat) {
            BlockRelation::query()->updateOrCreate(['page_block_id' => $catBlock->id, 'relation_type' => 'category', 'relation_id' => $cat->id], ['relation_key' => 'categories', 'position' => $i + 1, 'metadata' => []]);
        }

        // ── 6 · How It Works ────────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'steps_process', [
            'title' => 'Jak to działa?',
            'subtitle' => 'Zakupy u nas są proste, przejrzyste i przyjemne.',
            'layout' => 'horizontal',
            'steps' => [
                ['title' => 'Przeglądaj i odkrywaj', 'description' => 'Setki starannie dobranych produktów z kategorii moda, dom, uroda i sport.'],
                ['title' => 'Dodaj do koszyka', 'description' => 'Wybierz rozmiar, kolor i ilość. Zapisz ulubione na liście życzeń.'],
                ['title' => 'Szybka i bezpieczna płatność', 'description' => 'Płać jak chcesz — kartą, PayPal, BLIK lub Apple Pay. Zawsze z szyfrowaniem SSL.'],
                ['title' => 'Dostarczymy do Ciebie', 'description' => 'Dostawa z śledzeniem w 1–3 dni robocze. Darmowa od 299 zł.'],
            ],
        ], 1);

        // ── 7 · Featured Products (Bestsellers) ─────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'muted', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $featBlock = $this->block($page, $s, 'featured_products', [
            'title' => 'Bestsellery',
            'subtitle' => 'Nasze najpopularniejsze produkty, wybrane przez społeczność',
            'columns' => 4,
            'view_all_url' => '/produkty',
            'view_all_label' => 'Zobacz wszystkie produkty',
        ], 1);
        $bestsellers = Product::query()->whereHas('flags', fn ($q) => $q->where('name', 'Bestseller'))->take(8)->get();
        if ($bestsellers->isEmpty()) {
            $bestsellers = Product::query()->orderBy('id')->take(8)->get();
        }

        foreach ($bestsellers as $i => $product) {
            BlockRelation::query()->updateOrCreate(['page_block_id' => $featBlock->id, 'relation_type' => 'product', 'relation_id' => $product->id], ['relation_key' => 'products', 'position' => $i + 1, 'metadata' => []]);
        }

        // ── 8 · Why Choose Us (Icon List) ───────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-left'], $pos++);
        $this->block($page, $s, 'icon_list', [
            'title' => 'Dlaczego tysiące klientów nam ufa?',
            'subtitle' => 'Każdy element naszej obsługi budujemy wokół tego, co dla Ciebie najważniejsze.',
            'columns' => 2,
            'style' => 'horizontal',
            'items' => [
                ['icon' => 'leaf', 'title' => 'Etyczne źródła', 'description' => 'Każda marka w naszej sieci jest co roku audytowana pod kątem godnych płac, bezpiecznych warunków pracy i zrównoważonych praktyk.'],
                ['icon' => 'award', 'title' => 'Wyselekcjonowana jakość', 'description' => 'Nasz zespół ręcznie dobiera każdy produkt. Jeśli nie spełnia naszych standardów materiałów i wykonania — nie trafia do oferty.'],
                ['icon' => 'truck', 'title' => 'Szybka i darmowa dostawa', 'description' => 'Darmowa dostawa z śledzeniem na wszystkie zamówienia od 299 zł. Zamówienia złożone przed godz. 13:00 wysyłamy tego samego dnia.'],
                ['icon' => 'return', 'title' => 'Łatwe zwroty przez 30 dni', 'description' => 'Zmieniłeś zdanie? Żaden problem. Zwróć towar w ciągu 30 dni i otrzymaj pełny zwrot pieniędzy — bez pytań.'],
                ['icon' => 'lock', 'title' => 'Bezpieczeństwo na poziomie bankowym', 'description' => 'Twoje dane płatnicze chronione są szyfrowaniem SSL 256-bit i przetwarzane przez dostawcę z certyfikatem PCI-DSS Level 1.'],
                ['icon' => 'users', 'title' => 'Dedykowana obsługa klienta', 'description' => 'Prawdziwi ludzie dostępni pon.–pt. 9–17. Średni czas odpowiedzi poniżej 2 godzin.'],
            ],
        ], 1);

        // ── 9 · Promotional CTA Banner ──────────────────────────────────────
        $s = $this->section($page, 'banner', 'full-width', 'dark', ['padding' => 'xl', 'animation' => 'zoom-in'], $pos++);
        $this->block($page, $s, 'call_to_action', [
            'title' => 'Nowy sezon. Nowe kolekcje.',
            'subtitle' => 'Do 40% rabatu na wybrane style — tylko w ten weekend. Nowe produkty z mody, domu i urody.',
            'alignment' => 'center',
            'style' => 'gradient',
            'badge_text' => '🔥 Weekendowa wyprzedaż',
            'primary_label' => 'Kup przecenione',
            'primary_url' => '/wyprzedaz',
            'secondary_label' => 'Zobacz nowości',
            'secondary_url' => '/nowosci',
        ], 1);

        // ── 10 · Testimonials ───────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'muted', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'testimonials', [
            'title' => 'Co mówią nasi klienci?',
            'subtitle' => 'Ponad 12 000 zadowolonych klientów i ciągle rośniemy.',
            'layout' => 'grid',
            'columns' => 2,
            'items' => [
                [
                    'author' => 'Anna K.',
                    'rating' => 5,
                    'content' => 'Jestem zachwycona jakością. Tkanina kurtki jest niesamowicie miękka, a dopasowanie idealne. Dostawa szybsza niż się spodziewałam — na pewno zamówię jeszcze raz!',
                    'role' => 'Warszawa',
                ],
                [
                    'author' => 'Marek T.',
                    'rating' => 5,
                    'content' => 'Opakowanie było piękne, a zestaw świec pachnie niesamowicie. Idealny prezent. Przyszło w 2 dni — naprawdę imponujące.',
                    'role' => 'Kraków',
                ],
                [
                    'author' => 'Zofia R.',
                    'rating' => 5,
                    'content' => 'Wahałam się przed kupnem butów online, ale tabela rozmiarów okazała się idealna. Wyglądają dokładnie jak na zdjęciach. Przepiękne wykonanie — czuć jakość.',
                    'role' => 'Poznań',
                ],
                [
                    'author' => 'Łukasz O.',
                    'rating' => 5,
                    'content' => 'Świetna obsługa klienta przy wymianie rozmiaru. Cały proces był bezproblemowy, a zespół odpowiedział w ciągu godziny. Najwyższy poziom.',
                    'role' => 'Wrocław',
                ],
            ],
        ], 1);

        // ── 11 · Featured Posts ─────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $postsBlock = $this->block($page, $s, 'featured_posts', [
            'title' => 'Z naszego bloga',
            'subtitle' => 'Poradniki stylizacyjne, artykuły o zrównoważonym życiu i sylwetki twórców.',
            'source' => 'latest',
            'max_items' => 3,
            'columns' => 3,
            'display_mode' => 'card',
            'show_excerpt' => true,
            'show_date' => true,
            'show_author' => false,
            'cta_text' => 'Czytaj wszystkie artykuły',
            'cta_url' => '/blog',
        ], 1);
        $latestPosts = BlogPost::query()->published()->orderByDesc('published_at')->take(3)->get();
        foreach ($latestPosts as $i => $post) {
            BlockRelation::query()->updateOrCreate(['page_block_id' => $postsBlock->id, 'relation_type' => 'blog_post', 'relation_id' => $post->id], ['relation_key' => 'posts', 'position' => $i + 1, 'metadata' => []]);
        }

        // ── 12 · Countdown Timer (Flash Sale) ───────────────────────────────
        $saleEnd = now()->addDays(3)->setTime(23, 59, 0)->toIso8601String();
        $s = $this->section($page, 'banner', 'full-width', 'dark', ['padding' => 'xl', 'animation' => 'zoom-in'], $pos++);
        $this->block($page, $s, 'countdown_timer', [
            'title' => '⚡ Flash Sale — kończy się za',
            'subtitle' => 'Do 50% taniej na wybrane produkty. Ograniczony czas, ograniczone stany.',
            'target_date' => $saleEnd,
            'show_labels' => true,
            'expired_message' => 'Ta wyprzedaż już się zakończyła. Wróć wkrótce!',
            'cta_label' => 'Kup teraz w promocji',
            'cta_url' => '/wyprzedaz',
            'style' => 'dark',
        ], 1);

        // ── 13 · Newsletter Signup ──────────────────────────────────────────
        $s = $this->section($page, 'banner', 'full-width', 'brand', ['padding' => 'xl'], $pos++);
        $this->block($page, $s, 'newsletter_signup', [
            'title' => 'Dołącz do naszej społeczności',
            'subtitle' => 'Otrzymuj wcześniejszy dostęp do nowości, ekskluzywne oferty i inspiracje stylistyczne — prosto do swojej skrzynki.',
            'placeholder' => 'Wpisz swój adres e-mail',
            'button_label' => 'Zapisz się za darmo',
            'success_message' => 'Witamy na pokładzie! Sprawdź skrzynkę — czeka na Ciebie kod -10%.',
            'gdpr_note' => 'Zapisując się, akceptujesz naszą Politykę prywatności. Możesz wypisać się w każdej chwili.',
        ], 1);
    }

    private function seedPolishAboutPage(): void
    {
        $page = Page::query()->updateOrCreate(['slug' => 'o-nas', 'locale' => 'pl'], [
            'parent_id' => null,
            'title' => ['pl' => 'O nas', 'en' => 'About Us'],
            'page_type' => 'blocks',
            'is_published' => true,
            'published_at' => now(),
            'position' => 10,
            'seo_title' => 'O nas — Nasza historia i wartości',
            'seo_description' => 'Poznaj naszą misję: dostarczać starannie zaprojektowane, etycznie wytwarzane produkty do codziennego życia.',
        ]);

        $page->allSections()->delete();
        $pos = 1;

        // ── 1 · Hero ─────────────────────────────────────────────────────────
        $s = $this->section($page, 'hero', 'full-width', 'dark', [], $pos++);
        $this->block($page, $s, 'hero_banner', [
            'title' => 'Tworzymy z intencją',
            'subtitle' => 'Wierzymy, że świetny design powinien być dostępny dla każdego — bez kompromisów w kwestii etyki i środowiska.',
            'cta_text' => 'Nasza historia',
            'cta_url' => '#historia',
            'cta_style' => 'primary',
            'cta2_text' => 'Zobacz marki',
            'cta2_url' => '/marki',
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
                ['value' => '2020', 'suffix' => '', 'label' => 'Rok założenia'],
                ['value' => '50', 'suffix' => '+', 'label' => 'Marek partnerskich'],
                ['value' => '12000', 'suffix' => '+', 'label' => 'Klientów na świecie'],
                ['value' => '70', 'suffix' => '%', 'label' => 'Zrównoważone materiały'],
            ],
        ], 1);

        // ── 3 · Nasza historia (Rich Text) ───────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'muted', ['padding' => 'xl', 'animation' => 'fade-left'], $pos++);
        $this->block($page, $s, 'rich_text', [
            'content' => '<h2>Nasza historia</h2><p>Założona w 2020 roku, firma powstała z prostego przekonania: codzienne produkty powinny być zarówno piękne, jak i trwałe. Byliśmy zmęczeni jednorazową modą i masowo produkowanymi artykułami domowymi, które rozpadały się po jednym sezonie.</p><p>Postanowiliśmy więc stworzyć kolekcje od rzemieślniczych wytwórców i etycznych producentów, którzy podzielają nasze zaangażowanie w jakość, zrównoważony rozwój i uczciwe praktyki. Dziś współpracujemy z ponad 50 dostawcami z Europy i nie tylko — każdy z nich jest starannie wybrany za mistrzostwo i wartości.</p><p>Każdy produkt w naszym katalogu przeszedł przez ludzkie ręce z troską. Wierzymy, że to czujesz.</p>',
            'max_width' => '3xl',
            'text_align' => 'left',
        ], 1);

        // ── 4 · Values (Icon List) ───────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'icon_list', [
            'title' => 'Nasze wartości',
            'subtitle' => 'Trzy zasady kierują każdą naszą decyzją.',
            'columns' => 3,
            'style' => 'centered',
            'items' => [
                ['icon' => 'leaf', 'title' => 'Zrównoważony rozwój', 'description' => 'Ponad 70% naszych produktów wykorzystuje materiały z recyklingu, organiczne lub pozyskiwane w odpowiedzialny sposób. Dążymy do pełnej neutralności węglowej do 2027 roku.'],
                ['icon' => 'heart', 'title' => 'Fair Trade', 'description' => 'Każdy dostawca w naszej sieci jest co roku audytowany pod kątem godnych płac, bezpiecznych warunków pracy i etycznych praktyk.'],
                ['icon' => 'award', 'title' => 'Trwała jakość', 'description' => 'Projektujemy z myślą o długowieczności, nie o przestarzałości. Nasze produkty objęte są przedłużonymi gwarancjami i programami naprawczymi.'],
            ],
        ], 1);

        // ── 5 · Timeline ─────────────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'muted', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'timeline', [
            'title' => 'Nasza droga',
            'subtitle' => 'Od małego biura do 12 000 zadowolonych klientów.',
            'layout' => 'left',
            'items' => [
                ['date' => '2020', 'title' => 'Założenie', 'description' => 'Startujemy z domowego biura z 3 markami partnerskimi i wizją: udostępnić jakość bez kompromisów etycznych.'],
                ['date' => '2021', 'title' => 'Pierwsi 1 000 klientów', 'description' => 'Rozwinęliśmy się do 15 marek i osiągnęliśmy pierwsze 1 000 zamówień. Przenieśliśmy się do prawdziwego magazynu i zatrudniliśmy pierwszych pracowników.'],
                ['date' => '2022', 'title' => 'Zobowiązanie na rzecz zrównoważonego rozwoju', 'description' => 'Uruchomiliśmy program audytu zrównoważonego rozwoju. Wszyscy nowi partnerzy muszą spełniać nasze kryteria etycznego pozyskiwania surowców.'],
                ['date' => '2023', 'title' => 'Ekspansja europejska', 'description' => 'Otworzyliśmy wysyłkę do 12 krajów europejskich. Uruchomiliśmy polskojęzyczną stronę i nawiązaliśmy współpracę z lokalnymi markami rzemieślniczymi.'],
                ['date' => '2024', 'title' => '10 000 klientów', 'description' => 'Przekroczyliśmy próg 10 000 klientów. Wprowadziliśmy program naprawczy — przedłużamy życie sprzedawanych przez nas produktów.'],
                ['date' => '2025', 'title' => 'Nowa platforma', 'description' => 'Przebudowaliśmy całe nasze cyfrowe doświadczenie, aby było szybsze, bardziej osobiste i naprawdę dostępne na wszystkich urządzeniach.'],
            ],
        ], 1);

        // ── 6 · Team Members ─────────────────────────────────────────────────
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'team_members', [
            'title' => 'Ludzie za marką',
            'subtitle' => 'Mały zespół, wielka pasja do jakości i zrównoważonego rozwoju.',
            'columns' => 4,
            'members' => [
                ['name' => 'Marta Kowalska', 'role' => 'Założycielka i CEO', 'bio' => 'Była kupiec modowa z 10-letnim doświadczeniem w głównych europejskich sieciach. Założyła markę po jednym za dużo frustracjach z fast fashion.'],
                ['name' => 'James Chen', 'role' => 'Dyrektor produktu', 'bio' => 'Projektant przemysłowy, który został kuratorem produktów. Opętany materiałami, wykonaniem i historią każdego przedmiotu.'],
                ['name' => 'Aleksandra Nowak', 'role' => 'Lider ds. zrównoważonego rozwoju', 'bio' => 'Magister zarządzania środowiskowego. Audytuje wszystkie relacje z dostawcami i prowadzi nasz plan redukcji emisji CO₂.'],
                ['name' => 'Tomasz Bauer', 'role' => 'Obsługa klienta', 'bio' => 'Wierzy, że każda interakcja z klientem to moment marki. Kieruje zespołem utrzymującym SLA odpowiedzi poniżej 2 godzin.'],
            ],
        ], 1);

        // ── 7 · CTA ──────────────────────────────────────────────────────────
        $s = $this->section($page, 'banner', 'full-width', 'dark', ['padding' => 'xl', 'animation' => 'zoom-in'], $pos++);
        $this->block($page, $s, 'call_to_action', [
            'title' => 'Przeglądaj nasze kolekcje',
            'subtitle' => 'Każdy zakup wspiera rzemieślników za naszymi produktami i przybliża nas do bardziej zrównoważonej przyszłości.',
            'alignment' => 'center',
            'style' => 'gradient',
            'primary_label' => 'Przeglądaj wszystkie produkty',
            'primary_url' => '/produkty',
            'secondary_label' => 'Poznaj nasze marki',
            'secondary_url' => '/marki',
        ], 1);
    }

    private function seedPolishLegalPages(): void
    {
        $legalPages = [
            [
                'slug' => 'polityka-prywatnosci',
                'title' => ['pl' => 'Polityka prywatności', 'en' => 'Privacy Policy'],
                'position' => 20,
                'seo_title' => 'Polityka prywatności',
                'seo_description' => 'Dowiedz się, jak zbieramy, wykorzystujemy i chronimy Twoje dane osobowe.',
                'content' => $this->privacyPolicyHtmlPl(),
            ],
            [
                'slug' => 'regulamin',
                'title' => ['pl' => 'Regulamin', 'en' => 'Terms of Service'],
                'position' => 21,
                'seo_title' => 'Regulamin sklepu',
                'seo_description' => 'Regulamin i warunki korzystania z naszej strony internetowej i usług.',
                'content' => $this->termsOfServiceHtmlPl(),
            ],
        ];

        foreach ($legalPages as $def) {
            $p = Page::query()->updateOrCreate(['slug' => $def['slug'], 'locale' => 'pl'], [
                'parent_id' => null,
                'title' => $def['title'],
                'page_type' => 'module',
                'module_name' => 'content',
                'module_config' => ['html' => $def['content']],
                'content' => $def['content'],
                'is_published' => true,
                'published_at' => now(),
                'position' => $def['position'],
                'seo_title' => $def['seo_title'],
                'seo_description' => $def['seo_description'],
            ]);
            $p->allSections()->delete();
        }
    }

    private function seedPolishFaqPage(): void
    {
        $faqs = Faq::active()->orderBy('category')->orderBy('position')->get();

        $page = Page::query()->updateOrCreate(['slug' => 'faq', 'locale' => 'pl'], [
            'parent_id' => null,
            'title' => ['pl' => 'Najczęstsze pytania', 'en' => 'FAQ'],
            'page_type' => 'module',
            'module_name' => 'faq',
            'module_config' => [
                'items' => $faqs->map(fn ($f): array => [
                    'id' => $f->id,
                    'question' => $f->question,
                    'answer' => $f->answer,
                    'category' => $f->category,
                ])->values()->all(),
            ],
            'is_published' => true,
            'published_at' => now(),
            'position' => 30,
            'seo_title' => 'FAQ — Najczęstsze pytania',
            'seo_description' => 'Odpowiedzi na najczęstsze pytania dotyczące zamówień, dostawy, zwrotów i płatności.',
        ]);
        $page->allSections()->delete();
    }

    private function seedPolishShippingPage(): void
    {
        $p = Page::query()->updateOrCreate(['slug' => 'polityka-wysylki', 'locale' => 'pl'], [
            'parent_id' => null,
            'title' => ['pl' => 'Polityka wysyłki', 'en' => 'Shipping Policy'],
            'page_type' => 'module',
            'module_name' => 'content',
            'module_config' => ['html' => $this->shippingPolicyHtmlPl()],
            'content' => $this->shippingPolicyHtmlPl(),
            'is_published' => true,
            'published_at' => now(),
            'position' => 22,
            'seo_title' => 'Polityka wysyłki',
            'seo_description' => 'Wszystko, co musisz wiedzieć o opcjach dostawy, czasach realizacji i kosztach wysyłki.',
        ]);
        $p->allSections()->delete();
    }

    private function seedPolishReturnPolicyPage(): void
    {
        $p = Page::query()->updateOrCreate(['slug' => 'polityka-zwrotow', 'locale' => 'pl'], [
            'parent_id' => null,
            'title' => ['pl' => 'Polityka zwrotów', 'en' => 'Return Policy'],
            'page_type' => 'module',
            'module_name' => 'content',
            'module_config' => ['html' => $this->returnPolicyHtmlPl()],
            'content' => $this->returnPolicyHtmlPl(),
            'is_published' => true,
            'published_at' => now(),
            'position' => 23,
            'seo_title' => 'Polityka zwrotów i reklamacji',
            'seo_description' => 'Nasza bezproblemowa polityka zwrotów i reklamacji w ciągu 30 dni.',
        ]);
        $p->allSections()->delete();
    }

    private function seedPolishCookiePolicyPage(): void
    {
        $p = Page::query()->updateOrCreate(['slug' => 'polityka-cookies', 'locale' => 'pl'], [
            'parent_id' => null,
            'title' => ['pl' => 'Polityka cookies', 'en' => 'Cookie Policy'],
            'page_type' => 'module',
            'module_name' => 'content',
            'module_config' => ['html' => $this->cookiePolicyHtmlPl()],
            'content' => $this->cookiePolicyHtmlPl(),
            'is_published' => true,
            'published_at' => now(),
            'position' => 24,
            'seo_title' => 'Polityka plików cookies',
            'seo_description' => 'Jak używamy plików cookies i podobnych technologii na naszej stronie.',
        ]);
        $p->allSections()->delete();
    }

    private function seedPolishContactPage(): void
    {
        $contactForm = Form::query()->where('slug', 'contact')->first();

        $page = Page::query()->updateOrCreate(['slug' => 'kontakt', 'locale' => 'pl'], [
            'parent_id' => null,
            'title' => ['pl' => 'Kontakt', 'en' => 'Contact Us'],
            'page_type' => 'blocks',
            'is_published' => true,
            'published_at' => now(),
            'position' => 20,
            'seo_title' => 'Kontakt — Chętnie odpiszemy',
            'seo_description' => 'Masz pytanie lub potrzebujesz pomocy? Skontaktuj się z nami, a odpiszemy w ciągu 1–2 dni roboczych.',
        ]);

        $page->allSections()->delete();
        $pos = 1;

        // Hero
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl'], $pos++);
        $this->block($page, $s, 'rich_text', [
            'content' => '<h1 style="text-align:center">Kontakt</h1><p style="text-align:center;max-width:640px;margin:0 auto">Masz pytanie lub potrzebujesz pomocy? Chętnie porozmawiamy. Wypełnij poniższy formularz, a odezwiemy się w ciągu 1–2 dni roboczych.</p>',
        ], 1);

        // Trust badges
        $s = $this->section($page, 'standard', 'contained', 'muted', ['padding' => 'md', 'animation' => 'fade-up'], $pos++);
        $this->block($page, $s, 'trust_badges', [
            'style' => 'minimal',
            'badges' => [
                ['icon' => 'clock', 'label' => 'Odpowiadamy w 2 godziny'],
                ['icon' => 'users', 'label' => 'Prawdziwi ludzie, nie boty'],
                ['icon' => 'phone', 'label' => 'Pon.–Pt. 9–17 CET'],
                ['icon' => 'mail', 'label' => 'kontakt@przyklad.pl'],
            ],
        ], 1);

        // Contact Form
        $s = $this->section($page, 'standard', 'contained', 'light', ['padding' => 'xl', 'animation' => 'fade-up'], $pos++);
        $formBlock = $this->block($page, $s, 'form_embed', [
            'title' => 'Wyślij nam wiadomość',
            'description' => 'Zazwyczaj odpowiadamy w ciągu 2 godzin w godzinach pracy.',
            'form_id' => $contactForm?->id,
        ], 1);
        if ($contactForm) {
            BlockRelation::query()->updateOrCreate(['page_block_id' => $formBlock->id, 'relation_type' => 'form', 'relation_id' => $contactForm->id], ['relation_key' => 'form', 'position' => 1, 'metadata' => []]);
        }

        // Map
        $s = $this->section($page, 'standard', 'flush', 'light', ['padding' => 'none', 'animation' => 'fade-in'], $pos++);
        $this->block($page, $s, 'map', [
            'title' => 'Nasze biuro',
            'lat' => 52.229676,
            'lng' => 21.012229,
            'zoom' => 14,
            'height' => 400,
        ], 1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POLISH LEGAL HTML CONTENT
    // ─────────────────────────────────────────────────────────────────────────

    private function privacyPolicyHtmlPl(): string
    {
        return <<<'HTML'
<h1>Polityka prywatności</h1>
<p><em>Obowiązuje od 1 stycznia 2024 r.</em></p>
<h2>1. Administrator danych</h2>
<p>Administratorem Twoich danych osobowych jest nasza firma. W sprawach dotyczących ochrony danych możesz skontaktować się z nami pod adresem: privacy@przyklad.pl.</p>
<h2>2. Jakie dane zbieramy?</h2>
<p>Zbieramy dane, które podajesz podczas rejestracji, składania zamówienia lub kontaktu z nami: imię i nazwisko, adres e-mail, adres dostawy, numer telefonu oraz dane dotyczące płatności (przetwarzane przez zewnętrznego operatora).</p>
<h2>3. Cel przetwarzania danych</h2>
<ul>
<li>Realizacja zamówień i obsługa klienta</li>
<li>Wysyłka newslettera (tylko za Twoją zgodą)</li>
<li>Analiza ruchu i poprawa naszych usług</li>
<li>Wypełnienie obowiązków prawnych</li>
</ul>
<h2>4. Podstawa prawna</h2>
<p>Dane przetwarzamy na podstawie umowy (art. 6 ust. 1 lit. b RODO), prawnie uzasadnionego interesu (art. 6 ust. 1 lit. f RODO) lub Twojej zgody (art. 6 ust. 1 lit. a RODO).</p>
<h2>5. Prawa użytkownika</h2>
<p>Masz prawo do dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz wniesienia sprzeciwu. Możesz też wnieść skargę do Prezesa UODO.</p>
<h2>6. Okres przechowywania</h2>
<p>Dane przechowujemy przez czas trwania umowy oraz przez okres wynikający z przepisów prawa (np. 5 lat dla dokumentów podatkowych).</p>
<h2>7. Przekazywanie danych</h2>
<p>Twoje dane mogą być przekazywane firmom kurierskim, operatorom płatności i dostawcom usług IT — wyłącznie w zakresie niezbędnym do realizacji zamówienia.</p>
HTML;
    }

    private function termsOfServiceHtmlPl(): string
    {
        return <<<'HTML'
<h1>Regulamin sklepu internetowego</h1>
<p><em>Obowiązuje od 1 stycznia 2024 r.</em></p>
<h2>1. Postanowienia ogólne</h2>
<p>Niniejszy regulamin określa zasady korzystania ze sklepu internetowego, składania zamówień oraz prawa i obowiązki Kupującego i Sprzedającego.</p>
<h2>2. Składanie zamówień</h2>
<p>Zamówienia można składać 24 godziny na dobę, 7 dni w tygodniu. Zamówienie jest wiążące po otrzymaniu przez Kupującego potwierdzenia e-mail. Sprzedający zastrzega sobie prawo do anulowania zamówień w przypadku niedostępności towaru.</p>
<h2>3. Ceny i płatności</h2>
<p>Wszystkie ceny podane są w złotych polskich (PLN) i zawierają podatek VAT. Akceptujemy płatności kartą, BLIK-iem, przelewem bankowym oraz przez PayPal i Apple Pay.</p>
<h2>4. Dostawa</h2>
<p>Zamówienia realizowane są w ciągu 1–2 dni roboczych. Standardowy czas dostawy wynosi 1–3 dni robocze. Darmowa dostawa przysługuje przy zamówieniach powyżej 299 zł.</p>
<h2>5. Zwroty i reklamacje</h2>
<p>Kupujący ma prawo do odstąpienia od umowy w ciągu 30 dni od daty dostawy bez podania przyczyny. Towar musi być zwrócony w oryginalnym opakowaniu i stanie nienaruszonym. Reklamacje rozpatrujemy w ciągu 14 dni roboczych.</p>
<h2>6. Ochrona danych osobowych</h2>
<p>Zasady przetwarzania danych osobowych opisane są w Polityce prywatności dostępnej na naszej stronie.</p>
<h2>7. Postanowienia końcowe</h2>
<p>W sprawach nieuregulowanych niniejszym regulaminem stosuje się przepisy prawa polskiego, w szczególności Kodeksu cywilnego i ustawy o prawach konsumenta.</p>
HTML;
    }

    private function shippingPolicyHtmlPl(): string
    {
        return <<<'HTML'
<h1>Polityka wysyłki</h1>
<h2>Czas realizacji</h2>
<p>Zamówienia złożone przed godz. 13:00 w dni robocze są wysyłane tego samego dnia. Zamówienia złożone po godz. 13:00 lub w weekendy są wysyłane następnego dnia roboczego.</p>
<h2>Opcje dostawy</h2>
<ul>
<li><strong>Dostawa standardowa</strong> — 1–3 dni robocze, od 9,99 zł</li>
<li><strong>Dostawa ekspresowa</strong> — następny dzień roboczy (przy zamówieniu do godz. 13:00), od 19,99 zł</li>
<li><strong>Paczkomat InPost</strong> — 1–2 dni robocze, od 7,99 zł</li>
<li><strong>Darmowa dostawa</strong> — przy zamówieniach powyżej 299 zł</li>
</ul>
<h2>Śledzenie przesyłki</h2>
<p>Po wysłaniu zamówienia otrzymasz e-mail z numerem śledzenia. Możesz też sprawdzić status w sekcji <strong>Moje konto → Zamówienia</strong>.</p>
<h2>Dostawa zagraniczna</h2>
<p>Wysyłamy do krajów Unii Europejskiej. Czas dostawy wynosi 3–7 dni roboczych, a koszt jest obliczany w koszyku na podstawie kraju docelowego. Zamówienia spoza UE mogą podlegać cłu i podatkom importowym.</p>
<h2>Uszkodzona przesyłka</h2>
<p>Jeśli Twoja paczka dotrze uszkodzona, skontaktuj się z nami w ciągu 48 godzin od dostarczenia, dołączając zdjęcia. Natychmiast wyślemy zastępczy towar lub zwrócimy pełną kwotę.</p>
HTML;
    }

    private function returnPolicyHtmlPl(): string
    {
        return <<<'HTML'
<h1>Polityka zwrotów i reklamacji</h1>
<h2>30-dniowe prawo do zwrotu</h2>
<p>Oferujemy 30-dniowe okno zwrotu od daty dostawy. Produkty muszą być nieużywane, w oryginalnym opakowaniu i z dowodem zakupu.</p>
<h2>Jak zwrócić towar?</h2>
<ol>
<li>Zaloguj się na swoje konto i przejdź do sekcji <strong>Moje zamówienia</strong></li>
<li>Wybierz pozycję do zwrotu i kliknij <em>Złóż wniosek o zwrot</em></li>
<li>W ciągu 24 godzin wyślemy Ci przedpłaconą etykietę zwrotną</li>
<li>Zapakuj towar i nadaj go w dowolnym punkcie odbioru</li>
</ol>
<h2>Zwrot pieniędzy</h2>
<p>Zwroty są przetwarzane w ciągu 3–5 dni roboczych od otrzymania zwróconego towaru. Środki mogą pojawić się na koncie po kolejnych 5–10 dniach, w zależności od Twojego banku.</p>
<h2>Wymiana towaru</h2>
<p>Przy składaniu wniosku o zwrot wybierz opcję <em>Wymiana</em> i wskaż żądany rozmiar lub kolor. Wyślemy nowy produkt natychmiast po otrzymaniu zwrotu.</p>
<h2>Produkty, których nie można zwrócić</h2>
<p>Ze względów higienicznych nie przyjmujemy zwrotów bielizny, biżuterii do przekłuwania uszu oraz produktów z uszkodzonymi plombami. Produkty personalizowane nie podlegają zwrotowi, chyba że są wadliwe.</p>
<h2>Reklamacje</h2>
<p>W przypadku wadliwego towaru przysługuje Ci gwarancja przez 2 lata od daty zakupu. Skontaktuj się z nami pod adresem reklamacje@przyklad.pl, dołączając zdjęcia i opis wady.</p>
HTML;
    }

    private function cookiePolicyHtmlPl(): string
    {
        return <<<'HTML'
<h1>Polityka plików cookies</h1>
<h2>Czym są pliki cookies?</h2>
<p>Pliki cookies to małe pliki tekstowe zapisywane na Twoim urządzeniu podczas odwiedzania naszej strony. Pomagają nam zapamiętać Twoje preferencje i poprawić Twoje doświadczenia zakupowe.</p>
<h2>Rodzaje plików cookies</h2>
<h3>Niezbędne</h3>
<p>Wymagane do prawidłowego działania strony — np. utrzymanie sesji, zawartości koszyka czy preferencji językowych. Nie można ich wyłączyć.</p>
<h3>Analityczne</h3>
<p>Pomagają nam zrozumieć, jak użytkownicy korzystają ze strony (np. Google Analytics). Wszystkie dane są anonimizowane i agregowane.</p>
<h3>Marketingowe</h3>
<p>Umożliwiają wyświetlanie reklam dopasowanych do Twoich zainteresowań na naszej stronie i u partnerów zewnętrznych.</p>
<h2>Jak zarządzać plikami cookies?</h2>
<p>Możesz zmienić ustawienia cookies w każdej chwili za pomocą panelu zgód w stopce strony lub w ustawieniach przeglądarki. Pamiętaj, że wyłączenie niektórych cookies może wpłynąć na funkcjonalność sklepu.</p>
<h2>Cookies stron trzecich</h2>
<p>Korzystamy z usług zewnętrznych dostawców, takich jak Google Analytics, Facebook Pixel i Stripe. Każdy z nich ma własną politykę cookies dostępną na ich stronach internetowych.</p>
<h2>Kontakt</h2>
<p>Pytania dotyczące plików cookies kieruj na adres: cookies@przyklad.pl.</p>
HTML;
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

    private function block(
        Page $page,
        PageSection $section,
        string $type,
        array $configuration,
        int $position
    ): PageBlock {
        return PageBlock::query()->create([
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
        $brands = Brand::query()->where('is_active', true)->orderBy('position')->get();
        foreach ($brands as $i => $brand) {
            BlockRelation::query()->updateOrCreate(['page_block_id' => $block->id, 'relation_type' => 'brand', 'relation_id' => $brand->id], ['relation_key' => 'brands', 'position' => $i + 1, 'metadata' => []]);
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
