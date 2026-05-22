#!/bin/sh
set -e

if [ "$#" -gt 0 ]; then
    exec "$@"
fi

if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

# Ensure .next cache directory exists with correct permissions
mkdir -p .next

echo "Starting Node server..."
exec npm run dev
