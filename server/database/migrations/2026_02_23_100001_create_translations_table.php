<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translations', function (Blueprint $table): void {
            $table->id();
            $table->string('locale_code', 10);
            $table->string('group', 50);
            $table->string('key', 100);
            $table->text('value');
            $table->timestamps();

            $table->unique(['locale_code', 'group', 'key']);
            $table->index('locale_code');
            $table->index(['locale_code', 'group']);

            $table->foreign('locale_code')->references('code')->on('locales')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
