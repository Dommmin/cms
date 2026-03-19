<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

class HomeController extends Controller
{
    //
    public function index()
    {
        return inertia('admin/dashboard');
    }
}
