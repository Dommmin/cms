<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\ProductVariant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProductRestockedMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(public readonly ProductVariant $variant) {}

    public function envelope(): Envelope
    {
        $this->variant->loadMissing('product');
        $productName = $this->variant->product->name ?? 'Product';

        return new Envelope(
            subject: sprintf('Produkt %s jest już dostępny! — %s', $productName, config('app.name')),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.product-restocked',
        );
    }
}
