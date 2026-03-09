FROM dommin/php-8.4-fpm:latest

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    jpegoptim \
    optipng \
    pngquant \
    webp \
    gifsicle \
    && rm -rf /var/lib/apt/lists/*

COPY .docker/php/php.ini /usr/local/etc/php/conf.d/php.ini
COPY .docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY .docker/php/supervisord.conf /etc/supervisor/supervisord.conf
COPY .docker/php/start.sh /usr/local/bin/start.sh

RUN chmod +x /usr/local/bin/start.sh
ENV NPM_CONFIG_CACHE=/tmp/.npm

EXPOSE 9000

CMD ["/usr/local/bin/start.sh"]
