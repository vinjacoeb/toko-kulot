# -*- coding: utf-8 -*-
"""Verifikasi otomatis tabel kontras §4.21 docs/design.md (kartu t_8cd61512).
Tanpa dependensi. Jalankan dari akar repo:  python docs/qa/kontras-badge.py
Keluaran 0 = semua angka di dokumen cocok dengan hitungan WCAG 2.1; 1 = ada yang tidak cocok.
"""
import io
import re
import sys

DESIGN = 'docs/design.md'
CONFIG = 'tailwind.config.js'

# ---- WCAG 2.1 relative luminance / contrast ratio -------------------------
def _lin(c):
    c /= 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def lum(rgb):
    return 0.2126 * _lin(rgb[0]) + 0.7152 * _lin(rgb[1]) + 0.0722 * _lin(rgb[2])


def ratio(fg, bg):
    a, b = lum(fg), lum(bg)
    if a < b:
        a, b = b, a
    return (a + 0.05) / (b + 0.05)


def hx(s):
    s = s.lstrip('#')
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


def over(fg, alpha, bg):
    return tuple(round(alpha * fg[i] + (1 - alpha) * bg[i]) for i in range(3))


def fmt(v):
    return ('%.2f' % v).replace('.', ',')


# ---- token: tailwind.config.js (sumber kebenaran kode) + bawaan Tailwind --
DEFAULT_PALETTE = {'white': '#FFFFFF', 'slate-200': '#E2E8F0', 'slate-400': '#94A3B8',
                   'slate-500': '#64748B', 'slate-600': '#475569', 'slate-700': '#334155',
                   'red-50': '#FEF2F2'}


def parse_colors(path):
    src = io.open(path, encoding='utf-8').read()
    start = src.index('colors:')
    depth, end = 0, len(src)
    for k in range(src.index('{', start), len(src)):
        if src[k] == '{':
            depth += 1
        elif src[k] == '}':
            depth -= 1
            if depth == 0:
                end = k
                break
    out, grp = {}, None
    for raw in src[src.index('{', start) + 1:end].split('\n'):
        line = raw.split('//')[0].strip()
        if not line:
            continue
        if line.startswith('}'):
            grp = None
            continue
        m = re.match(r'^([A-Za-z0-9_-]+):\s*\{', line)
        if m:
            grp = m.group(1)
            continue
        m = re.match(r"^['\"]?([A-Za-z0-9_-]+)['\"]?:\s*'(#[0-9A-Fa-f]{3,8})'", line)
        if m:
            key, val = m.group(1), m.group(2)
            out[grp if (grp and key == 'DEFAULT') else ('%s-%s' % (grp, key) if grp else key)] = val
    return out


CFG = parse_colors(CONFIG)
cfg = dict(DEFAULT_PALETTE)
cfg.update(CFG)
ASAL = {k: ('config' if k in CFG else 'bawaan-tailwind') for k in cfg}

BACKDROPS = ['putih', 'surface', 'brand-100', 'di-atas-chip-slate-200/60']


def backdrop_hex(label):
    tok = {'putih': 'white', 'surface': 'surface', 'brand-100': 'brand-100'}.get(label)
    if tok == 'di-atas-chip-slate-200/60' or label == 'di-atas-chip-slate-200/60':
        return over(hx(cfg['slate-200']), 0.60, hx(cfg['surface']))
    return hx(cfg[tok])


def chip_eff(bg_class, backdrop):
    """warna efektif chip: kelas bg-* dikomposit di atas latar uji"""
    m = re.fullmatch(r'bg-([a-z0-9-]+?)(?:/(\d+))?', bg_class)
    if not m:
        raise SystemExit('kelas bg tidak dikenali: %s' % bg_class)
    tok, pct = m.group(1), m.group(2)
    alpha = int(pct) / 100.0 if pct else 1.0
    if tok not in cfg:
        raise SystemExit('token %r tidak ada di %s' % (tok, CONFIG))
    return over(hx(cfg[tok]), alpha, backdrop_hex(backdrop))


