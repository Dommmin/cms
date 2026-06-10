<?php

declare(strict_types=1);

return [
    /**
     * CMS Modules registry (source of truth).
     *
     * Key is stored in pages.module_name when page_type=module.
     */
    'content' => [
        'label' => 'Content (Rich Text)',
        'description' => 'Statyczna treść oparta o wpis ContentEntry (rich text).',
        'frontend_renderer' => 'content',
        'module_config_schema' => [
            'content_id' => ['required', 'integer', 'exists:content_entries,id'],
        ],
    ],
    'faq' => [
        'label' => 'FAQ (Frequently Asked Questions)',
        'description' => 'Moduł do zarządzania pytaniami i odpowiedziami.',
        'frontend_renderer' => 'faq',
        'module_config_schema' => [
            'category' => ['nullable', 'string', 'max:255'],
        ],
    ],
    'blog' => [
        'label' => 'Blog (Lista postów)',
        'description' => 'Wyświetla listę wpisów z bloga.',
        'frontend_renderer' => 'blog',
        'module_config_schema' => [
            'blog_id' => ['nullable', 'integer', 'exists:blogs,id'],
        ],
    ],
    'product_listing' => [
        'label' => 'Produkty (listing)',
        'description' => 'Dynamiczny listing produktów storefrontu.',
        'frontend_renderer' => 'product_listing',
        'module_config_schema' => [
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ],
    ],
    'category_listing' => [
        'label' => 'Kategorie (listing)',
        'description' => 'Dynamiczna lista kategorii z własnymi URL-ami detail.',
        'frontend_renderer' => 'category_listing',
        'module_config_schema' => [],
    ],
    'brand_listing' => [
        'label' => 'Marki (listing)',
        'description' => 'Dynamiczna lista marek z własnymi URL-ami detail.',
        'frontend_renderer' => 'brand_listing',
        'module_config_schema' => [],
    ],
    'returns_portal' => [
        'label' => 'Zwroty i reklamacje',
        'description' => 'Portal self-service do wyszukania zamówienia i złożenia zwrotu lub reklamacji.',
        'frontend_renderer' => 'returns_portal',
        'module_config_schema' => [],
    ],
    'store_locator' => [
        'label' => 'Lokalizator sklepów stacjonarnych',
        'description' => 'Dynamiczna mapa i lista sklepów fizycznych z filtrowaniem miast.',
        'frontend_renderer' => 'store_locator',
        'module_config_schema' => [
            'default_zoom' => ['nullable', 'integer', 'min:1', 'max:20'],
            'initial_city' => ['nullable', 'string', 'max:255'],
        ],
    ],
    'flash_sales_hub' => [
        'label' => 'Centrum wyprzedaży błyskawicznych',
        'description' => 'Lista aktywnych i nadchodzących promocji limitowanych czasowo z odliczaniem.',
        'frontend_renderer' => 'flash_sales_hub',
        'module_config_schema' => [
            'show_expired' => ['required', 'boolean'],
            'limit' => ['nullable', 'integer', 'min:1'],
        ],
    ],
    'guest_order_tracker' => [
        'label' => 'Śledzenie zamówienia (Gość)',
        'description' => 'Formularz śledzenia statusu zamówienia i przesyłek po numerze referencyjnym i e-mail.',
        'frontend_renderer' => 'guest_order_tracker',
        'module_config_schema' => [],
    ],
    'newsletter_preferences' => [
        'label' => 'Zarządzanie preferencjami newslettera',
        'description' => 'Strona do zarządzania subskrypcją i tematami newslettera dla RODO/GDPR.',
        'frontend_renderer' => 'newsletter_preferences',
        'module_config_schema' => [],
    ],
];
