<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\BlogPostStatusEnum;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoBlogSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::query()->where('email', 'admin@example.com')->first()
            ?? User::query()->first();

        if (! $author instanceof User) {
            return;
        }

        $blog = Blog::query()->where('slug->en', 'blog')->firstOrFail();
        $categories = $this->seedCategories();

        foreach ($this->posts() as $postDefinition) {
            $post = BlogPost::query()->firstOrNew(['slug->en' => $postDefinition['slug']]);
            $post->fill([
                'user_id' => $author->id,
                'blog_id' => $blog->id,
                'blog_category_id' => $categories[$postDefinition['category']]->id,
                'title' => ['en' => $postDefinition['title_en'], 'pl' => $postDefinition['title_pl']],
                'slug' => ['en' => $postDefinition['slug'], 'pl' => $postDefinition['slug']],
                'excerpt' => ['en' => $postDefinition['excerpt_en'], 'pl' => $postDefinition['excerpt_pl']],
                'content' => ['en' => $postDefinition['content_en'], 'pl' => $postDefinition['content_pl']],
                'content_type' => 'richtext',
                'status' => $postDefinition['status'],
                'is_featured' => $postDefinition['featured'],
                'published_at' => $postDefinition['published_at'],
                'reading_time' => $postDefinition['reading_time'],
                'available_locales' => ['en', 'pl'],
                'seo_title' => ['en' => $postDefinition['title_en'].' | Blog', 'pl' => $postDefinition['title_pl'].' | Blog'],
                'seo_description' => ['en' => $postDefinition['excerpt_en'], 'pl' => $postDefinition['excerpt_pl']],
                'featured_image' => '/demo/blog/article.svg',
                'og_image' => '/demo/blog/article.svg',
                'meta_robots' => 'index, follow',
            ]);
            $post->save();
            $post->syncTags($postDefinition['tags']);
        }
    }

    /**
     * @return array<string, BlogCategory>
     */
    private function seedCategories(): array
    {
        $definitions = [
            'skincare' => ['Skincare Guides', 'Poradniki skincare'],
            'technology' => ['Technology Notes', 'Notatki technologiczne'],
            'style' => ['Style Notes', 'Notatki stylowe'],
        ];

        $categories = [];

        foreach ($definitions as $slug => [$nameEn, $namePl]) {
            $category = BlogCategory::query()->updateOrCreate(
                ['slug' => $slug],
                ['name' => $nameEn, 'description' => $namePl, 'is_active' => true],
            );

            $categories[$slug] = $category;
        }

        return $categories;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function posts(): array
    {
        return [
            [
                'slug' => 'how-to-layer-vitamin-c',
                'category' => 'skincare',
                'title_en' => 'How to Layer Vitamin C in a Morning Routine',
                'title_pl' => 'Jak włączyć witaminę C do porannej rutyny',
                'excerpt_en' => 'A practical guide to pairing serum, SPF, and moisturiser without irritation.',
                'excerpt_pl' => 'Praktyczny przewodnik po łączeniu serum, SPF i kremu bez podrażnień.',
                'content_en' => '<p>Vitamin C works best on clean, dry skin before moisturiser and SPF. Introduce it gradually and avoid stacking too many strong actives at once.</p>',
                'content_pl' => '<p>Witamina C działa najlepiej na czystej, suchej skórze przed kremem i SPF. Wprowadzaj ją stopniowo i nie łącz od razu zbyt wielu mocnych składników.</p>',
                'reading_time' => 4,
                'featured' => true,
                'status' => BlogPostStatusEnum::Published,
                'published_at' => now()->subDays(9),
                'tags' => ['Skincare', 'Vitamin C', 'Routine'],
            ],
            [
                'slug' => 'what-fast-charging-really-means',
                'category' => 'technology',
                'title_en' => 'What Fast Charging Really Means for 30W Accessories',
                'title_pl' => 'Co naprawdę oznacza szybkie ładowanie w akcesoriach 30W',
                'excerpt_en' => 'Not every phone negotiates power the same way. Here is the practical buying checklist.',
                'excerpt_pl' => 'Nie każdy telefon negocjuje moc w ten sam sposób. Oto praktyczna checklista zakupowa.',
                'content_en' => '<p>Check both the charger protocol and the cable. USB-C PD compatibility matters more than the marketing label on the box.</p>',
                'content_pl' => '<p>Sprawdź zarówno protokół ładowarki, jak i przewód. Zgodność z USB-C PD jest ważniejsza niż marketingowa etykieta na pudełku.</p>',
                'reading_time' => 5,
                'featured' => true,
                'status' => BlogPostStatusEnum::Published,
                'published_at' => now()->subDays(6),
                'tags' => ['Electronics', 'USB-C', 'Buying Guide'],
            ],
            [
                'slug' => 'cotton-weights-explained',
                'category' => 'style',
                'title_en' => 'Cotton Weights Explained for Everyday T-Shirts',
                'title_pl' => 'Gramatura bawełny wyjaśniona na przykładzie codziennych T-shirtów',
                'excerpt_en' => 'Why heavier fabric does not always mean a hotter or less comfortable tee.',
                'excerpt_pl' => 'Dlaczego cięższa tkanina nie zawsze oznacza cieplejszy lub mniej wygodny T-shirt.',
                'content_en' => '<p>Fabric weight shapes drape, opacity, and durability. The best choice depends on climate and intended silhouette, not only on GSM.</p>',
                'content_pl' => '<p>Gramatura wpływa na układanie się materiału, krycie i trwałość. Najlepszy wybór zależy od klimatu i sylwetki, a nie tylko od GSM.</p>',
                'reading_time' => 4,
                'featured' => false,
                'status' => BlogPostStatusEnum::Published,
                'published_at' => now()->subDays(4),
                'tags' => ['Apparel', 'Cotton', 'Materials'],
            ],
            [
                'slug' => 'how-to-choose-noise-cancelling-headphones',
                'category' => 'technology',
                'title_en' => 'How to Choose Noise-Cancelling Headphones for Commuting',
                'title_pl' => 'Jak wybrać słuchawki z ANC do codziennych dojazdów',
                'excerpt_en' => 'Fit, clamp force, and transport controls matter as much as ANC depth.',
                'excerpt_pl' => 'Dopasowanie, nacisk pałąka i sterowanie są równie ważne jak samo ANC.',
                'content_en' => '<p>Look at comfort over 60 minutes, USB-C charging speed, and microphone quality before comparing purely on battery claims.</p>',
                'content_pl' => '<p>Sprawdź komfort po 60 minutach noszenia, szybkość ładowania USB-C i jakość mikrofonów, zanim porównasz wyłącznie czas pracy.</p>',
                'reading_time' => 6,
                'featured' => false,
                'status' => BlogPostStatusEnum::Published,
                'published_at' => now()->subDays(2),
                'tags' => ['Headphones', 'ANC', 'Commuting'],
            ],
            [
                'slug' => 'inside-the-summer-content-calendar',
                'category' => 'style',
                'title_en' => 'Inside the Summer Content Calendar',
                'title_pl' => 'Za kulisami letniego kalendarza contentowego',
                'excerpt_en' => 'A draft editorial preview for the next campaign wave.',
                'excerpt_pl' => 'Szkic redakcyjny na następną falę kampanii.',
                'content_en' => '<p>This draft stays in admin until the next release window opens.</p>',
                'content_pl' => '<p>Ten szkic pozostaje w panelu admina do czasu kolejnego okna publikacji.</p>',
                'reading_time' => 3,
                'featured' => false,
                'status' => BlogPostStatusEnum::Draft,
                'published_at' => null,
                'tags' => ['Draft', 'Editorial'],
            ],
            [
                'slug' => 'spf-textures-for-sensitive-skin',
                'category' => 'skincare',
                'title_en' => 'SPF Textures That Work for Sensitive Skin',
                'title_pl' => 'Tekstury SPF, które sprawdzają się przy skórze wrażliwej',
                'excerpt_en' => 'Fluid, cream, or gel? Texture often decides whether protection becomes a habit.',
                'excerpt_pl' => 'Fluid, krem czy żel? To tekstura często decyduje, czy ochrona stanie się nawykiem.',
                'content_en' => '<p>Choose the lightest texture you are willing to reapply. Consistency beats theoretical perfection every time.</p>',
                'content_pl' => '<p>Wybierz najlżejszą teksturę, którą chętnie reaplikujesz. Konsekwencja wygrywa z teoretyczną perfekcją.</p>',
                'reading_time' => 4,
                'featured' => false,
                'status' => BlogPostStatusEnum::Published,
                'published_at' => now()->subDay(),
                'tags' => ['SPF', 'Sensitive Skin'],
            ],
        ];
    }
}
