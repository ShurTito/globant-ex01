# Usar una imagen de Node.js
FROM node:18

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos del proyecto al contenedor
COPY . .

# Instalar las dependencias
RUN npm install

# Exponer el puerto
EXPOSE 3000

# Iniciar la aplicación
CMD ["node", "server/server.js"]