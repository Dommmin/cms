<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dashboard_widgets', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('type'); // stat, chart, table, recent_activity, quick_actions
            $table->string('size')->default('small'); // small, medium, large
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('config')->nullable(); // widget-specific configuration
            $table->json('permissions')->nullable(); // roles/permissions that can see this widget
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dashboard_widgets');
    }
};
