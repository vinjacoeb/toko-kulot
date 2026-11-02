import json, sys

p = r"C:\Users\LENOVO\AppData\Local\hermes\profiles\uiux\cache\spillover\call_00_81nHMA105sMBfDTLHCtW6604.txt"
d = json.load(open(p, encoding="utf-8"))
print(d["name"], d.get("path"), "currentPage", d["currentPage"])
print("variables", d.get("variableCount"))
for pg in d["pages"]:
    print("PAGE", pg["id"], pg["name"], "childCount", pg.get("childCount"))
    for c in pg.get("children", []):
        print("   ", c["id"], c["type"], c["name"][:70], c.get("childCount"), c.get("width"), c.get("height"))