def min_ratio(text_class, bg_class):
    tok = text_class[len('text-'):]
    if tok not in cfg:
        raise SystemExit('token %r tidak ada di %s' % (tok, CONFIG))
    worst, where = 99.9, ''
    for label in BACKDROPS:
        r = ratio(hx(cfg[tok]), chip_eff(bg_class, label))
        if r < worst:
            worst, where = r, label
    return worst, where


doc = io.open(DESIGN, encoding='utf-8').read()
lines = doc.split('\n')
fails = []

# ---- 1. tabel "Aturan tone badge" ----------------------------------------
print('== Tabel tone badge §4.21 ==')
start = next(i for i, l in enumerate(lines) if l.startswith('| tone | Kelas baku'))
for line in lines[start + 2:]:
    if not line.startswith('|'):
        break
    m = re.match(r'^\| `([a-z]+)`[^|]*\| `([^`]+)` \| ([0-9,]+):1 \|', line)
    if not m:
        continue
    tone, classes, cited = m.group(1), m.group(2), float(m.group(3).replace(',', '.'))
    bg_cls, text_cls = classes.split()
    got, where = min_ratio(text_cls, bg_cls)
    ok = abs(got - cited) <= 0.006
    print('  %-8s %-38s dokumen %s:1 | hitung %s:1 (%s) %s'
          % (tone, classes, m.group(3), fmt(got), where, 'OK' if ok else '<<< BEDA'))
    if not ok:
        fails.append('tone %s: dokumen %s vs hitung %s' % (tone, cited, fmt(got)))
    if got < 4.5:
        fails.append('tone %s: %s:1 di bawah ambang AA 4,5:1' % (tone, fmt(got)))

# ---- 2. tabel "Tone solid" ------------------------------------------------
print('\n== Tabel tone solid §4.21 ==')
start = next(i for i, l in enumerate(lines) if l.startswith('| token solid |'))
for line in lines[start + 2:]:
    if not line.startswith('|'):
        break
    m = re.match(r'^\| `([a-z0-9-]+)` \| ([0-9,]+):1 ([✅❌]) \| ([0-9,]+):1 ([✅❌]) \|', line)
    if not m:
        continue
    tok, rw, fw, ri, fi = m.group(1), float(m.group(2).replace(',', '.')), m.group(3), \
        float(m.group(4).replace(',', '.')), m.group(5)
    gw = ratio(hx(cfg['white']), hx(cfg[tok]))
    gi = ratio(hx(cfg['ink']), hx(cfg[tok]))
    ok = abs(gw - rw) <= 0.006 and abs(gi - ri) <= 0.006 \
        and (fw == '✅') == (gw >= 4.5) and (fi == '✅') == (gi >= 4.5)
    print('  %-12s putih %s:1 %s | ink %s:1 %s %s'
          % (tok, fmt(gw), 'OK ' if abs(gw - rw) <= 0.006 else 'BEDA', fmt(gi),
             'OK' if abs(gi - ri) <= 0.006 else 'BEDA', 'OK' if ok else '<<< BEDA'))
    if not ok:
        fails.append('solid %s: dokumen %s/%s vs hitung %s/%s' % (tok, m.group(2), m.group(4), fmt(gw), fmt(gi)))

# ---- 3. token -strong harus ada di config ---------------------------------
print('\n== Token -strong ==')
for k in ('success-strong', 'warning-strong', 'danger-strong'):
    got = cfg.get(k)
    print('  %-16s %s %s' % (k, got, 'OK' if got else '<<< HILANG'))
    if not got:
        fails.append('token %s hilang di %s' % (k, CONFIG))

print('\n== HASIL ==')
if fails:
    for f in fails:
        print('  GAGAL: %s' % f)
    sys.exit(1)
print('  SEMUA angka tabel §4.21 cocok dengan hitungan WCAG 2.1 (toleransi 0,006) — 7 tone + 7 tone solid.')
