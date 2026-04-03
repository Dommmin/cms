<?php

declare(strict_types=1);

use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_downloads', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(ProductVariant::class)->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('file_path');
            $table->string('file_name');
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index('product_variant_id');
        });

        Schema::create('product_download_links', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_item_id')->nullable()->constrained('order_items')->nullOnDelete();
            $table->foreignIdFor(ProductVariant::class)->constrained()->cascadeOnDelete();
            $table->string('token', 64)->unique();
            $table->timestamp('expires_at')->nullable();
            $table->unsignedInteger('download_count')->default(0);
            $table->unsignedInteger('max_downloads')->nullable();
            $table->timestamps();

            $table->index('token');
            $table->index(['order_item_id', 'product_variant_id']);
        });

        Schema::create('product_download_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_download_link_id')
                ->constrained('product_download_links')
                ->cascadeOnDelete();
            $table->foreignIdFor(User::class)->nullable()->constrained()->nullOnDelete();
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index('product_download_link_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_download_events');
        Schema::dropIfExists('product_download_links');
        Schema::dropIfExists('product_downloads');
    }
};
