import json
p = r"C:\Users\LENOVO\AppData\Local\hermes\profiles\uiux\cache\spillover\call_00_qPspu7YfNhbRyJLynVNs9928.txt"
d = json.load(open(p, encoding="utf-8"))
for pg in d["pages"]:
    print(pg["id"], pg["type"], pg["name"], "children:", pg.get("childCount"))
    for ch in pg.get("children", []):
        print("   ", ch["id"], ch["type"], ch["name"], "kids:", ch.get("childCount"))
