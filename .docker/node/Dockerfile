FROM node:24-bookworm

RUN npm install -g npm@latest

WORKDIR /var/www/client

COPY .docker/node/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh && mkdir -p node_modules .next && chmod 0777 node_modules .next
ENV NPM_CONFIG_CACHE=/tmp/.npm

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
