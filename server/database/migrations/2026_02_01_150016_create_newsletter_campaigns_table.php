<?php

use App\Enums\AudienceType;
use App\Enums\CampaignStatus;
use App\Enums\CampaignTrigger;
use App\Enums\CampaignType;
use App\Modules\Newsletter\Domain\Models\NewsletterSegment;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subject');
            $table->string('preview_text')->nullable();
            $table->string('sender_name');
            $table->string('sender_email');
            $table->text('html_content');
            $table->text('plain_text_content')->nullable();
            $table->enum('audience_type', array_column(AudienceType::cases(), 'value'))->default(AudienceType::All->value);
            $table->foreignIdFor(NewsletterSegment::class)->nullable()->constrained()->nullOnDelete();
            $table->json('target_tags')->nullable();
            $table->enum('type', array_column(CampaignType::cases(), 'value'))->default(CampaignType::Broadcast->value);
            $table->enum('status', array_column(CampaignStatus::cases(), 'value'))->default(CampaignStatus::Draft->value);
            $table->enum('trigger', array_column(CampaignTrigger::cases(), 'value'))->nullable();
            $table->unsignedSmallInteger('trigger_delay_hours')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_sending_at')->nullable();
            $table->timestamp('finished_sending_at')->nullable();
            $table->unsignedInteger('total_recipients')->default(0);
            $table->unsignedInteger('total_sent')->default(0);
            $table->unsignedInteger('total_delivered')->default(0);
            $table->unsignedInteger('total_opened')->default(0);
            $table->unsignedInteger('total_clicked')->default(0);
            $table->unsignedInteger('total_bounced')->default(0);
            $table->unsignedInteger('total_unsubscribed')->default(0);
            $table->timestamps();

            $table->index('status');
            $table->index('type');
            $table->index('scheduled_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_campaigns');
    }
};
