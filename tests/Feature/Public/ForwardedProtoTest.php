<?php

namespace Tests\Feature\Public;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Proxy tunnel: `asset()` harus mengikuti `X-Forwarded-Proto` dari loopback.
 * PRD-v1.3 §3 langkah 1 — hanya 127.0.0.1/::1 yang dipercaya, bukan '*'.
 */
class ForwardedProtoTest extends TestCase
{
    use RefreshDatabase;

    private function faviconHref(string $html): string
    {
        preg_match('/<link rel="icon" href="([^"]+)"/', $html, $m);

        $this->assertArrayHasKey(1, $m, 'HTML tidak memuat <link rel="icon">.');

        return $m[1];
    }

    public function test_proto_https_dari_proxy_loopback_menghasilkan_url_aset_https(): void
    {
        $html = $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
            ->withHeaders(['X-Forwarded-Proto' => 'https'])
            ->get('/')
            ->assertOk()
            ->getContent();

        $href = $this->faviconHref($html);

        $this->assertStringStartsWith('https://', $href);
        $this->assertStringEndsWith('/favicon.ico', $href);
    }

    public function test_tanpa_header_proto_tetap_http(): void
    {
        $html = $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
            ->get('/')
            ->assertOk()
            ->getContent();

        $this->assertStringStartsWith('http://', $this->faviconHref($html));
    }

    public function test_proto_https_dari_ip_tak_dipercaya_diabaikan(): void
    {
        $html = $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.9'])
            ->withHeaders(['X-Forwarded-Proto' => 'https'])
            ->get('/')
            ->assertOk()
            ->getContent();

        $this->assertStringStartsWith('http://', $this->faviconHref($html));
    }
}
