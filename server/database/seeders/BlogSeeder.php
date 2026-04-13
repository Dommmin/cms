<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@example.com')->first()
            ?? User::query()->first();

        if (! $admin) {
            return;
        }

        // Create categories
        $categories = [
            ['name' => 'News', 'slug' => 'news', 'description' => 'Latest news and announcements.'],
            ['name' => 'Style Guide', 'slug' => 'style-guide', 'description' => 'Fashion tips and style inspiration.'],
            ['name' => 'Behind the Brand', 'slug' => 'behind-the-brand', 'description' => 'Stories from our team and partners.'],
            ['name' => 'Living & Home', 'slug' => 'living-home', 'description' => 'Home décor ideas and interior inspiration.'],
            ['name' => 'Sustainability', 'slug' => 'sustainability', 'description' => 'Our commitment to a better planet.'],
        ];

        $createdCategories = [];
        foreach ($categories as $cat) {
            $createdCategories[$cat['slug']] = BlogCategory::query()->firstOrCreate(
                ['slug' => $cat['slug']],
                ['name' => $cat['name'], 'description' => $cat['description'], 'is_active' => true],
            );
        }

        // Create demo blog posts
        $posts = [
            [
                'title' => 'Welcome to Our New Store',
                'slug' => 'welcome-to-our-new-store',
                'excerpt' => 'We\'re thrilled to launch our brand-new online store, packed with curated fashion, home décor and lifestyle essentials.',
                'content' => '<p>We\'re thrilled to launch our brand-new online store, packed with curated fashion, home décor and lifestyle essentials crafted to last.</p><p>Our team has spent months sourcing the finest products from independent makers and established brands alike. Every item in our catalog has been hand-picked for quality, sustainability, and timeless style.</p><p>Stay tuned for weekly arrivals, exclusive member discounts and behind-the-scenes stories from the people who make our products.</p>',
                'category' => 'news',
                'days_ago' => 3,
                'is_featured' => true,
                'reading_time' => 3,
            ],
            [
                'title' => 'Spring/Summer Style Guide 2026',
                'slug' => 'spring-summer-style-guide-2026',
                'excerpt' => 'Discover the key trends shaping spring and summer this year — from bold prints to effortless linen.',
                'content' => '<p>Spring is here and with it comes a wave of fresh silhouettes, playful prints and breezy fabrics. Here\'s how to build a warm-weather wardrobe that\'s both versatile and on-trend.</p><h2>1. Bold botanical prints</h2><p>Oversized florals and leafy motifs are everywhere this season. Pair a printed midi skirt with a crisp white tee for an effortless daytime look.</p><h2>2. Linen everything</h2><p>Linen trousers, linen blazers, linen dresses — the breathable natural fabric reigns supreme. Go for natural or earthy tones for a timeless feel.</p><h2>3. Statement accessories</h2><p>A sculptural bag or chunky sandals can transform the simplest outfit. Invest in one bold piece and let it do the talking.</p>',
                'category' => 'style-guide',
                'days_ago' => 7,
                'is_featured' => true,
                'reading_time' => 5,
            ],
            [
                'title' => 'Meet the Maker: Hand-Thrown Ceramics',
                'slug' => 'meet-the-maker-hand-thrown-ceramics',
                'excerpt' => 'We sit down with ceramic artist Mara to talk craft, process and the beauty of imperfection.',
                'content' => '<p>Hidden in a converted warehouse on the edge of town, Mara throws pots, plates and mugs that end up in homes around the world. We visited her studio to learn more about her process.</p><p>"I fell in love with clay because of its resistance," Mara explains, hands still dusted with kaolin. "Every piece fights back a little. That\'s what makes it interesting."</p><p>Her signature style — earthy glazes with subtle asymmetry — has made her work some of the most sought-after in our homeware collection. Limited editions drop every quarter.</p>',
                'category' => 'behind-the-brand',
                'days_ago' => 12,
                'is_featured' => false,
                'reading_time' => 4,
            ],
            [
                'title' => 'How to Care for Your Woollen Knitwear',
                'slug' => 'how-to-care-for-woollen-knitwear',
                'excerpt' => 'Keep your favourite jumpers looking their best with these simple washing and storage tips.',
                'content' => '<p>Quality knitwear is an investment — treat it right and it will reward you with years of wear. Follow these simple steps to keep your woollens in perfect condition.</p><h2>Washing</h2><p>Always check the label first. Most merino and lambswool pieces can be hand-washed in cool water with a gentle wool detergent. Never wring — press excess water out with a towel.</p><h2>Drying</h2><p>Lay flat on a clean towel to dry. Hanging knitwear causes it to stretch out of shape. Keep away from direct sunlight and radiators.</p><h2>Storage</h2><p>Fold, never hang. Tuck a cedar block into your drawer to deter moths. For long-term storage, place in a breathable cotton bag — never plastic.</p>',
                'category' => 'style-guide',
                'days_ago' => 18,
                'is_featured' => false,
                'reading_time' => 4,
            ],
            [
                'title' => 'Sustainability Report 2025',
                'slug' => 'sustainability-report-2025',
                'excerpt' => "A look back at our environmental milestones last year and what we're committing to in 2026.",
                'content' => '<p>Sustainability isn\'t a checkbox for us — it\'s woven into every decision we make, from packaging to supplier selection. Here\'s what we achieved in 2025 and where we\'re headed.</p><h2>Key milestones</h2><ul><li>Eliminated single-use plastic from all outbound packaging</li><li>Partnered with 12 new certified fair-trade suppliers</li><li>Offset 100% of our shipping carbon through certified forest projects</li><li>Donated 2% of revenue to environmental NGOs</li></ul><h2>2026 commitments</h2><p>This year we\'re aiming for a fully circular returns programme, meaning every returned item is either resold, repaired or donated — nothing goes to landfill.</p>',
                'category' => 'sustainability',
                'days_ago' => 25,
                'is_featured' => false,
                'reading_time' => 6,
            ],
            [
                'title' => '10 Minimalist Home Décor Ideas for 2026',
                'slug' => '10-minimalist-home-decor-ideas-2026',
                'excerpt' => 'Less is more. Discover how to create a calm, beautiful home with our favourite minimalist décor picks.',
                'content' => '<p>Minimalism isn\'t about empty rooms — it\'s about intentional living. Every object you keep should earn its place. Here are ten ideas to help you create a home that feels peaceful, purposeful, and beautifully considered.</p><h2>1. Choose a neutral palette</h2><p>Whites, creams, taupes, and soft greys form the backbone of any minimalist interior. Add warmth with natural materials like linen, wood, and stone.</p><h2>2. Invest in one statement piece</h2><p>Rather than filling shelves with knick-knacks, choose one sculptural object or piece of art that anchors the room.</p><h2>3. Embrace negative space</h2><p>Resist the urge to fill every surface. Empty space isn\'t wasted — it\'s restful.</p><h2>4. Hide the cables</h2><p>Nothing disrupts a calm aesthetic more than tangled cables. Cable management boxes and wireless charging pads are your friends.</p><h2>5. Layer textures, not colours</h2><p>Interest in a monochrome room comes from texture. Mix matte plaster, soft linen, smooth ceramics, and rough timber for depth without visual noise.</p>',
                'category' => 'living-home',
                'days_ago' => 30,
                'is_featured' => false,
                'reading_time' => 5,
            ],
            [
                'title' => 'Behind the Collection: Autumn/Winter 2025',
                'slug' => 'behind-the-collection-autumn-winter-2025',
                'excerpt' => 'Go behind the scenes of our autumn/winter 2025 collection — the inspiration, the process, and the people.',
                'content' => '<p>Every collection begins with a feeling. For Autumn/Winter 2025, we were drawn to the idea of refuge — the warmth and comfort of returning somewhere familiar.</p><p>We worked with artisan weavers in the Scottish Highlands, natural dyers in Portugal, and leather craftspeople in Milan to bring the collection together. Each collaboration was a conversation, not a commission.</p><h2>The palette</h2><p>Burnt sienna, forest green, undyed wool, and deep navy — colours borrowed from autumn landscapes and long evenings by the fire.</p><h2>The materials</h2><p>85% of the collection uses certified organic or recycled fibres. Our down insulation is RDS-certified. Every piece comes with a materials passport so you know exactly what you\'re wearing.</p>',
                'category' => 'behind-the-brand',
                'days_ago' => 35,
                'is_featured' => false,
                'reading_time' => 5,
            ],
            [
                'title' => 'The Art of Capsule Wardrobe Building',
                'slug' => 'art-of-capsule-wardrobe-building',
                'excerpt' => 'A capsule wardrobe isn\'t about owning less — it\'s about owning better. Here\'s how to build yours.',
                'content' => '<p>The concept of a capsule wardrobe was popularised by Susie Faux in the 1970s and made famous by Donna Karan\'s "Seven Easy Pieces" collection. The idea is simple: a small collection of essential, high-quality pieces that work together to create many outfits.</p><h2>Start with the foundations</h2><p>A well-cut blazer, quality denim, a white shirt, a navy sweater, and a pair of leather shoes. These are the pillars everything else is built on.</p><h2>Apply the one-in-one-out rule</h2><p>Before buying anything new, identify what it will replace. This keeps your wardrobe at a manageable size and forces you to be intentional.</p><h2>Prioritise fit over trend</h2><p>A perfectly fitted affordable piece will always look better than an expensive one that doesn\'t quite work. Know your measurements and use size guides seriously.</p><h2>Think cost-per-wear</h2><p>A £200 coat worn 200 times costs £1 per wear. A £30 top worn three times costs £10. The maths of quality is compelling.</p>',
                'category' => 'style-guide',
                'days_ago' => 40,
                'is_featured' => false,
                'reading_time' => 6,
            ],
            [
                'title' => 'How We Choose Our Suppliers',
                'slug' => 'how-we-choose-our-suppliers',
                'excerpt' => "Our supplier vetting process goes beyond certifications. Here's what we actually look for.",
                'content' => '<p>Every product you see on our site has passed through a rigorous supplier assessment. We don\'t just check for certifications — we visit factories, interview workers, and review audit reports. Here\'s our process.</p><h2>Step 1: Documentation review</h2><p>We start with documentation: GOTS or OEKO-TEX certifications, Fair Trade status, environmental impact assessments, and most importantly, wages paid to workers compared to local living wage benchmarks.</p><h2>Step 2: Site visit</h2><p>Our sourcing team visits every new supplier before the first order. We look at working conditions, safety equipment, and — crucially — how the factory manager behaves when workers are present.</p><h2>Step 3: Trial order</h2><p>We place a small initial order and assess quality, communication, lead times, and any issues that arise. How a supplier handles problems is as important as their certifications.</p><h2>Step 4: Annual reviews</h2><p>We re-audit every supplier annually. Conditions can change, and we take our responsibility to workers seriously.</p>',
                'category' => 'behind-the-brand',
                'days_ago' => 45,
                'is_featured' => false,
                'reading_time' => 7,
            ],
            [
                'title' => 'New Arrivals: February Drop',
                'slug' => 'new-arrivals-february-drop',
                'excerpt' => 'Our February new arrivals are here — including the sold-out cashmere sweater, now back in stock.',
                'content' => '<p>February\'s drop is one of our favourites of the year. Here\'s a preview of what\'s new.</p><h2>The cashmere crewneck — back in stock</h2><p>It sold out in 48 hours last autumn. We\'ve restocked in four new colours: caramel, midnight blue, sage, and classic oatmeal. Pre-orders ship within 72 hours.</p><h2>Spring linen collection preview</h2><p>We\'re getting ahead of the season with a preview of our spring linen range. Relaxed trousers, unstructured blazers, and the softest linen shirts you\'ll own.</p><h2>Homeware: the ceramic planter series</h2><p>Following the success of our hand-thrown mugs, we\'ve commissioned Mara\'s studio to create a limited run of ceramic planters. Available in five sizes, perfect for everything from succulents to monstera.</p>',
                'category' => 'news',
                'days_ago' => 5,
                'is_featured' => false,
                'reading_time' => 3,
            ],
            [
                'title' => 'Our Guide to Natural Fibre Care',
                'slug' => 'guide-to-natural-fibre-care',
                'excerpt' => 'From silk to linen to cashmere — a complete guide to caring for natural fibres so they last a lifetime.',
                'content' => '<p>Natural fibres are beautiful, sustainable, and durable — but they need the right care. Here\'s our comprehensive guide.</p><h2>Cotton</h2><p>Machine wash at 30°C or below. Tumble dry on low or line dry. Iron while slightly damp for best results. Avoid bleach, which weakens fibres over time.</p><h2>Linen</h2><p>Linen becomes softer with every wash. Machine wash at 40°C. Avoid the dryer — line dry and iron damp. Embrace the natural wrinkles; they\'re part of linen\'s character.</p><h2>Wool & Cashmere</h2><p>Hand wash in cool water with wool detergent, or use the wool cycle on your machine (gentle, cold, low spin). Lay flat to dry. Never hang — it stretches. Store folded with cedar.</p><h2>Silk</h2><p>Hand wash in cool water with silk detergent or dry clean. Never wring. Press through a cloth on a cool iron setting. Keep away from perfume and deodorant — the alcohol damages the fibres.</p>',
                'category' => 'style-guide',
                'days_ago' => 50,
                'is_featured' => false,
                'reading_time' => 5,
            ],
            [
                'title' => 'Creating a Sustainable Home: Where to Start',
                'slug' => 'creating-a-sustainable-home-where-to-start',
                'excerpt' => "Feeling overwhelmed by sustainable living advice? Start small. Here's our practical guide to a greener home.",
                'content' => '<p>Sustainability can feel overwhelming when you\'re starting from scratch. The good news: small, consistent changes add up to a meaningful impact. Here\'s where we\'d start.</p><h2>The kitchen</h2><p>Replace single-use plastic with beeswax wraps and reusable containers. Invest in a compost bin — kitchen scraps make excellent garden compost. A good water filter cuts down on bottled water significantly.</p><h2>The bathroom</h2><p>Solid shampoo and conditioner bars eliminate plastic bottles. Bamboo toothbrushes, refillable deodorant, and a safety razor (the blades are recyclable) make a significant difference over a year.</p><h2>Textiles</h2><p>Buy less and buy better. Wash clothes at 30°C. Air dry where possible. Repair before replacing — our repair guide is coming soon.</p><h2>Energy</h2><p>Switch to a renewable energy tariff. Switch to LED bulbs if you haven\'t already. A smart thermostat can reduce heating bills by 15–25%.</p>',
                'category' => 'sustainability',
                'days_ago' => 55,
                'is_featured' => false,
                'reading_time' => 6,
            ],
            [
                'title' => 'The Perfect Bookshelf Styling Guide',
                'slug' => 'perfect-bookshelf-styling-guide',
                'excerpt' => "Your bookshelf says a lot about you. Here's how to style it so it also looks beautiful.",
                'content' => '<p>A bookshelf is both functional and decorative. Getting the balance right takes a little thought — here\'s how to style yours like a pro.</p><h2>The rule of three</h2><p>Group objects in odd numbers — threes work best. Combine books with a small plant, a sculptural object, and a framed photo for a balanced vignette.</p><h2>Vary the height</h2><p>Mix upright books with horizontal stacks. Add objects at different heights — a tall vase next to a small ceramic dish creates rhythm.</p><h2>Edit ruthlessly</h2><p>Remove anything you wouldn\'t keep if you were moving house. Space between objects is as important as the objects themselves.</p><h2>Use colour intentionally</h2><p>Grouping books by colour is controversial but effective. Alternatively, keep it neutral and let the objects provide colour interest.</p>',
                'category' => 'living-home',
                'days_ago' => 60,
                'is_featured' => false,
                'reading_time' => 4,
            ],
            [
                'title' => 'Partner Spotlight: The Weavers of Oaxaca',
                'slug' => 'partner-spotlight-weavers-of-oaxaca',
                'excerpt' => 'Meet the Zapotec weavers whose centuries-old techniques produce the textiles at the heart of our summer collection.',
                'content' => '<p>In the valleys around Oaxaca City, Mexico, the Zapotec weaving tradition dates back over 2,000 years. Natural dyes extracted from cochineal beetles, indigo plants, and local minerals produce colours of extraordinary depth and permanence.</p><p>We visited the village of Teotitlán del Valle, where families have woven rugs, blankets, and wall hangings on traditional backstrap looms for generations. It was immediately clear that this was not craft-for-tourists — this was a living, evolving art form.</p><h2>The partnership</h2><p>We work directly with a cooperative of twelve weaving families. No middlemen. We pay above the fair-trade price and commit to minimum annual orders so the families can plan their production.</p><h2>The products</h2><p>The Oaxacan throw blankets in our summer collection are entirely hand-woven from locally sourced wool. No two are identical. Each carries a tag identifying the family who made it.</p>',
                'category' => 'behind-the-brand',
                'days_ago' => 68,
                'is_featured' => false,
                'reading_time' => 6,
            ],
            [
                'title' => 'Why We Moved to Plastic-Free Packaging',
                'slug' => 'why-we-moved-to-plastic-free-packaging',
                'excerpt' => "Last year we eliminated single-use plastic from all our packaging. Here's what we learned.",
                'content' => '<p>In January 2025, we made the switch to 100% plastic-free packaging across all our shipments. It wasn\'t without challenges — here\'s an honest account of what it took and what we\'d do differently.</p><h2>The problem with plastic mailers</h2><p>Polybag mailers are cheap, lightweight, and waterproof — which is why the industry defaulted to them. But they\'re not recyclable in most curbside programmes and shed microplastics throughout their life.</p><h2>Our solution</h2><p>We switched to compostable mailers made from PBAT and cornstarch for smaller orders, and recycled cardboard boxes for larger shipments. Inner packaging uses shredded paper and compostable void fill.</p><h2>The cost</h2><p>Honestly? It cost us more. Our packaging costs increased by roughly 18%. We absorbed this rather than passing it on — it felt like the right thing to do.</p><h2>What we learned</h2><p>The biggest surprise was how positively customers responded. Unpacking a parcel that arrives in compostable packaging is a different, better experience. It signals care at every touchpoint.</p>',
                'category' => 'sustainability',
                'days_ago' => 75,
                'is_featured' => false,
                'reading_time' => 5,
            ],
            [
                'title' => 'Interior Trends to Watch in 2026',
                'slug' => 'interior-trends-to-watch-2026',
                'excerpt' => 'From biophilic design to warm minimalism — the interior trends shaping homes in 2026.',
                'content' => '<p>Interior design evolves more slowly than fashion, but 2026 brings a clear shift in direction. Here are the trends our design team is most excited about.</p><h2>Warm minimalism</h2><p>Cold Scandinavian minimalism is giving way to warmer, more tactile versions — think terracotta, warm wood, and natural stone rather than stark white and grey.</p><h2>Biophilic design</h2><p>Bringing the outside in: living walls, clusters of plants, natural materials, and windows that frame garden views. Research consistently shows that connection to nature reduces stress and improves focus.</p><h2>Handmade and artisanal</h2><p>The reaction against mass production continues. Handmade ceramics, hand-blocked textiles, and bespoke furniture carry a story and an imperfection that machine-made objects can\'t replicate.</p><h2>Multifunctional spaces</h2><p>As more people work from home, rooms are being designed to serve multiple purposes. A dining table that doubles as a desk, a bedroom that accommodates a reading nook — flexibility is everything.</p>',
                'category' => 'living-home',
                'days_ago' => 80,
                'is_featured' => false,
                'reading_time' => 5,
            ],
        ];

        // Polish translations for the 2 featured posts (to demonstrate full bilingual support).
        // Other posts use available_locales: null (visible in all locales, EN content as fallback).
        $polishTranslations = [
            'welcome-to-our-new-store' => [
                'title' => 'Witamy w naszym nowym sklepie',
                'excerpt' => 'Z radością prezentujemy nasz nowy sklep internetowy, pełen starannie dobranych produktów modowych, dekoracji i artykułów lifestylowych.',
                'content' => '<p>Z radością prezentujemy nasz nowy sklep internetowy, pełen starannie dobranych produktów modowych, dekoracji i artykułów lifestylowych stworzonych z myślą o trwałości.</p><p>Nasz zespół spędził miesiące na wyszukiwaniu najlepszych produktów od niezależnych twórców i uznanych marek. Każdy produkt w naszym katalogu został wybrany ze względu na jakość, zrównoważony rozwój i ponadczasowy styl.</p><p>Śledź nas, aby być na bieżąco z nowymi dostawami co tydzień, ekskluzywnymi rabatami dla członków i historiami zza kulis od twórców naszych produktów.</p>',
            ],
            'spring-summer-style-guide-2026' => [
                'title' => 'Przewodnik po trendach wiosna/lato 2026',
                'excerpt' => 'Odkryj kluczowe trendy kształtujące wiosnę i lato tego roku — od odważnych wzorów po lekkie lniane tkaniny.',
                'content' => '<p>Wiosna jest już tu i wraz z nią przychodzi fala świeżych sylwetek, zabawnych wzorów i zwiewnych tkanin. Oto jak zbudować letką garderobę, która jest jednocześnie wszechstronna i modna.</p><h2>1. Odważne wzory botaniczne</h2><p>Duże flory i motywy liściaste są wszędzie w tym sezonie. Połącz spódnicę midi w kwiaty z klasyczną białą koszulką dla efektownego wyglądu na co dzień.</p><h2>2. Len w każdej formie</h2><p>Spodnie lniane, marynarki lniane, sukienki lniane — oddychający naturalny materiał króluje. Postaw na naturalne lub ziemiste odcienie dla ponadczasowego wyglądu.</p><h2>3. Wyraziste akcesoria</h2><p>Rzeźbiarska torba lub grubaśne sandały mogą odmienić najprostszą stylizację. Zainwestuj w jeden odważny element i pozwól mu mówić za siebie.</p>',
            ],
        ];

        foreach ($posts as $postData) {
            $categorySlug = $postData['category'];
            $daysAgo = $postData['days_ago'];
            $isFeatured = $postData['is_featured'];
            $readingTime = $postData['reading_time'];
            $slug = $postData['slug'];

            unset($postData['category'], $postData['days_ago'], $postData['is_featured'], $postData['reading_time']);

            $hasPl = isset($polishTranslations[$slug]);

            $post = BlogPost::query()->firstOrCreate(
                ['slug' => $slug],
                array_merge($postData, [
                    'user_id' => $admin->id,
                    'blog_category_id' => $createdCategories[$categorySlug]->id,
                    'content_type' => 'richtext',
                    'status' => 'published',
                    'is_featured' => $isFeatured,
                    'published_at' => now()->subDays($daysAgo),
                    'reading_time' => $readingTime,
                    'available_locales' => $hasPl ? ['en', 'pl'] : null,
                ]),
            );

            // Add Polish translations for bilingual demo posts
            if ($hasPl && $post->wasRecentlyCreated) {
                $pl = $polishTranslations[$slug];
                $post->setTranslation('title', 'pl', $pl['title']);
                $post->setTranslation('excerpt', 'pl', $pl['excerpt']);
                $post->setTranslation('content', 'pl', $pl['content']);
                $post->save();
            }
        }
    }
}
