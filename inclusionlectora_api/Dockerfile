# Usa una imagen base de Node.js 22
FROM node:22

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instala dependencias del sistema: Python, pip, ffmpeg, etc.
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Instala la librería pdf2docx para Python
RUN pip3 install pdf2docx --break-system-packages

# Copia los archivos de configuración de tu proyecto
COPY package.json package-lock.json ./

# Instala las dependencias de Node.js
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto que utiliza tu aplicación
EXPOSE 3007

# Comando por defecto para ejecutar tu aplicación
CMD ["npm", "start"]
