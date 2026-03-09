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
        $order->loadMissing(['items', 'billingAddress', 'shippingAddress', 'customer']);

        return Pdf::view('pdf.invoice', ['order' => $order])
            ->name("invoice-{$order->reference_number}.pdf")
            ->download()
            ->toResponse(request());
    }

    public function save(Order $order, string $path): void
    {
        $order->loadMissing(['items', 'billingAddress', 'shippingAddress', 'customer']);

        Pdf::view('pdf.invoice', ['order' => $order])
            ->save($path);
    }
}
