<?php

declare(strict_types=1);

use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_sends', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(NewsletterCampaign::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(NewsletterSubscriber::class)->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed', 'bounced'])->default('pending');
            $table->string('message_id')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamps();

            $table->unique(['newsletter_campaign_id', 'newsletter_subscriber_id'], 'news_sends_camp_sub_unique');
            $table->index('newsletter_campaign_id');
            $table->index('newsletter_subscriber_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_sends');
    }
};
