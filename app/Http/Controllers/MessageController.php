<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactMessageRequest;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;

/**
 * Formulir kontak publik (PRD §8, kontrak props §9.2).
 *
 * Honeypot `website`: bila terisi, pesan tidak disimpan tetapi pengirim tetap
 * mendapat pesan sukses supaya bot tidak tahu dirinya tertolak.
 */
class MessageController extends Controller
{
    private const SUCCESS = 'Pesan Anda sudah kami terima. Kami balas maksimal 1x24 jam.';

    private const CONTACT_URL = '/kontak-kami';

    public function store(ContactMessageRequest $request): RedirectResponse
    {
        if (filled($request->input('website'))) {
            return redirect(self::CONTACT_URL)->with('success', self::SUCCESS);
        }

        ContactMessage::query()->create([
            'name' => (string) $request->input('name'),
            'email' => (string) $request->input('email'),
            'phone' => $request->input('phone') ?: null,
            'subject' => (string) $request->input('subject'),
            'message' => (string) $request->input('message'),
            'is_read' => false,
            'ip' => $request->ip(),
        ]);

        return redirect(self::CONTACT_URL)->with('success', self::SUCCESS);
    }
}
