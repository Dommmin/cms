<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\MenuLinkTypeEnum;
use App\Enums\MenuLocationEnum;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedHeaderMenu();
        $this->seedFooterMenu();
        $this->seedFooterLegalMenu();
    }

    /**
     * Resolve a Page ID by its canonical (English) slug.
     * Returns null if the page doesn't exist yet (e.g. during partial seeding).
     */
    private function pageId(string $slug): ?int
    {
        return Page::query()->where('slug', $slug)->value('id');
    }

    private function seedHeaderMenu(): void
    {
        $menu = Menu::query()->updateOrCreate(['location' => MenuLocationEnum::Header->value], ['name' => 'Header Navigation', 'is_active' => true]);

        $menu->allItems()->delete();

        $items = [
            // Non-CMS routes — Custom link type, localised by the frontend
            [
                'label' => ['en' => 'Shop', 'pl' => 'Sklep'],
                'url' => '/products',
                'link_type' => MenuLinkTypeEnum::Custom,
                'position' => 1,
            ],
            [
                'label' => ['en' => 'Blog', 'pl' => 'Blog'],
                'url' => '/blog',
                'link_type' => MenuLinkTypeEnum::Custom,
                'position' => 2,
            ],
            // CMS pages — Page link type, resolvedUrl() returns locale-specific slug
            [
                'label' => ['en' => 'FAQ', 'pl' => 'FAQ'],
                'page_slug' => 'faq',
                'link_type' => MenuLinkTypeEnum::Page,
                'position' => 3,
            ],
            [
                'label' => ['en' => 'About Us', 'pl' => 'O nas'],
                'page_slug' => 'about-us',
                'link_type' => MenuLinkTypeEnum::Page,
                'position' => 4,
            ],
            [
                'label' => ['en' => 'Contact', 'pl' => 'Kontakt'],
                'page_slug' => 'contact',
                'link_type' => MenuLinkTypeEnum::Page,
                'position' => 5,
            ],
        ];

        foreach ($items as $item) {
            MenuItem::query()->create([
                'menu_id' => $menu->id,
                'parent_id' => null,
                'label' => $item['label'],
                'url' => $item['url'] ?? null,
                'target' => '_self',
                'link_type' => $item['link_type'],
                'linked_entity_id' => isset($item['page_slug']) ? $this->pageId($item['page_slug']) : null,
                'is_active' => true,
                'position' => $item['position'],
            ]);
        }
    }

    private function seedFooterMenu(): void
    {
        $menu = Menu::query()->updateOrCreate(['location' => MenuLocationEnum::Footer->value], ['name' => 'Footer Links', 'is_active' => true]);

        $menu->allItems()->delete();

        $items = [
            [
                'label' => ['en' => 'About Us', 'pl' => 'O nas'],
                'page_slug' => 'about-us',
                'link_type' => MenuLinkTypeEnum::Page,
                'position' => 1,
            ],
            [
                'label' => ['en' => 'Blog', 'pl' => 'Blog'],
                'url' => '/blog',
                'link_type' => MenuLinkTypeEnum::Custom,
                'position' => 2,
            ],
            [
                'label' => ['en' => 'FAQ', 'pl' => 'FAQ'],
                'page_slug' => 'faq',
                'link_type' => MenuLinkTypeEnum::Page,
                'position' => 3,
            ],
            [
                'label' => ['en' => 'Contact', 'pl' => 'Kontakt'],
                'page_slug' => 'contact',
                'link_type' => MenuLinkTypeEnum::Page,
                'position' => 4,
            ],
        ];

        foreach ($items as $item) {
            MenuItem::query()->create([
                'menu_id' => $menu->id,
                'parent_id' => null,
                'label' => $item['label'],
                'url' => $item['url'] ?? null,
                'target' => '_self',
                'link_type' => $item['link_type'],
                'linked_entity_id' => isset($item['page_slug']) ? $this->pageId($item['page_slug']) : null,
                'is_active' => true,
                'position' => $item['position'],
            ]);
        }
    }

    private function seedFooterLegalMenu(): void
    {
        $menu = Menu::query()->updateOrCreate(['location' => MenuLocationEnum::FooterLegal->value], ['name' => 'Footer Legal', 'is_active' => true]);

        $menu->allItems()->delete();

        $items = [
            [
                'label' => ['en' => 'Privacy Policy', 'pl' => 'Polityka prywatności'],
                'page_slug' => 'privacy-policy',
                'link_type' => MenuLinkTypeEnum::Page,
                'position' => 1,
            ],
            [
                'label' => ['en' => 'Terms of Service', 'pl' => 'Regulamin'],
                'page_slug' => 'terms-of-service',
                'link_type' => MenuLinkTypeEnum::Page,
                'position' => 2,
            ],
            [
                'label' => ['en' => 'Shipping Policy', 'pl' => 'Polityka wysyłki'],
                'page_slug' => 'shipping-policy',
                'link_type' => MenuLinkTypeEnum::Page,
                'position' => 3,
            ],
            [
                'label' => ['en' => 'Return Policy', 'pl' => 'Polityka zwrotów'],
                'page_slug' => 'return-policy',
                'link_type' => MenuLinkTypeEnum::Page,
                'position' => 4,
            ],
            [
                'label' => ['en' => 'Cookie Policy', 'pl' => 'Polityka cookies'],
                'page_slug' => 'cookie-policy',
                'link_type' => MenuLinkTypeEnum::Page,
                'position' => 5,
            ],
            [
                'label' => ['en' => 'Online Dispute Resolution (ODR)', 'pl' => 'Platforma ODR (spory konsumenckie)'],
                'url' => 'https://ec.europa.eu/consumers/odr',
                'link_type' => MenuLinkTypeEnum::Custom,
                'target' => '_blank',
                'position' => 6,
            ],
        ];

        foreach ($items as $item) {
            MenuItem::query()->create([
                'menu_id' => $menu->id,
                'parent_id' => null,
                'label' => $item['label'],
                'url' => $item['url'] ?? null,
                'target' => $item['target'] ?? '_self',
                'link_type' => $item['link_type'],
                'linked_entity_id' => isset($item['page_slug']) ? $this->pageId($item['page_slug']) : null,
                'is_active' => true,
                'position' => $item['position'],
            ]);
        }
    }
}
