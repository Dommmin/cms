<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class DemoCmsPageSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PagesDemoSeeder::class);

        $this->updatePageImage('home', null, '/demo/pages/home.svg');
        $this->updatePageImage('blog', 'blog_listing', '/demo/pages/blog.svg');
        $this->updatePageImage('shop', 'product_listing', '/demo/pages/products.svg');
        $this->updatePageImage('categories', 'category_listing', '/demo/pages/categories.svg');
        $this->updatePageImage('brands', 'brand_listing', '/demo/pages/brands.svg');
        $this->updatePageImage('privacy-policy', 'privacy_policy', '/demo/pages/legal.svg');
        $this->updatePageImage('terms-of-service', 'terms_of_service', '/demo/pages/legal.svg');
    }

    private function updatePageImage(string $slug, ?string $systemPageKey, string $image): void
    {
        $page = Page::query()
            ->when($systemPageKey !== null, fn ($query) => $query->where('system_page_key', $systemPageKey))
            ->when($systemPageKey === null, fn ($query) => $query->where('slug->en', $slug))
            ->whereNull('locale')
            ->first();

        if (! $page instanceof Page) {
            return;
        }

        $page->forceFill(['og_image' => $image])->save();
    }
}
