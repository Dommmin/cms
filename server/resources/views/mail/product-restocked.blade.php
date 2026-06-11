<x-mail::message>
# Produkt jest ponownie dostępny!

Dobra wiadomość! Zapisany przez Ciebie produkt jest już ponownie dostępny na stanie:

**{{ $variant->product?->name }}**
@if($variant->name)
Wariant: {{ $variant->name }}
@else
@php
    $attrs = [];
    if ($variant->relationLoaded('attributeValues')) {
        foreach ($variant->attributeValues as $av) {
            $attrs[] = $av->attribute->name . ': ' . $av->attributeValue->value;
        }
    }
@endphp
@if(!empty($attrs))
Wariant: {{ implode(', ', $attrs) }}
@endif
@endif

Cena: {{ $variant->formattedPrice() }}

<x-mail::button :url="config('app.frontend_url') . '/products/' . $variant->product?->slug">
Zobacz produkt
</x-mail::button>

Dziękujemy,<br>
Zespół {{ config('app.name') }}
</x-mail::message>
