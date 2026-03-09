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
];
