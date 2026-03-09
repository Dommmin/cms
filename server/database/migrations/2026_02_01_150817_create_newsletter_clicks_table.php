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
        Schema::create('newsletter_clicks', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(NewsletterCampaign::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(NewsletterSubscriber::class)->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->string('tracking_token')->unique();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('clicked_at');

            $table->index(['newsletter_campaign_id', 'newsletter_subscriber_id'], 'news_clicks_camp_sub_idx');
            $table->index('tracking_token');
            $table->index('newsletter_campaign_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_clicks');
    }
};
