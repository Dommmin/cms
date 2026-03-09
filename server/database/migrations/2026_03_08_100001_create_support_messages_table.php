<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('conversation_id')->constrained('support_conversations')->cascadeOnDelete();
            $table->string('sender_type')->default('customer');
            $table->string('sender_name');
            $table->text('body');
            $table->boolean('is_internal')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('conversation_id');
            $table->index('sender_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_messages');
    }
};
