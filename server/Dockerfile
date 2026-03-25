# =============================================================================
# Stage 1: PHP dependencies (no scripts — run post-install later)
# =============================================================================
FROM composer:2.8 AS vendor

WORKDIR /app
COPY server/composer.json server/composer.lock ./

RUN composer install \
    --no-dev \
    --no-scripts \
    --no-plugins \
    --prefer-dist \
    --optimize-autoloader

# =============================================================================
# Stage 2: Build admin SPA (Vite)
# =============================================================================
FROM node:24-alpine AS assets

WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --prefer-offline

COPY server/ .
RUN npm run build

# =============================================================================
# Stage 3: Production image (PHP-FPM + Nginx via supervisord)
# =============================================================================
FROM dommin/php-8.5-fpm:latest AS production

# Install nginx
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /var/log/supervisor /run/nginx

WORKDIR /var/www/html

# Copy application source
COPY server/ .

# Copy compiled vendor + built assets from previous stages
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build

# PHP config
COPY .docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY .docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf

# Nginx: production config (HTTP only — TLS terminated at ingress)
COPY .docker/nginx/conf.d/prod.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/sites-enabled/default

# Supervisord: php-fpm + nginx (no vite)
COPY .docker/php/supervisord.prod.conf /etc/supervisor/supervisord.conf

# Start script
COPY .docker/php/start.prod.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Storage & cache dirs with correct permissions
RUN mkdir -p \
        storage/framework/sessions \
        storage/framework/views \
        storage/framework/cache \
        storage/logs \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/start.sh"]
