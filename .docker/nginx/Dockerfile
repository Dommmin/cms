FROM nginx:alpine

RUN apk add --no-cache openssl bash

RUN mkdir -p /etc/nginx/certs

COPY .docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY .docker/nginx/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
