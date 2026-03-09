#!/bin/sh
set -e

CERT=/etc/nginx/certs/localhost.crt
KEY=/etc/nginx/certs/localhost.key

if [ ! -f "$CERT" ]; then
  echo "Generating self-signed SSL cert..."
  openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout $KEY \
    -out $CERT \
    -subj "/C=PL/ST=Dev/L=Local/O=Dev/OU=Dev/CN=localhost"
fi

exec "$@"
