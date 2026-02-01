<?php

use App\Modules\Core\Domain\Models\Customer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Customer::class)->nullable()->constrained()->nullOnDelete();
            $table->string('email')->unique();
            $table->string('first_name')->nullable();
            $table->string('token')->unique();
            $table->json('tags')->nullable();
            $table->boolean('consent_given')->default(false);
            $table->timestamp('consent_given_at')->nullable();
            $table->string('consent_ip')->nullable();
            $table->string('consent_source')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('unsubscribed_at')->nullable();
            $table->string('unsubscribe_reason')->nullable();
            $table->boolean('is_bounced')->default(false);
            $table->timestamp('bounced_at')->nullable();
            $table->timestamps();

            $table->index('email');
            $table->index('token');
            $table->index(['is_active', 'consent_given']);
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_subscribers');
    }
};
