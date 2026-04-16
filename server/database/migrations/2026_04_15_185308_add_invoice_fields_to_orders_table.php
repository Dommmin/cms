<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Sequential invoice number: FV/2026/00001
            $table->string('invoice_number')->nullable()->unique()->after('reference_number');
            $table->timestamp('invoice_issued_at')->nullable()->after('invoice_number');
            // NIP/VAT for B2B invoices
            $table->string('buyer_vat_id')->nullable()->after('invoice_issued_at');
            $table->string('buyer_company_name')->nullable()->after('buyer_vat_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['invoice_number', 'invoice_issued_at', 'buyer_vat_id', 'buyer_company_name']);
        });
    }
};
