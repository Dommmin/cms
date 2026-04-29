#!/bin/sh
set -e

if [ ! -f "node_modules/.package-lock.json" ] && [ -f "package.json" ]; then
    echo "Installing Laravel frontend dependencies..."
    npm install
fi

exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
