import React from 'react';
import { Head } from '@inertiajs/react';

export default function Home({ settings = {}, featured = [] }) {
    return (
        <>
            <Head title="Beranda" />
            <main className="min-h-screen">
                <div className="container py-16">
                    <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        {settings.tagline || 'Daster & Kulot Premium'}
                    </p>
                    <h1 className="font-display text-h1 mt-2 text-brand">
                        {settings.store_name || 'Toko Kulot'}
                    </h1>
                    <p className="mt-3 max-w-xl text-[15px] text-ink/75">
                        Fondasi Laravel 11 + Inertia + React aktif. Halaman ini
                        dirender dari server melalui Inertia.
                    </p>

                    <div className="mt-8 flex gap-3">
                        <a href="/produk" className="btn-primary">Lihat Produk</a>
                        <a href="/kontak-kami" className="btn-secondary">Kontak Kami</a>
                    </div>

                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {featured.length === 0
                            ? Array.from({ length: 4 }).map((_, i) => (
                                  <div key={i} className="skeleton aspect-square" />
                              ))
                            : featured.map((p) => (
                                  <div key={p.id} className="card p-3">
                                      <div className="aspect-square bg-surface rounded-md" />
                                      <p className="mt-2 text-[15px] font-semibold line-clamp-2">
                                          {p.name}
                                      </p>
                                  </div>
                              ))}
                    </div>
                </div>
            </main>
        </>
    );
}
