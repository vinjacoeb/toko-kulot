<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCarouselRequest;
use App\Http\Requests\Admin\UpdateCarouselRequest;
use App\Models\Carousel;
use App\Support\MediaStorage;
use Illuminate\Http\RedirectResponse;

/**
 * Carousel beranda (PRD §6, kontrak props §10.10).
 */
class CarouselController extends Controller
{
    public function store(StoreCarouselRequest $request): RedirectResponse
    {
        Carousel::query()->create([
            'title' => (string) $request->input('title'),
            'subtitle' => $request->input('subtitle') ?: null,
            'image' => MediaStorage::store($request->file('image'), 'carousels'),
            'link' => $request->input('link') ?: null,
            'button_text' => $request->input('button_text') ?: null,
            'sort_order' => (int) ($request->input('sort_order') ?? 0),
            'is_active' => $request->exists('is_active') ? $request->boolean('is_active') : true,
        ]);

        return back()->with('success', 'Carousel disimpan.');
    }

    public function update(UpdateCarouselRequest $request, Carousel $carousel): RedirectResponse
    {
        $attributes = [
            'title' => (string) $request->input('title'),
            'subtitle' => $request->input('subtitle') ?: null,
            'link' => $request->input('link') ?: null,
            'button_text' => $request->input('button_text') ?: null,
            'sort_order' => (int) ($request->input('sort_order') ?? 0),
            'is_active' => $request->exists('is_active') ? $request->boolean('is_active') : $carousel->is_active,
        ];

        if ($request->hasFile('image')) {
            $old = $carousel->image;
            $attributes['image'] = MediaStorage::store($request->file('image'), 'carousels');
            MediaStorage::delete(is_string($old) ? $old : null);
        }

        $carousel->forceFill($attributes)->save();

        return back()->with('success', 'Carousel diperbarui.');
    }

    public function destroy(Carousel $carousel): RedirectResponse
    {
        $image = $carousel->image;

        $carousel->delete();

        MediaStorage::delete(is_string($image) ? $image : null);

        return back()->with('success', 'Carousel dihapus.');
    }
}
