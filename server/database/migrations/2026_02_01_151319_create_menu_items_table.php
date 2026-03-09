<?php

declare(strict_types=1);

use App\Enums\MenuLinkTypeEnum;
use App\Models\Menu;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(Menu::class)->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->references('id')->on('menu_items')->cascadeOnDelete();
            $table->string('label');
            $table->string('url')->nullable();
            $table->enum('target', ['_self', '_blank'])->default('_self');
            $table->enum('link_type', array_column(MenuLinkTypeEnum::cases(), 'value'))->default(MenuLinkTypeEnum::Custom->value);
            $table->unsignedBigInteger('linked_entity_id')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedTinyInteger('position')->default(0);
            $table->timestamps();

            $table->index('menu_id');
            $table->index(['menu_id', 'parent_id']);
            $table->index(['menu_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
