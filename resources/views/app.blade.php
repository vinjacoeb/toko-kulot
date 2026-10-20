<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'Toko Kulot') }}</title>

    <meta name="description" content="{{ $page['props']['meta']['description'] ?? 'Toko Kulot — daster dan kulot kualitas premium, harga eceran dan grosir.' }}">

    {{-- Font self-host: taruh woff2 di public/fonts --}}
    <link rel="preconnect" href="https://fonts.bunny.net">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased bg-white text-ink">
    @inertia
</body>
</html>
