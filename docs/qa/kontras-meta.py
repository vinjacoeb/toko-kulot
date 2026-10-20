# -*- coding: utf-8 -*-
"""Hitung rasio kontras WCAG 2.1 untuk kandidat kelas teks meta di atas latar nyata.
Sumber token: tailwind.config.js (slate = palette bawaan Tailwind).
Dipakai sebagai dasar keputusan t_14cad9e2 (teks meta di atas `surface`).
"""


def lin(c):
    c /= 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def lum(rgb):
    return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2])


def ratio(a, b):
    x, y = lum(a), lum(b)
    if x < y:
        x, y = y, x
    return (x + 0.05) / (y + 0.05)


def hx(s):
    s = s.lstrip('#')
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


def over(fg, a, bg):
    return tuple(round(a * fg[i] + (1 - a) * bg[i]) for i in range(3))


white = hx('#FFFFFF')
surface = hx('#F6F6F4')
brand100 = hx('#E7E9F2')
slate200 = hx('#E2E8F0')
ink = hx('#1F2A44')  # placeholder, hanya untuk referensi
chip_surface = over(slate200, 0.60, surface)
chip_white = over(slate200, 0.60, white)

bgs = [
    ('putih', white),
    ('surface', surface),
    ('brand-100', brand100),
    ('slate-200/60@surface', chip_surface),
    ('slate-200/60@putih', chip_white),
    ('slate-200', slate200),
]

toks = [
    ('slate-400', hx('#94A3B8')),
    ('slate-500', hx('#64748B')),
    ('slate-600', hx('#475569')),
    ('slate-700', hx('#334155')),
]

print('chip slate-200/60 @surface = #%02X%02X%02X' % chip_surface)
print('chip slate-200/60 @putih   = #%02X%02X%02X' % chip_white)
print()
hdr = '%-11s' % 'kelas'
for bn, _ in bgs:
    hdr += '%22s' % bn
print(hdr)
for tn, fg in toks:
    row = '%-11s' % tn
    for bn, bg in bgs:
        r = ratio(fg, bg)
        mark = 'OK ' if r >= 4.5 else 'X  '
        row += '%22s' % ('%.2f:1 %s' % (r, mark))
    print(row)
print()
print('Ambang: teks normal (<24px / <18.66px bold) = 4,5:1 ; elemen non-teks/ikon = 3:1')
print()
print('Ringkas kandidat keputusan t_14cad9e2:')
for tn in ('slate-500', 'slate-600'):
    fg = dict(toks)[tn]
    print('  %s: putih %.2f | surface %.2f | brand-100 %.2f | chip@surface %.2f'
          % (tn, ratio(fg, white), ratio(fg, surface), ratio(fg, brand100), ratio(fg, chip_surface)))
