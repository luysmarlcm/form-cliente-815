# 1. Usamos la imagen oficial de Node.js
FROM node:20-alpine AS builder

# 2. Establecemos directorio de trabajo
WORKDIR /app

# 3. Copiamos package.json y package-lock.json
COPY package*.json ./

# 4. Instalamos dependencias
RUN npm ci

# 5. Copiamos el resto del proyecto
COPY . .

# 6. Construimos la app Next.js
RUN npm run build

# --- Stage de producción ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV: NEXT_PUBLIC_URL_SERVER=http://172.16.1.37:4000

# Copiamos solo los archivos necesarios desde el stage builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Exponemos el puerto que usará Next.js
EXPOSE 3000

# Comando por defecto
CMD ["npm", "start"]
