<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('return_status_history', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('return_id')->constrained('returns')->cascadeOnDelete();
            $table->string('previous_status');
            $table->string('new_status');
            $table->enum('changed_by', ['system', 'admin', 'customer'])->default('system');
            $table->text('notes')->nullable();
            $table->timestamp('changed_at');

            $table->index('return_id');
            $table->index(['return_id', 'changed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('return_status_history');
    }
};
