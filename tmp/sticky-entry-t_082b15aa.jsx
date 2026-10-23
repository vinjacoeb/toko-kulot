import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import DataTable from '../resources/js/Components/DataTable';

const rows = Array.from({ length: 20 }, (_, index) => ({
    kode: `INV-2026-${String(index + 1).padStart(4, '0')}`,
    pelanggan: `Pelanggan Uji ${index + 1}`,
    status: index % 3 === 0 ? 'Baru' : 'Diproses',
    total: 125000 + index * 1000,
}));

const columns = [
    { key: 'kode', header: 'Kode pesanan', sortable: true, width: 160 },
    { key: 'pelanggan', header: 'Pelanggan', sortable: true },
    { key: 'status', header: 'Status', align: 'center', width: 120 },
    {
        key: 'total',
        header: 'Total',
        align: 'right',
        render: (row) => `Rp${row.total.toLocaleString('id-ID')}`,
    },
];

// Kontrol negatif: markup lama (wrapper overflow-x-auto, th tanpa sticky) untuk
// membandingkan perilaku computed style pada halaman yang sama.
const barisLama = rows
    .map(
        (row) =>
            `<tr class="h-tableRow border-b border-line"><td class="px-4">${row.kode}</td><td class="px-4">${row.pelanggan}</td><td class="px-4 text-center">${row.status}</td><td class="px-4 text-right">Rp${row.total}</td></tr>`
    )
    .join('');

const kontrolLama = `
<div class="mt-8 overflow-hidden rounded-lg border border-line bg-white">
  <div id="wrapper-lama" class="overflow-x-auto">
    <table class="w-full border-collapse text-meta">
      <thead><tr class="bg-surface">
        <th class="h-tableHead whitespace-nowrap border-b border-line bg-surface px-4 text-label uppercase text-slate-600">Kode lama</th>
        <th class="h-tableHead whitespace-nowrap border-b border-line bg-surface px-4 text-label uppercase text-slate-600">Pelanggan lama</th>
        <th class="h-tableHead whitespace-nowrap border-b border-line bg-surface px-4 text-label uppercase text-slate-600">Status lama</th>
        <th class="h-tableHead whitespace-nowrap border-b border-line bg-surface px-4 text-label uppercase text-slate-600">Total lama</th>
      </tr></thead>
      <tbody>${barisLama}</tbody>
    </table>
  </div>
</div>`;

const cssHref = 'file:///C:/Users/LENOVO/Downloads/toko-kulot/public/build/assets/app-CCUgQ5mf.css';

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Harness sticky DataTable t_082b15aa</title>
<link rel="stylesheet" href="${cssHref}">
</head>
<body class="bg-canvas text-ink">
<header id="topbar" class="sticky top-0 z-20 flex h-topbar items-center justify-between gap-3 border-b border-line bg-white px-4">
  <span class="text-h3">Toko Kulot — topbar admin (tiruan AdminLayout.jsx:172)</span>
</header>
<main class="p-6">
  <h1 class="text-h2">DataTable nyata (SSR komponen) — 20 baris</h1>
  ${renderToStaticMarkup(
      <DataTable
          columns={columns}
          rows={rows}
          caption="Daftar pesanan uji"
          sort={{ key: 'kode', dir: 'asc' }}
          onSort={() => {}}
      />
  )}
  <h2 class="text-h3 mt-8">Kontrol negatif: markup lama (overflow-x-auto, th tanpa sticky)</h2>
  ${kontrolLama}
  <div style="height: 1600px" aria-hidden="true"></div>
</main>
</body>
</html>`;

export function writeHarness(path) {
    writeFileSync(path, html, 'utf8');
    return path;
}
