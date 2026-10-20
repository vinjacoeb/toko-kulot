<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * Halaman statis `/kontak-kami` (K11). Tanpa props sendiri: hanya props bersama
 * (settings, cartCount, user, flash) dari HandleInertiaRequests, kontrak §11.3.
 */
class ContactController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Public/Contact');
    }
}
