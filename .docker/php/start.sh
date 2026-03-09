#!/bin/sh
set -e

if [ ! -d "node_modules" ] && [ -f "package.json" ]; then
    echo "Installing Laravel frontend dependencies..."
    npm install
fi

exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
