<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affiliate_codes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('code')->unique();
            $table->enum('discount_type', ['percentage', 'fixed', 'none'])->default('none');
            $table->unsignedInteger('discount_value')->default(0)->comment('Percentage (0-100) or fixed amount in cents');
            $table->decimal('commission_rate', 5, 2)->default(0)->comment('Commission percentage paid to affiliate');
            $table->unsignedInteger('max_uses')->nullable()->comment('null = unlimited');
            $table->unsignedInteger('uses_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliate_codes');
    }
};
