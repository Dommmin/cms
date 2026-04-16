<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use Spatie\LaravelPdf\Facades\Pdf;
use Symfony\Component\HttpFoundation\Response;

class InvoiceService
{
    public function download(Order $order): Response
    {
        $this->ensureInvoiceNumber($order);

        $order->loadMissing(['items', 'billingAddress', 'shippingAddress', 'customer']);

        return Pdf::view('pdf.invoice', ['order' => $order])
            ->name(sprintf('invoice-%s.pdf', $order->invoice_number ?? $order->reference_number))
            ->download()
            ->toResponse(request());
    }

    public function save(Order $order, string $path): void
    {
        $this->ensureInvoiceNumber($order);

        $order->loadMissing(['items', 'billingAddress', 'shippingAddress', 'customer']);

        Pdf::view('pdf.invoice', ['order' => $order])
            ->save($path);
    }

    /**
     * Generate a sequential invoice number: FV/YYYY/NNNNN
     * Called once on first download and persisted.
     */
    public function ensureInvoiceNumber(Order $order): void
    {
        if ($order->invoice_number !== null) {
            return;
        }

        $order->invoice_number = $this->generateInvoiceNumber();
        $order->invoice_issued_at = now();
        $order->saveQuietly();
    }

    private function generateInvoiceNumber(): string
    {
        $year = (int) now()->format('Y');

        $last = Order::query()
            ->whereYear('invoice_issued_at', $year)
            ->whereNotNull('invoice_number')
            ->lockForUpdate()
            ->count();

        return sprintf('FV/%d/%05d', $year, $last + 1);
    }
}
