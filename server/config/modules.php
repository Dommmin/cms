<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | CMS Modules
    |--------------------------------------------------------------------------
    |
    | Control which modules are active in this installation. Set to false to
    | completely disable a module — its routes, observers, service bindings
    | and sidebar sections will not be registered.
    |
    | Hierarchy:
    |   marketing requires ecommerce
    |   ecommerce/newsletter/blog can each be disabled independently
    |
    */

    'blog' => (bool) env('MODULE_BLOG', true),

    'ecommerce' => (bool) env('MODULE_ECOMMERCE', true),

    'newsletter' => (bool) env('MODULE_NEWSLETTER', true),

    'marketing' => (bool) env('MODULE_MARKETING', true),

];
