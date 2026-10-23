import React from 'react';
import { cn } from '../lib/format';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import Skeleton from './Skeleton';

/**
 * Tabel data admin — docs/design.md §4.7, docs/komponen.md §4.
 * Header sticky `h-tableHead bg-surface`, baris `h-tableRow`, teks `text-meta`.
 * Memuat: 8 baris skeleton. Kosong dan galat adalah dua keadaan berbeda.
 *
 * Header sticky (docs/design.md:335) bekerja terhadap wadah gulir terdekat. Wrapper
 * `overflow-x-auto` saja sudah menjadi scrollport (overflow-y ikut `auto`) tetapi
 * tingginya mengikuti isi, jadi `sticky top-0` tidak pernah aktif saat halaman
 * digulir. Karena itu wrapper diberi `max-h-[70vh]`: daftar panjang (15 baris =
 * 884px) bergulir di dalam kartu dan header tetap terlihat; daftar pendek tidak
 * berubah karena tingginya di bawah batas. `<th>` wajib punya latar sendiri
 * (`bg-surface`) — latar di `<tr>` tidak ikut menempel dan baris akan tembus.
 */
export default function DataTable({
    columns = [],
    rows = [],
    rowKey = (row, index) => row?.id ?? index,
    loading = false,
    error = null,
    emptyTitle = 'Belum ada data',
    emptyDescription = null,
    emptyActionLabel = null,
    emptyActionHref = null,
    onRetry = null,
    onRowClick = null,
    sort = null,
    onSort = null,
    caption = null,
    className = '',
}) {
    const list = Array.isArray(rows) ? rows : [];
    const hasRows = list.length > 0;

    const cellAlign = (column) =>
        column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left';

    // docs/komponen.md §4: kolom boleh punya `width`. Bila ada, tabel memakai layout
    // fixed supaya lebar kolom tidak melebar mengikuti teks terpanjang (penyebab tabel
    // menembus kartu dan kolom terpotong). `minWidth` menjaga kolom tetap terbaca dan
    // membiarkan wrapper `overflow-auto` menggeser tabel di layar sempit.
    const punyaLebar = columns.some(
        (column) => column.width !== null && column.width !== undefined && column.width !== ''
    );
    const lebarMinimal = punyaLebar
        ? columns.reduce((total, column) => total + (typeof column.width === 'number' ? column.width : 0), 0)
        : 0;
    const lebarKolom = (column) => {
        if (column.width === null || column.width === undefined || column.width === '') return undefined;
        return typeof column.width === 'number' ? `${column.width}px` : column.width;
    };

    const sortState = (column) => {
        if (!sort || sort.key !== column.key) return 'none';
        return sort.dir === 'desc' ? 'descending' : 'ascending';
    };

    return (
        <div className={cn('overflow-hidden rounded-lg border border-line bg-white', className)}>
            {error ? (
                <ErrorState
                    title="Gagal memuat data"
                    description={typeof error === 'string' ? error : 'Periksa koneksi Anda lalu coba lagi.'}
                    onRetry={onRetry}
                    supportHref={null}
                />
            ) : loading ? (
                <div className="flex flex-col" aria-busy="true">
                    <div className="h-tableHead w-full border-b border-line bg-surface" aria-hidden="true" />
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-4 border-b border-line px-4 last:border-b-0">
                            <Skeleton variant="row" />
                        </div>
                    ))}
                </div>
            ) : !hasRows ? (
                <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    actionHref={emptyActionHref}
                />
            ) : (
                <div className="max-h-[70vh] overflow-auto">
                    <table
                        className={cn('w-full border-collapse text-meta', punyaLebar && 'table-fixed')}
                        style={lebarMinimal > 0 ? { minWidth: `${lebarMinimal}px` } : undefined}
                    >
                        {caption && <caption className="sr-only">{caption}</caption>}
                        <thead>
                            <tr className="bg-surface">
                                {columns.map((column) => {
                                    const isSorted = sort && sort.key === column.key;
                                    const sortable = Boolean(onSort && column.sortable !== false);

                                    return (
                                        <th
                                            key={column.key}
                                            scope="col"
                                            aria-sort={isSorted ? sortState(column) : undefined}
                                            style={{ width: lebarKolom(column) }}
                                            className={cn(
                                                'sticky top-0 z-10 h-tableHead whitespace-nowrap border-b border-line bg-surface px-4 text-label uppercase text-slate-600',
                                                cellAlign(column)
                                            )}
                                        >
                                            {sortable ? (
                                                <button
                                                    type="button"
                                                    onClick={() => onSort(column.key)}
                                                    className={cn(
                                                        'inline-flex items-center gap-1 rounded-sm transition-colors duration-hover hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                                                        isSorted && 'text-ink'
                                                    )}
                                                >
                                                    {column.header}
                                                    <span aria-hidden="true">
                                                        {isSorted ? (sort.dir === 'desc' ? '↓' : '↑') : '↕'}
                                                    </span>
                                                </button>
                                            ) : (
                                                column.header
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((row, index) => {
                                const clickable = typeof onRowClick === 'function';

                                return (
                                    <tr
                                        key={rowKey(row, index)}
                                        className={cn(
                                            'h-tableRow border-b border-line last:border-b-0',
                                            clickable &&
                                                'cursor-pointer transition-colors duration-hover hover:bg-surface focus-within:bg-surface'
                                        )}
                                        onClick={clickable ? () => onRowClick(row, index) : undefined}
                                    >
                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={cn('px-4 align-middle text-ink', cellAlign(column))}
                                            >
                                                {column.render ? column.render(row, index) : (row?.[column.key] ?? '-')}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
