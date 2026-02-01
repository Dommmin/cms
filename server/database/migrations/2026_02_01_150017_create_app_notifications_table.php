<?php

use App\Enums\NotificationChannel;
use App\Enums\NotificationStatus;
use App\Enums\NotificationType;
use App\Modules\Core\Domain\Models\Customer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Customer::class)->constrained()->cascadeOnDelete();
            $table->enum('type', array_column(NotificationType::cases(), 'value'));
            $table->enum('channel', array_column(NotificationChannel::cases(), 'value'));
            $table->enum('status', array_column(NotificationStatus::cases(), 'value'))->default(NotificationStatus::Pending->value);
            $table->enum('related_model', ['order', 'return', 'review', 'product'])->nullable();
            $table->unsignedBigInteger('related_model_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index('customer_id');
            $table->index(['customer_id', 'type']);
            $table->index('status');
            $table->index(['related_model', 'related_model_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
    }
};
