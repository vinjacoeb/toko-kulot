"""Tambah bagian F2 ke docs/catatan-frontend.md (sekali jalan)."""
from pathlib import Path

p = Path('docs/catatan-frontend.md')
t = p.read_text(encoding='utf-8')
add = Path('tmp/f2-tambahan.md').read_text(encoding='utf-8')

if '## F2 — penanda mode uji' in t:
    print('sudah ada, tidak ditulis ulang')
    raise SystemExit(0)

nl = '\r\n' if '\r\n' in t else '\n'
baru = t.rstrip('\r\n') + nl * 2 + add.replace('\n', nl).strip('\r\n') + nl
p.write_text(baru, encoding='utf-8')
print('ok', len(t), '->', len(baru))
