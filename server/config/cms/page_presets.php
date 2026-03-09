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
                'content' => 'Wypełnij treść polityki prywatności...',
            ],
            [
                'title' => 'Polityka cookies',
                'slug' => 'polityka-cookies',
                'content' => 'Wypełnij treść polityki cookies...',
            ],
            [
                'title' => 'Regulamin',
                'slug' => 'regulamin',
                'content' => 'Wypełnij treść regulaminu...',
            ],
            [
                'title' => 'Zwroty i reklamacje',
                'slug' => 'zwroty-i-reklamacje',
                'content' => 'Wypełnij treść zwrotów i reklamacji...',
            ],
        ],
        'menu' => [
            'location' => 'footer_legal',
            'include_children' => true,
        ],
    ],
];
