<?php

declare(strict_types=1);

use App\Enums\SettingTypeEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table): void {
            $table->id();
            $table->string('group');
            $table->string('key');
            $table->json('value')->nullable();
            $table->enum('type', array_column(SettingTypeEnum::cases(), 'value'))->default(SettingTypeEnum::String->value);
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->unique(['group', 'key']);
            $table->index('group');
            $table->index(['group', 'is_public']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
