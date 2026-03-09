#!/bin/sh
set -e

if [ ! -d "node_modules" ] && [ -f "package.json" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

echo "Starting Node server..."
exec npm run dev
