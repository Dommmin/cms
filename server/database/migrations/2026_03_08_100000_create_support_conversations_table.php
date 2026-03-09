<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_conversations', function (Blueprint $table): void {
            $table->id();
            $table->uuid('token')->unique();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email')->nullable();
            $table->string('name')->nullable();
            $table->string('subject');
            $table->string('status')->default('open');
            $table->string('channel')->default('widget');
            $table->timestamp('last_reply_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('token');
            $table->index('customer_id');
            $table->index('assigned_to');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_conversations');
    }
};
