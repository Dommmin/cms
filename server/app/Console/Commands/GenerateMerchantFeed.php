<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use SimpleXMLElement;

class GenerateMerchantFeed extends Command
{
    protected $signature = 'merchant:generate-feed
        {--type=google : Feed type (google, facebook)}
        {--locale=en : Target locale}
        {--output=storage : Output location (storage, stdout)}';

    protected $description = 'Generate product feed for merchant centers (Google, Facebook)';

    public function handle(): int
    {
        $type = $this->option('type');
        $locale = $this->option('locale');
        $output = $this->option('output');

        $this->info(sprintf('Generating %s feed for locale %s...', $type, $locale));

        $products = Product::query()
            ->with(['variants', 'category', 'brand', 'translations'])
            ->where('is_active', true)
            ->whereHas('variants', fn ($q) => $q->where('is_active', true)->where('stock', '>', 0))
            ->get();

        if ($type === 'google') {
            $feed = $this->generateGoogleFeed($products, $locale);
        } elseif ($type === 'facebook') {
            $feed = $this->generateFacebookFeed($products, $locale);
        } else {
            $this->error('Unsupported feed type: '.$type);

            return self::FAILURE;
        }

        if ($output === 'stdout') {
            $this->line($feed);
        } else {
            $filename = sprintf('feeds/%s_%s_', $type, $locale).now()->format('YmdHis').'.xml';
            Storage::disk('public')->put($filename, $feed);
            $this->info('Feed saved to: '.$filename);
        }

        $this->info(sprintf('Generated feed for %d products.', $products->count()));

        return self::SUCCESS;
    }

    private function generateGoogleFeed($products, string $locale): string
    {
        $xml = new SimpleXMLElement('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"/>');
        $channel = $xml->addChild('channel');
        $channel->addChild('title', config('app.name').' Product Feed');
        $channel->addChild('link', config('app.url'));
        $channel->addChild('description', 'Product catalog for Google Merchant Center');

        foreach ($products as $product) {
            foreach ($product->variants as $variant) {
                $item = $channel->addChild('item');
                $item->addChild('g:id', $variant->sku, 'http://base.google.com/ns/1.0');
                $item->addChild('g:title', $product->getTranslation('name', $locale), 'http://base.google.com/ns/1.0');
                $item->addChild('g:description', strip_tags($product->getTranslation('description', $locale) ?? ''), 'http://base.google.com/ns/1.0');
                $item->addChild('g:link', route('products.show', $product->slug), 'http://base.google.com/ns/1.0');
                $item->addChild('g:image_link', $variant->getFirstMediaUrl('images') ?? $product->getFirstMediaUrl('images'), 'http://base.google.com/ns/1.0');
                $item->addChild('g:availability', $variant->stock > 0 ? 'in stock' : 'out of stock', 'http://base.google.com/ns/1.0');
                $item->addChild('g:price', number_format($variant->price / 100, 2).' PLN', 'http://base.google.com/ns/1.0');
                $item->addChild('g:brand', $product->brand->name ?? '', 'http://base.google.com/ns/1.0');
                $item->addChild('g:condition', 'new', 'http://base.google.com/ns/1.0');
                $item->addChild('g:gtin', $variant->ean ?? '', 'http://base.google.com/ns/1.0');
                $item->addChild('g:mpn', $variant->sku, 'http://base.google.com/ns/1.0');

                if ($product->category) {
                    $item->addChild('g:google_product_category', $product->category->google_category_id ?? '', 'http://base.google.com/ns/1.0');
                    $item->addChild('g:product_type', $product->category->getTranslation('name', $locale), 'http://base.google.com/ns/1.0');
                }
            }
        }

        return $xml->asXML();
    }

    private function generateFacebookFeed($products, string $locale): string
    {
        $xml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><products/>');

        foreach ($products as $product) {
            foreach ($product->variants as $variant) {
                $productXml = $xml->addChild('product');
                $productXml->addChild('id', $variant->sku);
                $productXml->addChild('title', $product->getTranslation('name', $locale));
                $productXml->addChild('description', strip_tags($product->getTranslation('description', $locale) ?? ''));
                $productXml->addChild('availability', $variant->stock > 0 ? 'in stock' : 'out of stock');
                $productXml->addChild('condition', 'new');
                $productXml->addChild('price', number_format($variant->price / 100, 2).' PLN');
                $productXml->addChild('link', route('products.show', $product->slug));
                $productXml->addChild('image_link', $variant->getFirstMediaUrl('images') ?? $product->getFirstMediaUrl('images'));
                $productXml->addChild('brand', $product->brand->name ?? '');

                if ($product->category) {
                    $productXml->addChild('product_type', $product->category->getTranslation('name', $locale));
                }
            }
        }

        return $xml->asXML();
    }
}
