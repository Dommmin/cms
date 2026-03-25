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
                $query->where('name', 'like', '%'.$this->request->search.'%')
                    ->orWhere('file_name', 'like', '%'.$this->request->search.'%');
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
                $query->where('name', 'like', '%'.$this->request->search.'%')
                    ->orWhere('file_name', 'like', '%'.$this->request->search.'%');
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

        return $item;
    }
}
