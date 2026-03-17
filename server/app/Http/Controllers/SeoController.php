<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function robots(): Response
    {
        $content = Setting::get('seo', 'robots_txt', "User-agent: *\nAllow: /");

        return response($content)->header('Content-Type', 'text/plain');
    }
}
