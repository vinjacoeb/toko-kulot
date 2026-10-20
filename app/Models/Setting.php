<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Konfigurasi situs key-value — PRD §6 tabel `settings`.
 * Key minimum: lihat PRD §6 / docs/db.md. Logika baca-tulis ada di SettingService (K9).
 */
class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
        'label',
    ];

    protected function casts(): array
    {
        return [
            'key' => 'string',
            'value' => 'string',
        ];
    }

    public function scopeGroup(Builder $query, string $group): Builder
    {
        return $query->where('group', $group);
    }
}
