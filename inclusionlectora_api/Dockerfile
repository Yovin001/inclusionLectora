# Imagen base ligera
FROM node:22-slim

# Establecer el directorio de trabajo
WORKDIR /app

# Instalar Python, pip, ffmpeg y pdf2docx en una sola capa optimizada
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        ffmpeg && \
    pip3 install pdf2docx --break-system-packages && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copiar los archivos de configuración
COPY package.json package-lock.json ./

# Instalar dependencias de Node.js
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de la app
EXPOSE 3007

# Comando de inicio
CMD ["npm", "start"]
