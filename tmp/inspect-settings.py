import json
import re
import sys

# Inspeksi props `settings` yang benar-benar dikirim server (bukan asumsi kontrak).
# Template repo menaruh payload Inertia di: <script data-page="app" type="application/json">{...}</script>
html = open(sys.argv[1], encoding='utf-8', errors='replace').read()
m = re.search(r'<script[^>]*data-page="app"[^>]*>(.*?)</script>', html, re.S)
if not m:
    print('payload data-page tidak ditemukan')
    sys.exit(1)

page = json.loads(m.group(1))
props = page.get('props', {})
settings = props.get('settings') or {}
print('component :', page.get('component'))
print('settings keys:', sorted(settings.keys()))
sections = settings.get('landing_sections') or {}
print('landing_sections keys:', sorted(sections.keys()))
strip = sections.get('trust_strip')
print('trust_strip tipe:', type(strip).__name__, 'jumlah:', len(strip) if isinstance(strip, list) else '-')
if isinstance(strip, list):
    for i, item in enumerate(strip[:4]):
        if isinstance(item, dict):
            print(f'  item[{i}] keys={sorted(item.keys())} nilai={json.dumps(item, ensure_ascii=False)[:160]}')
        else:
            print(f'  item[{i}] = {item!r}')
print('store_logo:', settings.get('store_logo'))
print('store_tagline:', settings.get('store_tagline'))
