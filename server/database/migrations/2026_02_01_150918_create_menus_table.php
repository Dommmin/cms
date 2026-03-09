<?php

declare(strict_types=1);

use App\Enums\MenuLocationEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->enum('location', array_column(MenuLocationEnum::cases(), 'value'))->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('location');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
