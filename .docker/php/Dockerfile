FROM dommin/php-8.5-fpm:latest

WORKDIR /var/www/html

COPY .docker/php/php.ini /usr/local/etc/php/conf.d/php.ini
COPY .docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY .docker/php/supervisord.conf /etc/supervisor/supervisord.conf
COPY .docker/php/start.sh /usr/local/bin/start.sh

RUN chmod +x /usr/local/bin/start.sh && mkdir -p /var/www/html/node_modules && chmod 0777 /var/www/html/node_modules
ENV NPM_CONFIG_CACHE=/tmp/.npm

EXPOSE 9000

CMD ["/usr/local/bin/start.sh"]
