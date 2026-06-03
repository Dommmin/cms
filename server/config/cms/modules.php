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
];
