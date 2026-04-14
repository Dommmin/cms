<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->string('approval_status')->default('draft')->after('is_published');
            $table->foreignId('reviewer_id')->nullable()->after('approval_status')->constrained('users')->nullOnDelete();
            $table->text('review_note')->nullable()->after('reviewer_id');
            $table->timestamp('submitted_for_review_at')->nullable()->after('review_note');
            $table->timestamp('approved_at')->nullable()->after('submitted_for_review_at');
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('reviewer_id');
            $table->dropColumn(['approval_status', 'review_note', 'submitted_for_review_at', 'approved_at']);
        });
    }
};
