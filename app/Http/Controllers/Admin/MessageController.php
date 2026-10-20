<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReplyMessageRequest;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pesan masuk dari formulir kontak (PRD §9 panel admin, kontrak props §10.1–§10.3).
 */
class MessageController extends Controller
{
    private const PER_PAGE = 15;

    private const STATUSES = ['semua', 'belum', 'sudah'];

    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $status = (string) $request->query('status', 'semua');

        if (! in_array($status, self::STATUSES, true)) {
            $status = 'semua';
        }

        $query = ContactMessage::query();

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->where(function ($sub) use ($like): void {
                $sub->where('name', 'like', $like)
                    ->orWhere('subject', 'like', $like)
                    ->orWhere('email', 'like', $like);
            });
        }

        if ($status === 'belum') {
            $query->where('is_read', false);
        } elseif ($status === 'sudah') {
            $query->where('is_read', true);
        }

        $pesan = $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (ContactMessage $message): array => [
                'id' => $message->id,
                'name' => $message->name,
                'email' => $message->email,
                'phone' => $message->phone,
                'subject' => $message->subject,
                'message' => $message->message,
                'is_read' => (bool) $message->is_read,
                'admin_reply' => $message->admin_reply,
                'replied_at' => $message->replied_at?->toIso8601String(),
                'created_at' => $message->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Messages/Index', [
            'pesan' => $pesan,
            'filter' => [
                'q' => $q === '' ? null : $q,
                'status' => $status,
            ],
            'ringkasan' => [
                'total' => ContactMessage::query()->count(),
                'belum_dibaca' => ContactMessage::query()->where('is_read', false)->count(),
            ],
        ]);
    }

    public function read(ContactMessage $message): RedirectResponse
    {
        if (! $message->is_read) {
            $message->forceFill(['is_read' => true])->save();
        }

        return back()->with('success', 'Pesan ditandai sudah dibaca.');
    }

    public function reply(ReplyMessageRequest $request, ContactMessage $message): RedirectResponse
    {
        $message->forceFill([
            'admin_reply' => (string) $request->validated('admin_reply'),
            'replied_at' => now(),
            'is_read' => true,
        ])->save();

        $this->sendReplyEmail($message);

        return back()->with('success', 'Balasan tersimpan.');
    }

    /**
     * Kirim balasan ke email pengirim. Kegagalan kirim tidak menggagalkan aksi.
     */
    private function sendReplyEmail(ContactMessage $message): void
    {
        try {
            Mail::raw((string) $message->admin_reply, function ($mail) use ($message): void {
                $mail->to($message->email)->subject('Balasan: '.$message->subject);
            });
        } catch (\Throwable $exception) {
            Log::warning('Gagal mengirim balasan pesan masuk.', [
                'contact_message_id' => $message->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
