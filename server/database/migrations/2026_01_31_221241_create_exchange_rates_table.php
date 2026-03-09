<?php

declare(strict_types=1);

use App\Models\Currency;
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
        Schema::create('exchange_rates', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(Currency::class)->constrained()->cascadeOnDelete();
            $table->decimal('rate', 10, 6);                    // 1 PLN = X currency
            $table->enum('source', ['manual', 'api'])->default('manual');
            $table->timestamp('fetched_at');                   // Kiedy pobrano/ustawiono
            $table->timestamps();

            // Zawsze wybieramy najnowszy rate dla danej walut
            $table->index(['currency_id', 'fetched_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};
