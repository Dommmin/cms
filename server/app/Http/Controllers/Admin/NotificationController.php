<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductReview;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NotificationController extends Controller
{
    private const LOW_STOCK_THRESHOLD = 5;

    public function index(): JsonResponse
    {
        $notifications = $this->buildNotifications();

        return response()->json([
            'data' => $notifications->values(),
            'unread_count' => $notifications->count(),
        ]);
    }

    public function stream(): StreamedResponse
    {
        return response()->stream(function (): void {
            set_time_limit(0);

            $startTime = time();
            $maxDuration = 25;
            $pollInterval = 3;
            $lastSentHash = '';

            while ((time() - $startTime) < $maxDuration) {
                if (connection_aborted()) {
                    break;
                }

                $notifications = $this->buildNotifications();
                $hash = md5(serialize($notifications->pluck('id')->sort()->values()->toArray()));

                if ($hash !== $lastSentHash) {
                    $lastSentHash = $hash;
                    echo 'event: notifications'."\n";
                    echo 'data: '.json_encode([
                        'data' => $notifications->values(),
                        'unread_count' => $notifications->count(),
                    ])."\n\n";
                    ob_flush();
                    flush();
                }

                sleep($pollInterval);
            }

            // Signal the client to reconnect immediately
            echo 'event: reconnect'."\n";
            echo 'data: {}'."\n\n";
            ob_flush();
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-store',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    private function buildNotifications(): \Illuminate\Support\Collection
    {
        $notifications = collect();

        $newOrders = Order::query()
            ->where('created_at', '>=', now()->subHour())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        foreach ($newOrders as $order) {
            $notifications->push([
                'id' => "order-{$order->id}",
                'type' => 'new_order',
                'title' => "New order #{$order->reference_number}",
                'message' => 'A new order was placed.',
                'created_at' => $order->created_at->toISOString(),
                'url' => "/admin/ecommerce/orders/{$order->id}",
            ]);
        }

        $pendingReviews = ProductReview::query()
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        foreach ($pendingReviews as $review) {
            $notifications->push([
                'id' => "review-{$review->id}",
                'type' => 'pending_review',
                'title' => 'Review awaiting approval',
                'message' => "\"{$review->title}\" — {$review->rating}/5",
                'created_at' => $review->created_at->toISOString(),
                'url' => '/admin/ecommerce/reviews',
            ]);
        }

        $lowStock = ProductVariant::query()
            ->where('stock_quantity', '<=', self::LOW_STOCK_THRESHOLD)
            ->where('stock_quantity', '>', 0)
            ->where('is_active', true)
            ->with('product:id,name')
            ->orderBy('stock_quantity')
            ->limit(5)
            ->get();

        foreach ($lowStock as $variant) {
            $notifications->push([
                'id' => "stock-{$variant->id}",
                'type' => 'low_stock',
                'title' => 'Low stock alert',
                'message' => ($variant->product?->name ?? "Variant #{$variant->id}")." — {$variant->stock_quantity} left",
                'created_at' => now()->toISOString(),
                'url' => '/admin/ecommerce/products',
            ]);
        }

        return $notifications;
    }
}
