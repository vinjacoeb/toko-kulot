<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Kegagalan alur keranjang/checkout yang aman ditampilkan ke pembeli.
 * Pesannya sudah berupa kalimat Bahasa Indonesia siap tampil di `flash.error`.
 */
class CheckoutException extends RuntimeException
{
}
