<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $defaultLocale = config('app.locale', 'en');

        $this->migratePages($defaultLocale);
        $this->migrateBlogPosts($defaultLocale);
        $this->migrateProducts($defaultLocale);
        $this->migrateCategories($defaultLocale);
        $this->migrateBlogs($defaultLocale);
    }

    public function down(): void
    {
        $defaultLocale = config('app.locale', 'en');

        $this->rollbackBlogs($defaultLocale);
        $this->rollbackCategories($defaultLocale);
        $this->rollbackProducts($defaultLocale);
        $this->rollbackBlogPosts($defaultLocale);
        $this->rollbackPages($defaultLocale);
    }

    private function migratePages(string $defaultLocale): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->json('slug_new')->nullable()->after('slug');
        });

        $pages = DB::table('pages')->get(['id', 'slug', 'slug_translations']);
        foreach ($pages as $page) {
            $slugData = [$defaultLocale => $page->slug];
            $translations = json_decode((string) $page->slug_translations, true);
            if (is_array($translations)) {
                foreach ($translations as $locale => $value) {
                    if (is_string($value) && $value !== '') {
                        $slugData[$locale] = $value;
                    }
                }
            }
            DB::table('pages')->where('id', $page->id)->update(['slug_new' => json_encode($slugData, JSON_UNESCAPED_UNICODE)]);
        }

        Schema::table('pages', function (Blueprint $table): void {
            $table->dropUnique('pages_parent_slug_locale_unique');
        });

        Schema::table('pages', function (Blueprint $table): void {
            $table->dropIndex('pages_slug_index');
        });

        Schema::table('pages', function (Blueprint $table): void {
            $table->dropColumn('slug');
            $table->dropColumn('slug_translations');
        });

        Schema::table('pages', function (Blueprint $table): void {
            $table->renameColumn('slug_new', 'slug');
        });

        Schema::table('pages', function (Blueprint $table): void {
            $table->unique(['parent_id', 'locale'], 'pages_parent_locale_unique');
        });
    }

    private function migrateBlogPosts(string $defaultLocale): void
    {
        Schema::table('blog_posts', function (Blueprint $table): void {
            $table->json('slug_new')->nullable()->after('slug');
        });

        $posts = DB::table('blog_posts')->get(['id', 'slug', 'slug_translations']);
        foreach ($posts as $post) {
            $slugData = [$defaultLocale => $post->slug];
            $translations = json_decode((string) $post->slug_translations, true);
            if (is_array($translations)) {
                foreach ($translations as $locale => $value) {
                    if (is_string($value) && $value !== '') {
                        $slugData[$locale] = $value;
                    }
                }
            }
            DB::table('blog_posts')->where('id', $post->id)->update(['slug_new' => json_encode($slugData, JSON_UNESCAPED_UNICODE)]);
        }

        Schema::table('blog_posts', function (Blueprint $table): void {
            $table->dropUnique('blog_posts_slug_unique');
        });

        Schema::table('blog_posts', function (Blueprint $table): void {
            $table->dropColumn('slug');
            $table->dropColumn('slug_translations');
        });

        Schema::table('blog_posts', function (Blueprint $table): void {
            $table->renameColumn('slug_new', 'slug');
        });
    }

    private function migrateProducts(string $defaultLocale): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->json('slug_new')->nullable()->after('slug');
        });

        $products = DB::table('products')->get(['id', 'slug']);
        foreach ($products as $product) {
            $slugData = [$defaultLocale => $product->slug];
            DB::table('products')->where('id', $product->id)->update(['slug_new' => json_encode($slugData, JSON_UNESCAPED_UNICODE)]);
        }

        Schema::table('products', function (Blueprint $table): void {
            $table->dropUnique('products_slug_unique');
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->dropIndex('products_slug_index');
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn('slug');
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->renameColumn('slug_new', 'slug');
        });
    }

    private function migrateCategories(string $defaultLocale): void
    {
        Schema::table('categories', function (Blueprint $table): void {
            $table->json('slug_new')->nullable()->after('slug');
        });

        $categories = DB::table('categories')->get(['id', 'slug']);
        foreach ($categories as $category) {
            $slugData = [$defaultLocale => $category->slug];
            DB::table('categories')->where('id', $category->id)->update(['slug_new' => json_encode($slugData, JSON_UNESCAPED_UNICODE)]);
        }

        Schema::table('categories', function (Blueprint $table): void {
            $table->dropUnique('categories_slug_unique');
        });

        Schema::table('categories', function (Blueprint $table): void {
            $table->dropIndex('categories_slug_index');
        });

        Schema::table('categories', function (Blueprint $table): void {
            $table->dropColumn('slug');
        });

        Schema::table('categories', function (Blueprint $table): void {
            $table->renameColumn('slug_new', 'slug');
        });
    }

    private function migrateBlogs(string $defaultLocale): void
    {
        Schema::table('blogs', function (Blueprint $table): void {
            $table->json('slug_new')->nullable()->after('slug');
        });

        $blogs = DB::table('blogs')->get(['id', 'slug']);
        foreach ($blogs as $blog) {
            $slugData = [$defaultLocale => $blog->slug];
            DB::table('blogs')->where('id', $blog->id)->update(['slug_new' => json_encode($slugData, JSON_UNESCAPED_UNICODE)]);
        }

        Schema::table('blogs', function (Blueprint $table): void {
            $table->dropUnique('blogs_slug_unique');
        });

        Schema::table('blogs', function (Blueprint $table): void {
            $table->dropColumn('slug');
        });

        Schema::table('blogs', function (Blueprint $table): void {
            $table->renameColumn('slug_new', 'slug');
        });
    }

    private function rollbackPages(string $defaultLocale): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->string('slug_old')->nullable()->after('slug');
            $table->json('slug_translations')->nullable()->after('slug_old');
        });

        $pages = DB::table('pages')->get(['id', 'slug']);
        foreach ($pages as $page) {
            $slugData = json_decode((string) $page->slug, true) ?? [];
            $canonical = $slugData[$defaultLocale] ?? (array_values($slugData)[0] ?? '');
            $translations = array_filter(
                $slugData,
                fn (string $key): bool => $key !== $defaultLocale,
                ARRAY_FILTER_USE_KEY,
            );
            DB::table('pages')->where('id', $page->id)->update([
                'slug_old' => $canonical,
                'slug_translations' => ! empty($translations) ? json_encode($translations, JSON_UNESCAPED_UNICODE) : null,
            ]);
        }

        Schema::table('pages', function (Blueprint $table): void {
            $table->dropUnique('pages_parent_locale_unique');
        });

        Schema::table('pages', function (Blueprint $table): void {
            $table->dropColumn('slug');
        });

        Schema::table('pages', function (Blueprint $table): void {
            $table->renameColumn('slug_old', 'slug');
        });

        Schema::table('pages', function (Blueprint $table): void {
            $table->unique(['parent_id', 'slug', 'locale'], 'pages_parent_slug_locale_unique');
        });
    }

    private function rollbackBlogPosts(string $defaultLocale): void
    {
        Schema::table('blog_posts', function (Blueprint $table): void {
            $table->string('slug_old')->nullable()->after('slug');
            $table->json('slug_translations')->nullable()->after('slug_old');
        });

        $posts = DB::table('blog_posts')->get(['id', 'slug']);
        foreach ($posts as $post) {
            $slugData = json_decode((string) $post->slug, true) ?? [];
            $canonical = $slugData[$defaultLocale] ?? (array_values($slugData)[0] ?? '');
            $translations = array_filter(
                $slugData,
                fn (string $key): bool => $key !== $defaultLocale,
                ARRAY_FILTER_USE_KEY,
            );
            DB::table('blog_posts')->where('id', $post->id)->update([
                'slug_old' => $canonical,
                'slug_translations' => ! empty($translations) ? json_encode($translations, JSON_UNESCAPED_UNICODE) : null,
            ]);
        }

        Schema::table('blog_posts', function (Blueprint $table): void {
            $table->dropColumn('slug');
        });

        Schema::table('blog_posts', function (Blueprint $table): void {
            $table->renameColumn('slug_old', 'slug');
        });

        Schema::table('blog_posts', function (Blueprint $table): void {
            $table->unique('slug');
        });
    }

    private function rollbackProducts(string $defaultLocale): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->string('slug_old')->nullable()->after('slug');
        });

        $products = DB::table('products')->get(['id', 'slug']);
        foreach ($products as $product) {
            $slugData = json_decode((string) $product->slug, true) ?? [];
            $canonical = $slugData[$defaultLocale] ?? (array_values($slugData)[0] ?? '');
            DB::table('products')->where('id', $product->id)->update(['slug_old' => $canonical]);
        }

        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn('slug');
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->renameColumn('slug_old', 'slug');
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->unique('slug');
        });
    }

    private function rollbackCategories(string $defaultLocale): void
    {
        Schema::table('categories', function (Blueprint $table): void {
            $table->string('slug_old')->nullable()->after('slug');
        });

        $categories = DB::table('categories')->get(['id', 'slug']);
        foreach ($categories as $category) {
            $slugData = json_decode((string) $category->slug, true) ?? [];
            $canonical = $slugData[$defaultLocale] ?? (array_values($slugData)[0] ?? '');
            DB::table('categories')->where('id', $category->id)->update(['slug_old' => $canonical]);
        }

        Schema::table('categories', function (Blueprint $table): void {
            $table->dropColumn('slug');
        });

        Schema::table('categories', function (Blueprint $table): void {
            $table->renameColumn('slug_old', 'slug');
        });

        Schema::table('categories', function (Blueprint $table): void {
            $table->unique('slug');
        });
    }

    private function rollbackBlogs(string $defaultLocale): void
    {
        Schema::table('blogs', function (Blueprint $table): void {
            $table->string('slug_old')->nullable()->after('slug');
        });

        $blogs = DB::table('blogs')->get(['id', 'slug']);
        foreach ($blogs as $blog) {
            $slugData = json_decode((string) $blog->slug, true) ?? [];
            $canonical = $slugData[$defaultLocale] ?? (array_values($slugData)[0] ?? '');
            DB::table('blogs')->where('id', $blog->id)->update(['slug_old' => $canonical]);
        }

        Schema::table('blogs', function (Blueprint $table): void {
            $table->dropColumn('slug');
        });

        Schema::table('blogs', function (Blueprint $table): void {
            $table->renameColumn('slug_old', 'slug');
        });

        Schema::table('blogs', function (Blueprint $table): void {
            $table->unique('slug');
        });
    }
};
