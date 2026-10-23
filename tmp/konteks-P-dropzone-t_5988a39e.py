"""Lihat konteks identifier bebas di chunk DropzoneGalery (temuan sweep bundel)."""
import re

p = 'public/build/assets/DropzoneGalery-B4SySNiU.js'
s = open(p, encoding='utf-8').read()
print('panjang chunk:', len(s))
for m in re.finditer(r'\bP\b', s):
    a = max(0, m.start() - 140)
    b = min(len(s), m.end() + 140)
    print('---')
    print(s[a:b])
