# Etapa 1: Construcción
FROM node:22 AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración de tu proyecto
COPY ./inclusionlectora_web/package.json ./inclusionlectora_web/package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY ./inclusionlectora_web/ ./

# Construye la aplicación para producción
RUN npm run build

# Etapa 2: Servir contenido estático
FROM nginx:alpine

# Copia los archivos generados en la etapa de construcción al contenedor Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expone el puerto 80 para acceder a la aplicación
EXPOSE 80

# Comando por defecto para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
