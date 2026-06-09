<?php

declare(strict_types=1);

return [
    'fashion' => [
        'label' => 'Fashion Store',
        'design_preset' => 'classic',
        'pages' => [
            [
                'title' => 'Home',
                'page_type' => 'blocks',
                'layout' => 'full_width',
                'system_page_key' => 'home',
                'sections' => [
                    [
                        'variant' => 'hero',
                        'blocks' => [
                            [
                                'type' => 'hero_banner',
                                'configuration' => [
                                    'title' => 'Nowa Kolekcja Wiosna/Lato',
                                    'subtitle' => 'Odkryj najnowsze trendy w modzie damskiej i męskiej.',
                                    'cta_text' => 'Zobacz nowości',
                                    'cta_url' => '/products?sort=newest',
                                    'cta_style' => 'primary',
                                    'text_alignment' => 'center',
                                ],
                            ],
                        ],
                    ],
                    [
                        'variant' => 'default',
                        'blocks' => [
                            [
                                'type' => 'categories_grid',
                                'configuration' => [
                                    'title' => 'Kategorie',
                                    'columns' => 4,
                                    'style' => 'square',
                                ],
                            ],
                        ],
                    ],
                    [
                        'variant' => 'default',
                        'blocks' => [
                            [
                                'type' => 'featured_products',
                                'configuration' => [
                                    'title' => 'Bestsellery',
                                    'filter_mode' => 'featured',
                                    'display_mode' => 'carousel',
                                    'items_per_row' => 4,
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'O nas',
                'page_type' => 'blocks',
                'layout' => 'default',
                'slug' => 'about-us',
                'sections' => [
                    [
                        'variant' => 'default',
                        'blocks' => [
                            [
                                'type' => 'two_columns',
                                'configuration' => [
                                    'left_content' => '<h2>Nasza historia</h2><p>Od 10 lat tworzymy ubrania dla wymagających.</p>',
                                    'ratio' => '50-50',
                                    'vertical_alignment' => 'middle',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    'beauty' => [
        'label' => 'Beauty & Cosmetics',
        'design_preset' => 'soft',
        'pages' => [
            [
                'title' => 'Home',
                'page_type' => 'blocks',
                'layout' => 'full_width',
                'system_page_key' => 'home',
                'sections' => [
                    [
                        'variant' => 'hero',
                        'blocks' => [
                            [
                                'type' => 'hero_banner',
                                'configuration' => [
                                    'title' => 'Pielęgnacja, na jaką zasługujesz',
                                    'subtitle' => 'Naturalne składniki, udowodnione działanie.',
                                    'cta_text' => 'Kup teraz',
                                    'cta_url' => '/products',
                                ],
                            ],
                        ],
                    ],
                    [
                        'variant' => 'default',
                        'blocks' => [
                            [
                                'type' => 'testimonials',
                                'configuration' => [
                                    'title' => 'Zaufali nam',
                                    'display_mode' => 'carousel',
                                    'items' => [
                                        ['author' => 'Anna', 'rating' => 5, 'content' => 'Cudowne kosmetyki! Skóra jest nawilżona i pełna blasku.'],
                                        ['author' => 'Maria', 'rating' => 5, 'content' => 'Zdecydowanie polecam. Widać efekty po tygodniu.'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'variant' => 'default',
                        'blocks' => [
                            [
                                'type' => 'image_gallery',
                                'configuration' => [
                                    'title' => 'Znajdź nas na Instagramie',
                                    'layout' => 'masonry',
                                    'columns' => 4,
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    'furniture' => [
        'label' => 'Furniture & Home Decor',
        'design_preset' => 'minimal',
        'pages' => [
            [
                'title' => 'Home',
                'page_type' => 'blocks',
                'layout' => 'full_width',
                'system_page_key' => 'home',
                'sections' => [
                    [
                        'variant' => 'hero',
                        'blocks' => [
                            [
                                'type' => 'hero_banner',
                                'configuration' => [
                                    'title' => 'Stwórz wymarzone wnętrze',
                                    'subtitle' => 'Nowoczesne meble, które odmienią Twój dom.',
                                    'cta_text' => 'Przeglądaj katalog',
                                    'cta_style' => 'outline',
                                ],
                            ],
                        ],
                    ],
                    [
                        'variant' => 'default',
                        'blocks' => [
                            [
                                'type' => 'categories_grid',
                                'configuration' => [
                                    'title' => 'Pomieszczenia',
                                    'columns' => 3,
                                    'style' => 'wide',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    'electronics' => [
        'label' => 'Electronics & Tech',
        'design_preset' => 'bold',
        'pages' => [
            [
                'title' => 'Home',
                'page_type' => 'blocks',
                'layout' => 'default',
                'system_page_key' => 'home',
                'sections' => [
                    [
                        'variant' => 'hero',
                        'blocks' => [
                            [
                                'type' => 'promotional_banner',
                                'configuration' => [
                                    'title' => 'Wyprzedaż sprzętu RTV/AGD',
                                    'subtitle' => 'Zniżki do -30% do końca miesiąca!',
                                    'link_text' => 'Sprawdź okazje',
                                    'badge_text' => 'SALE',
                                ],
                            ],
                        ],
                    ],
                    [
                        'variant' => 'default',
                        'blocks' => [
                            [
                                'type' => 'featured_products',
                                'configuration' => [
                                    'title' => 'Nowości na rynku',
                                    'filter_mode' => 'manual',
                                    'display_mode' => 'grid',
                                    'items_per_row' => 5,
                                    'max_items' => 10,
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    'b2b' => [
        'label' => 'B2B Catalog',
        'design_preset' => 'minimal',
        'pages' => [
            [
                'title' => 'Home',
                'page_type' => 'blocks',
                'layout' => 'default',
                'system_page_key' => 'home',
                'sections' => [
                    [
                        'variant' => 'hero',
                        'blocks' => [
                            [
                                'type' => 'hero_banner',
                                'configuration' => [
                                    'title' => 'Platforma hurtowa B2B',
                                    'subtitle' => 'Zaloguj się, aby zobaczyć ceny hurtowe i złożyć zamówienie.',
                                    'cta_text' => 'Logowanie',
                                    'cta_url' => '/login',
                                    'cta2_text' => 'Rejestracja',
                                    'cta2_url' => '/register',
                                ],
                            ],
                        ],
                    ],
                    [
                        'variant' => 'default',
                        'blocks' => [
                            [
                                'type' => 'featured_posts',
                                'configuration' => [
                                    'title' => 'Baza wiedzy i instrukcje',
                                    'display_mode' => 'list',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Współpraca',
                'page_type' => 'blocks',
                'layout' => 'default',
                'slug' => 'wspolpraca',
                'sections' => [
                    [
                        'variant' => 'contact',
                        'blocks' => [
                            [
                                'type' => 'rich_text',
                                'configuration' => [
                                    'content' => '<h2>Zostań naszym partnerem</h2><p>Wypełnij formularz zgłoszeniowy B2B.</p>',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];
