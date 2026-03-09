<?php

declare(strict_types=1);

return [
    'hero' => [
        'label' => 'Hero + CTA',
        'section' => [
            'layout' => 'full-width',
            'variant' => 'hero',
            'settings' => [
                'padding' => 'xl',
            ],
        ],
        'blocks' => [
            [
                'type' => 'hero_banner',
                'configuration' => [
                    'title' => 'Nowa kolekcja',
                    'subtitle' => 'Sprawdź nowości w sklepie',
                    'cta' => [
                        'text' => 'Zobacz produkty',
                        'url' => '/products',
                        'style' => 'primary',
                    ],
                ],
            ],
        ],
    ],
    'faq' => [
        'label' => 'FAQ',
        'section' => [
            'layout' => 'contained',
            'variant' => 'faq',
        ],
        'blocks' => [
            [
                'type' => 'accordion',
                'configuration' => [
                    'heading' => 'Najczęstsze pytania',
                    'items' => [
                        ['title' => 'Jak wygląda dostawa?', 'content' => 'Dostawa w 24-48h.'],
                        ['title' => 'Czy mogę zwrócić produkt?', 'content' => 'Tak, masz 14 dni na zwrot.'],
                    ],
                ],
            ],
        ],
    ],
    'contact' => [
        'label' => 'Kontakt + Formularz',
        'section' => [
            'layout' => 'two-col',
            'variant' => 'contact',
        ],
        'blocks' => [
            [
                'type' => 'rich_text',
                'configuration' => [
                    'content' => 'Skontaktuj się z nami, chętnie pomożemy.',
                ],
            ],
            [
                'type' => 'form_embed',
                'configuration' => [
                    'heading' => 'Formularz kontaktowy',
                ],
            ],
        ],
    ],
];
