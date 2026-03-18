#!/bin/sh
set -e

# If arguments are passed, run them directly (e.g. docker compose run node npm install)
if [ "$#" -gt 0 ]; then
    exec "$@"
fi

if [ ! -d "node_modules" ] && [ -f "package.json" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

echo "Starting Node server..."
exec npm run dev
