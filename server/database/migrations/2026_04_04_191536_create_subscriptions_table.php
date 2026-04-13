<?php

declare(strict_types=1);

use App\Enums\SubscriptionStatusEnum;
use App\Models\Customer;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(Customer::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(SubscriptionPlan::class)->constrained()->cascadeOnDelete();
            $table->string('status')->default(SubscriptionStatusEnum::Active->value);
            $table->timestamp('starts_at');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->timestamp('next_billing_at')->nullable();
            $table->unsignedInteger('billing_price'); // in cents
            $table->string('payment_method_id')->nullable(); // reference to payment method/token
            $table->unsignedSmallInteger('Billing_cycle_count')->default(0);
            $table->boolean('auto_renew')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('expires_at');
            $table->index('next_billing_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
