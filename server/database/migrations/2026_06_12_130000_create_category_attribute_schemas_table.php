<?php

declare(strict_types=1);

use App\Models\Attribute;
use App\Models\Category;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_attribute_schemas', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(Category::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Attribute::class)->constrained()->cascadeOnDelete();
            $table->boolean('is_required')->default(false);
            $table->unsignedTinyInteger('position')->default(0);

            $table->unique(['category_id', 'attribute_id']);
            $table->index(['category_id', 'position']);
        });

        // Safe automatic mapping exists only for categories that already point to a product_type_id.
        $rows = DB::table('categories')
            ->join('product_type_attributes', 'product_type_attributes.product_type_id', '=', 'categories.product_type_id')
            ->select([
                'categories.id as category_id',
                'product_type_attributes.attribute_id',
                'product_type_attributes.is_required',
                'product_type_attributes.position',
            ])
            ->orderBy('categories.id')
            ->orderBy('product_type_attributes.position')
            ->get();

        if ($rows->isEmpty()) {
            return;
        }

        $payload = [];
        $seenPairs = [];

        foreach ($rows as $row) {
            $key = $row->category_id.':'.$row->attribute_id;

            if (isset($seenPairs[$key])) {
                continue;
            }

            $seenPairs[$key] = true;
            $payload[] = [
                'category_id' => $row->category_id,
                'attribute_id' => $row->attribute_id,
                'is_required' => (bool) $row->is_required,
                'position' => $row->position,
            ];
        }

        foreach (array_chunk($payload, 500) as $chunk) {
            DB::table('category_attribute_schemas')->insertOrIgnore($chunk);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('category_attribute_schemas');
    }
};
