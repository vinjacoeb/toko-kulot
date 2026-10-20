<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFaqRequest;
use App\Http\Requests\Admin\UpdateFaqRequest;
use App\Models\Faq;
use Illuminate\Http\RedirectResponse;

/**
 * FAQ beranda (PRD §6, kontrak props §10.11).
 */
class FaqController extends Controller
{
    public function store(StoreFaqRequest $request): RedirectResponse
    {
        Faq::query()->create([
            'question' => (string) $request->input('question'),
            'answer' => (string) $request->input('answer'),
            'sort_order' => (int) ($request->input('sort_order') ?? 0),
            'is_active' => $request->exists('is_active') ? $request->boolean('is_active') : true,
        ]);

        return back()->with('success', 'FAQ disimpan.');
    }

    public function update(UpdateFaqRequest $request, Faq $faq): RedirectResponse
    {
        $faq->forceFill([
            'question' => (string) $request->input('question'),
            'answer' => (string) $request->input('answer'),
            'sort_order' => (int) ($request->input('sort_order') ?? 0),
            'is_active' => $request->exists('is_active') ? $request->boolean('is_active') : $faq->is_active,
        ])->save();

        return back()->with('success', 'FAQ diperbarui.');
    }

    public function destroy(Faq $faq): RedirectResponse
    {
        $faq->delete();

        return back()->with('success', 'FAQ dihapus.');
    }
}
