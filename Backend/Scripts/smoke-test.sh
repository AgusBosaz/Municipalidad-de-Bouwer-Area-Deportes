#!/bin/sh
set -eu

if [ -z "${API_BASE_URL:-}" ]; then
    echo "Falta configurar API_BASE_URL."
    exit 1
fi

echo "Comprobando el endpoint público de actividades..."

codigo=$(curl --silent --show-error \
    --output /dev/null \
    --write-out '%{http_code}' \
    "${API_BASE_URL%/}/api/Activity/public")

if [ "$codigo" != "200" ]; then
    echo "La API respondió con HTTP $codigo; se esperaba 200."
    exit 1
fi

echo "La API respondió correctamente con HTTP 200."