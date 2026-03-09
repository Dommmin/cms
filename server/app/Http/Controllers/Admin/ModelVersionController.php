<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Concerns\HasVersions;
use App\Http\Controllers\Controller;
use App\Models\ModelVersion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ModelVersionController extends Controller
{
    /**
     * @var array<string, class-string<Model>>
     */
    private array $allowedTypes = [
        'product' => \App\Models\Product::class,
        'blog-post' => \App\Models\BlogPost::class,
        'category' => \App\Models\Category::class,
        // Page uses PageVersion (builder draft/publish system) instead of ModelVersion
    ];

    public function index(Request $request, string $type, int $id): JsonResponse
    {
        $modelClass = $this->resolveModelClass($type);

        $versions = ModelVersion::query()
            ->where('versionable_type', $modelClass)
            ->where('versionable_id', $id)
            ->with('creator:id,name')
            ->orderByDesc('version_number')
            ->limit(50)
            ->get(['id', 'version_number', 'event', 'changes', 'created_by', 'change_note', 'created_at']);

        return response()->json(['versions' => $versions]);
    }

    public function compare(string $type, int $id, int $versionA, int $versionB): JsonResponse
    {
        $modelClass = $this->resolveModelClass($type);

        $a = ModelVersion::query()
            ->where('versionable_type', $modelClass)
            ->where('versionable_id', $id)
            ->where('version_number', $versionA)
            ->firstOrFail();

        $b = ModelVersion::query()
            ->where('versionable_type', $modelClass)
            ->where('versionable_id', $id)
            ->where('version_number', $versionB)
            ->firstOrFail();

        $diff = ModelVersion::diff($a->snapshot ?? [], $b->snapshot ?? []);

        return response()->json([
            'version_a' => $a,
            'version_b' => $b,
            'diff' => $diff,
        ]);
    }

    public function restore(Request $request, string $type, int $id, int $versionNumber): RedirectResponse
    {
        $modelClass = $this->resolveModelClass($type);

        /** @var Model&HasVersions $model */
        $model = $modelClass::findOrFail($id);

        $version = ModelVersion::query()
            ->where('versionable_type', $modelClass)
            ->where('versionable_id', $id)
            ->where('version_number', $versionNumber)
            ->firstOrFail();

        $model->restoreVersion($version);

        return redirect()->back()->with('success', "Restored to version {$versionNumber}");
    }

    /**
     * @return class-string<Model>
     */
    private function resolveModelClass(string $type): string
    {
        abort_unless(isset($this->allowedTypes[$type]), 404, 'Unknown model type');

        return $this->allowedTypes[$type];
    }
}
