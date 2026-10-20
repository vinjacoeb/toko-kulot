import json
import re
import sys

# Simpan props `settings` asli dari server (diambil dari payload Inertia di HTML)
# ke berkas JSON agar bisa dipakai harness render statis dengan data nyata.
html = open(sys.argv[1], encoding='utf-8', errors='replace').read()
m = re.search(r'<script[^>]*data-page="app"[^>]*>(.*?)</script>', html, re.S)
if not m:
    print('payload data-page tidak ditemukan')
    sys.exit(1)
page = json.loads(m.group(1))
settings = (page.get('props') or {}).get('settings')
if not settings:
    print('props.settings kosong di halaman', page.get('component'))
    sys.exit(1)
out = sys.argv[2]
with open(out, 'w', encoding='utf-8') as f:
    json.dump(settings, f, ensure_ascii=False, indent=2)
print('settings asli ditulis ke', out, '- store_name:', settings.get('store_name'))
strip = ((settings.get('landing_sections') or {}).get('trust_strip') or [])
print('trust_strip:', len(strip), 'item; kunci item[0]:', sorted(strip[0].keys()) if strip and isinstance(strip[0], dict) else '-')
