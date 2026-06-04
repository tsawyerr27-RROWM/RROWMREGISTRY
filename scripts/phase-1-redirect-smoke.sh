#!/usr/bin/env bash
# Phase 1 PR6 — legacy → canonical redirect smoke (requires running Next server).
# Usage: ./scripts/phase-1-redirect-smoke.sh [base_url]
set -euo pipefail

BASE="${1:-http://127.0.0.1:3000}"

check_redirect() {
  local path="$1"
  local expect_location="$2"
  local headers
  headers="$(curl -sI "${BASE}${path}")"
  local status location
  status="$(echo "$headers" | grep -E '^HTTP/' | head -1)"
  location="$(echo "$headers" | grep -i '^location:' | tr -d '\r' | awk '{print $2}' | head -1)"
  if [[ "$location" != "$expect_location" ]]; then
    echo "FAIL ${path}: expected Location: ${expect_location}, got: ${location:-<none>} (${status})"
    return 1
  fi
  echo "PASS ${path} → ${location} (${status})"
}

check_no_redirect_loop() {
  local path="$1"
  local final redirects
  final="$(curl -sI -L --max-redirs 5 -w '%{url_effective} %{num_redirects}' -o /dev/null "${BASE}${path}")"
  redirects="$(echo "$final" | awk '{print $NF}')"
  url="$(echo "$final" | awk '{print $1}')"
  if [[ "$redirects" -gt 1 ]]; then
    echo "FAIL ${path}: ${redirects} redirects, final ${url}"
    return 1
  fi
  echo "PASS ${path}: ≤1 redirect, final ${url}"
}

echo "Phase 1 redirect smoke — ${BASE}"
echo "--- Legacy stubs (308/307) ---"
# /studio lives under app/studio/layout: unauthenticated HEAD may be 200 (client guard → login).
# R-01 stub verified in phase-1-static-acceptance.ts; optional sessioned check omitted here.
headers_studio="$(curl -sI "${BASE}/studio")"
if echo "$headers_studio" | grep -qi '^location: /studio/creative'; then
  echo "PASS /studio → /studio/creative ($(echo "$headers_studio" | head -1))"
elif echo "$headers_studio" | grep -qE '^HTTP/[12](\.[01])? 200'; then
  echo "PASS /studio: 200 (layout guard SSR; R-01 stub confirmed statically)"
else
  echo "FAIL /studio: unexpected response"
  echo "$headers_studio" | head -5
  exit 1
fi
check_redirect "/collector-studio" "/studio/collector"
check_redirect "/institutional-studio-dashboard" "/studio/organisation"
check_redirect "/account" "/studio/account"
check_redirect "/personal-archive" "/studio/archive"
check_redirect "/account/restore?token=test" "/studio/account/restore?token=test"

echo "--- next.config chains ---"
check_redirect "/dashboard" "/studio/creative"
check_redirect "/gallery-dashboard" "/studio/organisation"

echo "--- No redirect loop ---"
check_no_redirect_loop "/personal-archive"
check_no_redirect_loop "/studio/archive"

echo "--- Unchanged public paths (must not redirect to /studio) ---"
for p in "/artist/test-artist" "/collector-studio/my-slug" "/institutional-studio/my-gallery"; do
  headers="$(curl -sI "${BASE}${p}")"
  loc="$(echo "$headers" | grep -i '^location:' | tr -d '\r' | awk '{print $2}' | head -1 || true)"
  if [[ -n "$loc" && "$loc" == *"/studio/"* ]]; then
    echo "FAIL ${p}: unexpected studio redirect ${loc}"
    exit 1
  fi
  echo "PASS ${p}: no studio redirect ($(echo "$headers" | head -1))"
done

echo "All redirect smoke checks passed."
