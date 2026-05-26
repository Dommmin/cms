<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        $settings = [
            ['group' => 'search', 'key' => 'index_products', 'label' => 'Index Products', 'type' => 'boolean', 'value' => json_encode(true), 'description' => 'Include products in the search index (Typesense).', 'is_public' => true],
            ['group' => 'search', 'key' => 'index_categories', 'label' => 'Index Categories', 'type' => 'boolean', 'value' => json_encode(true), 'description' => 'Include categories in the search index (Typesense).', 'is_public' => true],
            ['group' => 'search', 'key' => 'index_blog_posts', 'label' => 'Index Blog Posts', 'type' => 'boolean', 'value' => json_encode(true), 'description' => 'Include blog posts in the search index (Typesense).', 'is_public' => true],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->insertOrIgnore([
                'group' => $setting['group'],
                'key' => $setting['key'],
                'label' => $setting['label'],
                'type' => $setting['type'],
                'value' => $setting['value'],
                'description' => $setting['description'],
                'is_public' => $setting['is_public'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('settings')->where('group', 'search')->delete();
    }
};
