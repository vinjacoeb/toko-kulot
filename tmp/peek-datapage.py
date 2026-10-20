import sys

html = open(sys.argv[1], encoding='utf-8', errors='replace').read()
i = html.find('data-page')
print('cuplikan sekitar data-page:')
print(repr(html[max(0, i - 140):i + 200]))
j = html.find('id="app"')
print('\ncuplikan sekitar id="app":')
print(repr(html[max(0, j - 120):j + 220]))
