<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\ProductDownload;
use App\Models\ProductDownloadEvent;
use App\Models\ProductDownloadLink;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class DownloadsController extends ApiController
{
    /**
     * List digital files available for download.
     */
    public function show(string $token): JsonResponse
    {
        /** @var ProductDownloadLink|null $link */
        $link = ProductDownloadLink::query()
            ->where('token', $token)
            ->first();

        abort_unless($link instanceof ProductDownloadLink, 404, __('downloads.invalid_token', [], 'The provided download token is invalid.'));

        abort_if($link->isExpired(), 403, __('downloads.link_expired', [], 'This download link has expired.'));

        abort_if($link->isDownloadLimitReached(), 403, __('downloads.limit_exceeded', [], 'The download limit for this link has been exceeded.'));

        $variant = $link->variant;
        /** @var Collection<int, ProductDownload> $downloads */
        $downloads = $variant->downloads()->orderBy('position')->get();

        return $this->ok([
            'token' => $link->token,
            'expires_at' => $link->expires_at?->toIso8601String(),
            'max_downloads' => $link->max_downloads,
            'download_count' => $link->download_count,
            'variant' => [
                'id' => $variant->id,
                'name' => $variant->name,
                'sku' => $variant->sku,
            ],
            'files' => $downloads->map(fn (ProductDownload $download): array => [
                'id' => $download->id,
                'name' => $download->name,
                'file_name' => $download->file_name,
                'file_size' => $download->file_size,
                'formatted_file_size' => $download->getFormattedFileSize(),
                'download_url' => route('api.v1.downloads.files', [$link->token, $download->id]),
            ])->all(),
        ]);
    }

    /**
     * Stream or redirect to secure digital file.
     */
    public function download(string $token, int $fileId): Response
    {
        /** @var ProductDownloadLink|null $link */
        $link = ProductDownloadLink::query()
            ->where('token', $token)
            ->first();

        abort_unless($link instanceof ProductDownloadLink, 404, __('downloads.invalid_token', [], 'The provided download token is invalid.'));

        abort_if($link->isExpired(), 403, __('downloads.link_expired', [], 'This download link has expired.'));

        abort_if($link->isDownloadLimitReached(), 403, __('downloads.limit_exceeded', [], 'The download limit for this link has been exceeded.'));

        /** @var ProductDownload|null $download */
        $download = ProductDownload::query()
            ->where('id', $fileId)
            ->where('product_variant_id', $link->product_variant_id)
            ->first();

        abort_unless($download instanceof ProductDownload, 404, __('downloads.file_not_found_for_product', [], 'The file does not exist or does not belong to this product.'));

        // Increment download count
        $link->incrementDownloadCount();

        // Log the download event
        ProductDownloadEvent::query()->create([
            'product_download_link_id' => $link->id,
            'user_id' => auth()->id() ?? ($link->orderItem?->order?->customer?->user_id),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Stream or redirect
        if (str_starts_with($download->file_path, 'http')) {
            return redirect()->away($download->file_path);
        }

        abort_unless(Storage::exists($download->file_path), 404, __('downloads.file_not_on_server', [], 'The file was not found on the server.'));

        $headers = [];
        if ($download->mime_type) {
            $headers['Content-Type'] = $download->mime_type;
        }

        return Storage::download($download->file_path, $download->file_name, $headers);
    }
}
