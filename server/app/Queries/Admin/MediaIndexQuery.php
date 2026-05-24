<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

final readonly class MediaIndexQuery
{
    public function __construct(private Request $request) {}

    public function execute(): LengthAwarePaginator
    {
        $media = Media::query()
            ->when($this->request->search, function ($query): void {
                $query->where(function ($query): void {
                    $query->where('name', 'like', '%'.$this->request->search.'%')
                        ->orWhere('file_name', 'like', '%'.$this->request->search.'%');
                });
            })
            ->when($this->mimeTypes() !== [], function ($query): void {
                $query->where(function ($query): void {
                    foreach ($this->mimeTypes() as $mimeType) {
                        if (str_ends_with($mimeType, '/*')) {
                            $query->orWhere('mime_type', 'like', str_replace('/*', '/%', $mimeType));

                            continue;
                        }

                        $query->orWhere('mime_type', $mimeType);
                    }
                });
            })
            ->when($this->request->extension, function ($query): void {
                $query->where('file_name', 'like', '%.'.$this->request->extension);
            })->latest()
            ->paginate($this->request->per_page ?? 20)
            ->withQueryString();

        $media->getCollection()->transform(fn (Media $item): Media => $this->transformItem($item));

        return $media;
    }

    public function executeForSearch(): LengthAwarePaginator
    {
        $media = Media::query()
            ->when($this->request->search, function ($query): void {
                $query->where(function ($query): void {
                    $query->where('name', 'like', '%'.$this->request->search.'%')
                        ->orWhere('file_name', 'like', '%'.$this->request->search.'%');
                });
            })
            ->when($this->mimeTypes() !== [], function ($query): void {
                $query->where(function ($query): void {
                    foreach ($this->mimeTypes() as $mimeType) {
                        if (str_ends_with($mimeType, '/*')) {
                            $query->orWhere('mime_type', 'like', str_replace('/*', '/%', $mimeType));

                            continue;
                        }

                        $query->orWhere('mime_type', $mimeType);
                    }
                });
            })
            ->when($this->request->extension, function ($query): void {
                $query->where('file_name', 'like', '%.'.$this->request->extension);
            })->latest()
            ->paginate($this->request->per_page ?? 40)
            ->withQueryString();

        $media->getCollection()->transform(fn (Media $item): Media => $this->transformItem($item));

        return $media;
    }

    private function transformItem(Media $item): Media
    {
        $thumbnailUrl = $item->hasGeneratedConversion('thumbnail')
            ? $item->getUrl('thumbnail')
            : null;

        $item->setAttribute('url', $item->getUrl());
        $item->setAttribute('thumbnail_url', $thumbnailUrl);
        $item->setAttribute('thumb_url', $thumbnailUrl);
        $item->setAttribute('alt', (string) $item->getCustomProperty('alt', ''));
        $item->setAttribute('caption', $item->getCustomProperty('caption'));
        $item->setAttribute('description', $item->getCustomProperty('description'));
        $item->setAttribute('credit', $item->getCustomProperty('author'));
        $item->setAttribute('width', $item->getCustomProperty('width'));
        $item->setAttribute('height', $item->getCustomProperty('height'));
        $item->setAttribute('crop_of', $item->getCustomProperty('crop_of'));
        $item->setAttribute('crop_params', $item->getCustomProperty('crop_params'));
        $item->setAttribute('crop_variant', $item->getCustomProperty('crop_variant'));
        $item->setAttribute('focal_point', $item->getCustomProperty('focal_point'));
        $item->setAttribute('crop_variants', $this->cropVariants($item));

        return $item;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function cropVariants(Media $item): array
    {
        return Media::query()
            ->where('model_type', $item->model_type)
            ->where('model_id', $item->model_id)
            ->where('custom_properties->crop_of', (string) $item->id)
            ->orderByDesc('id')
            ->get()
            ->map(fn (Media $variant): array => [
                'id' => $variant->id,
                'url' => $variant->getUrl(),
                'label' => (string) $variant->getCustomProperty('crop_variant', 'crop'),
                'variant' => (string) $variant->getCustomProperty('crop_variant', 'crop'),
                'width' => $variant->getCustomProperty('width'),
                'height' => $variant->getCustomProperty('height'),
                'focal_point' => $variant->getCustomProperty('focal_point'),
            ])
            ->all();
    }

    /**
     * @return array<int, string>
     */
    private function mimeTypes(): array
    {
        $mimeTypes = $this->request->input('mime_types', []);

        if (is_string($mimeTypes)) {
            return [$mimeTypes];
        }

        if (! is_array($mimeTypes)) {
            return [];
        }

        return array_values(array_filter($mimeTypes, is_string(...)));
    }
}
