<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Page Modules - definiuje dostępne moduły (ecommerce, job offers, etc.)
        Schema::create('page_modules', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique(); // 'ecommerce', 'job_offers', 'blog'
            $table->string('name'); // "E-commerce"
            $table->string('icon', 100)->nullable();
            $table->text('description')->nullable();

            // Routing configuration
            $table->boolean('has_list_page')->default(true); // czy ma stronę listy
            $table->boolean('has_detail_page')->default(true); // czy ma stronę detali
            $table->string('list_route_pattern')->nullable(); // '/shop', '/offers'
            $table->string('detail_route_pattern')->nullable(); // '/shop/{slug}', '/offers/{slug}'

            // Model binding
            $table->string('model_class')->nullable(); // Product::class, JobOffer::class
            $table->string('route_key_name')->default('slug'); // pole używane w URL

            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(true);
            $table->timestamps();
        });

        // Module Layouts - layouty dla każdego modułu
        Schema::create('module_layouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_module_id')->constrained('page_modules')->cascadeOnDelete();
            $table->string('key', 100); // 'grid', 'list', 'card'
            $table->string('name'); // "Grid View"
            $table->string('type'); // 'list' or 'detail'
            $table->string('component_name'); // React component: 'ProductGridLayout'
            $table->string('preview_image')->nullable();
            $table->json('configuration_schema')->nullable(); // JSON Schema dla ustawień layoutu
            $table->json('default_configuration')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['page_module_id', 'key']);
        });

        // Rozszerz tabelę pages o moduły
        Schema::table('pages', function (Blueprint $table) {
            // Check if columns already exist to avoid duplicates
            // page_type, module_name, module_config, published_at, published_version_id już istnieją

            // Module configuration - nowe kolumny
            $table->foreignId('page_module_id')->nullable()->after('module_name')
                ->constrained('page_modules')->nullOnDelete();
            $table->string('module_type', 20)->nullable()->after('page_module_id');
            // 'list' or 'detail'
            $table->foreignId('module_layout_id')->nullable()->after('module_type')
                ->constrained('module_layouts')->nullOnDelete();
            $table->json('module_configuration')->nullable()->after('module_layout_id');

            // Preview & Draft system
            $table->boolean('is_draft')->default(true)->after('is_published');

            // Auto-generated pages (np. automatyczne karty produktów)
            $table->boolean('is_auto_generated')->default(false)->after('draft_version_id');
            $table->string('auto_gen_pattern')->nullable()->after('is_auto_generated');
            // pattern: '/shop/{product:slug}'
        });

        // Rozszerz page_versions o dodatkowe pola (jeśli jeszcze ich nie ma)
        if (! Schema::hasColumn('page_versions', 'is_published')) {
            Schema::table('page_versions', function (Blueprint $table) {
                $table->boolean('is_published')->default(false)->after('change_note');
                $table->timestamp('published_at')->nullable()->after('is_published');
            });
        }

        // page_preview_tokens już istnieje, więc pomijamy tworzenie
    }

    public function down(): void
    {
        // Rollback page_versions changes
        if (Schema::hasColumn('page_versions', 'is_published')) {
            Schema::table('page_versions', function (Blueprint $table) {
                $table->dropColumn(['is_published', 'published_at']);
            });
        }

        Schema::table('pages', function (Blueprint $table) {
            $table->dropForeign(['page_module_id']);
            $table->dropForeign(['module_layout_id']);
            $table->dropColumn([
                'page_module_id',
                'module_type',
                'module_layout_id',
                'module_configuration',
                'is_draft',
                'is_auto_generated',
                'auto_gen_pattern',
            ]);
        });

        Schema::dropIfExists('module_layouts');
        Schema::dropIfExists('page_modules');
    }
};
