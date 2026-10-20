#!/usr/bin/env bash
# Smoke HTTP halaman auth terhadap server dev pemilik (http://127.0.0.1:8000).
# Hanya GET halaman + POST kredensial/token palsu: tidak membuat/mengubah data nyata.
set -u
BASE="http://127.0.0.1:8000"
JAR="tmp/auth-smoke.cookies"
EMAIL="uji-smoke@contoh.test"
rm -f "$JAR"

echo "=== GET halaman ==="
for p in /login /register /forgot-password /reset-password/token-dummy; do
  printf '%-32s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' -c "$JAR" -b "$JAR" "$BASE$p")"
done

XSRF_RAW=$(grep -i 'XSRF-TOKEN' "$JAR" | tail -1 | awk '{print $7}')
XSRF=$(python tmp/urldecode.py "$XSRF_RAW")
echo "xsrf terbaca: $( [ -n "$XSRF_RAW" ] && echo ya || echo tidak )"

echo "=== POST /login (kredensial palsu) ==="
curl -s -o /dev/null -w 'status=%{http_code} redirect=%{redirect_url}\n' \
  -b "$JAR" -c "$JAR" -H "X-XSRF-TOKEN: $XSRF" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -X POST -d "email=$EMAIL&password=salah-banget-123" "$BASE/login"

echo "=== props /login setelah POST gagal ==="
curl -s -b "$JAR" -c "$JAR" "$BASE/login" | grep -o 'data-page=.\{0,240\}'

echo "=== POST /reset-password (token palsu) ==="
curl -s -o /dev/null -w 'status=%{http_code} redirect=%{redirect_url}\n' \
  -b "$JAR" -c "$JAR" -H "X-XSRF-TOKEN: $XSRF" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -X POST -d "token=token-dummy&email=$EMAIL&password=rahasia12345&password_confirmation=rahasia12345" \
  "$BASE/reset-password"

echo "=== props /reset-password/token-dummy setelah POST gagal ==="
curl -s -b "$JAR" -c "$JAR" "$BASE/reset-password/token-dummy" | grep -o 'data-page=.\{0,300\}'
