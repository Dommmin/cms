FROM node:24-bookworm

WORKDIR /var/www/html

COPY .docker/node/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENV NPM_CONFIG_CACHE=/tmp/.npm

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
