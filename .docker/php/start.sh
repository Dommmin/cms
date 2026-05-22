#!/bin/sh
set -e

if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "Installing Laravel frontend dependencies..."
    npm install
fi

if [ "${XDEBUG_MODE}" != "" ] && [ "${XDEBUG_MODE}" != "off" ]; then
    echo "Enabling Xdebug: ${XDEBUG_MODE}"
    sed -i "s/xdebug.mode=off/xdebug.mode=${XDEBUG_MODE}/" /usr/local/etc/php/conf.d/php.ini
fi

exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
