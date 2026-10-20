<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Transisi status pesanan yang tidak sah (PRD §7, kontrak props §12.17).
 * Ditangkap controller admin dan dikembalikan sebagai galat validasi ke UI.
 */
class OrderStatusException extends RuntimeException
{
}
