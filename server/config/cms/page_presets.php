<?php

declare(strict_types=1);

return [
    'landing' => [
        'label' => 'Landing Page',
        'page' => [
            'title' => 'Nowa strona',
            'page_type' => 'blocks',
            'layout' => 'default',
        ],
        'sections' => [
            'hero',
            'faq',
        ],
    ],
    'contact' => [
        'label' => 'Contact Page',
        'page' => [
            'title' => 'Kontakt',
            'page_type' => 'blocks',
            'system_page_key' => 'contact_page',
            'layout' => 'default',
        ],
        'sections' => [
            'contact',
        ],
    ],
    'legal_basic' => [
        'label' => 'Legal (Privacy + Cookies + Terms + Returns)',
        'page' => [
            'title' => 'Informacje prawne',
            'slug' => 'legal',
            'page_type' => 'module',
            'module_name' => 'content',
            'layout' => 'default',
        ],
        'children' => [
            [
                'title' => 'Polityka prywatności',
                'slug' => 'polityka-prywatnosci',
                'system_page_key' => 'privacy_policy',
                'content' => 'Wypełnij treść polityki prywatności...',
            ],
            [
                'title' => 'Polityka cookies',
                'slug' => 'polityka-cookies',
                'system_page_key' => 'cookie_policy',
                'content' => 'Wypełnij treść polityki cookies...',
            ],
            [
                'title' => 'Regulamin',
                'slug' => 'regulamin',
                'system_page_key' => 'terms_of_service',
                'content' => 'Wypełnij treść regulaminu...',
            ],
            [
                'title' => 'Zwroty i reklamacje',
                'slug' => 'zwroty-i-reklamacje',
                'system_page_key' => 'return_policy',
                'content' => 'Wypełnij treść zwrotów i reklamacji...',
            ],
        ],
        'menu' => [
            'location' => 'footer_legal',
            'include_children' => true,
        ],
    ],
];
