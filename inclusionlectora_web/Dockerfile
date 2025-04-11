# Solo producción (sin etapa de build)
FROM nginx:stable-alpine AS production

# Copiar solo el build generado localmente
COPY build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
