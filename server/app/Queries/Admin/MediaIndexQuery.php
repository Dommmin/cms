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
        $item->url = $item->getUrl();
        $item->thumbnail_url = $item->hasGeneratedConversion('thumbnail')
            ? $item->getUrl('thumbnail')
            : null;
        $item->thumb_url = $item->thumbnail_url;
        $item->alt = (string) $item->getCustomProperty('alt', '');
        $item->caption = $item->getCustomProperty('caption');
        $item->description = $item->getCustomProperty('description');
        $item->credit = $item->getCustomProperty('author');
        $item->width = $item->getCustomProperty('width');
        $item->height = $item->getCustomProperty('height');

        return $item;
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
