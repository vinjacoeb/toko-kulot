<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'Toko Kulot') }}</title>

    <meta name="description" content="{{ $page['props']['meta']['description'] ?? 'Toko Kulot — daster dan kulot kualitas premium, harga eceran dan grosir.' }}">

    {{-- Font: Bunny Fonts (mirror Google Fonts, tanpa tracking). Self-host woff2 di public/fonts bila sudah tersedia. --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link
        rel="stylesheet"
        href="https://fonts.bunny.net/css?family=bebas-neue:400|inter:400,500,600,700&display=swap"
    >

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased bg-white text-ink">
    @inertia
</body>
</html>
