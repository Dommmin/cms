<?php

declare(strict_types=1);

use App\Models\NewsletterSegment;
use App\Models\NewsletterSubscriber;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_segment_subscriber', function (Blueprint $table): void {
            $table->foreignIdFor(NewsletterSubscriber::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(NewsletterSegment::class)->constrained()->cascadeOnDelete();
            $table->primary(['newsletter_subscriber_id', 'newsletter_segment_id'], 'news_seg_sub_primary');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_segment_subscriber');
    }
};
