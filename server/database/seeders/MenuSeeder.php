<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\MenuLinkTypeEnum;
use App\Enums\MenuLocationEnum;
use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedHeaderMenu();
        $this->seedFooterMenu();
        $this->seedFooterLegalMenu();
    }

    private function seedHeaderMenu(): void
    {
        $menu = Menu::updateOrCreate(
            ['location' => MenuLocationEnum::Header->value],
            ['name' => 'Header Navigation', 'is_active' => true]
        );

        $menu->allItems()->delete();

        $items = [
            ['label' => ['en' => 'Shop', 'pl' => 'Sklep'], 'url' => '/products', 'position' => 1],
            ['label' => ['en' => 'Blog', 'pl' => 'Blog'], 'url' => '/blog', 'position' => 2],
            ['label' => ['en' => 'FAQ', 'pl' => 'FAQ'], 'url' => '/faq', 'position' => 3],
            ['label' => ['en' => 'About Us', 'pl' => 'O nas'], 'url' => '/about-us', 'position' => 4],
            ['label' => ['en' => 'Contact', 'pl' => 'Kontakt'], 'url' => '/contact', 'position' => 5],
        ];

        foreach ($items as $item) {
            MenuItem::create([
                'menu_id' => $menu->id,
                'parent_id' => null,
                'label' => $item['label'],
                'url' => $item['url'],
                'target' => '_self',
                'link_type' => MenuLinkTypeEnum::Custom,
                'is_active' => true,
                'position' => $item['position'],
            ]);
        }
    }

    private function seedFooterMenu(): void
    {
        $menu = Menu::updateOrCreate(
            ['location' => MenuLocationEnum::Footer->value],
            ['name' => 'Footer Links', 'is_active' => true]
        );

        $menu->allItems()->delete();

        $items = [
            ['label' => ['en' => 'About Us', 'pl' => 'O nas'], 'url' => '/about-us', 'position' => 1],
            ['label' => ['en' => 'Blog', 'pl' => 'Blog'], 'url' => '/blog', 'position' => 2],
            ['label' => ['en' => 'FAQ', 'pl' => 'FAQ'], 'url' => '/faq', 'position' => 3],
            ['label' => ['en' => 'Contact', 'pl' => 'Kontakt'], 'url' => '/contact', 'position' => 4],
        ];

        foreach ($items as $item) {
            MenuItem::create([
                'menu_id' => $menu->id,
                'parent_id' => null,
                'label' => $item['label'],
                'url' => $item['url'],
                'target' => '_self',
                'link_type' => MenuLinkTypeEnum::Custom,
                'is_active' => true,
                'position' => $item['position'],
            ]);
        }
    }

    private function seedFooterLegalMenu(): void
    {
        $menu = Menu::updateOrCreate(
            ['location' => MenuLocationEnum::FooterLegal->value],
            ['name' => 'Footer Legal', 'is_active' => true]
        );

        $menu->allItems()->delete();

        $items = [
            ['label' => ['en' => 'Privacy Policy', 'pl' => 'Polityka prywatności'], 'url' => '/privacy-policy', 'position' => 1],
            ['label' => ['en' => 'Terms of Service', 'pl' => 'Regulamin'], 'url' => '/terms-of-service', 'position' => 2],
            ['label' => ['en' => 'Shipping Policy', 'pl' => 'Polityka wysyłki'], 'url' => '/shipping-policy', 'position' => 3],
            ['label' => ['en' => 'Return Policy', 'pl' => 'Polityka zwrotów'], 'url' => '/return-policy', 'position' => 4],
            ['label' => ['en' => 'Cookie Policy', 'pl' => 'Polityka cookies'], 'url' => '/cookie-policy', 'position' => 5],
        ];

        foreach ($items as $item) {
            MenuItem::create([
                'menu_id' => $menu->id,
                'parent_id' => null,
                'label' => $item['label'],
                'url' => $item['url'],
                'target' => '_self',
                'link_type' => MenuLinkTypeEnum::Custom,
                'is_active' => true,
                'position' => $item['position'],
            ]);
        }
    }
}
