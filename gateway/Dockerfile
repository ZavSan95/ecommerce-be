# ---------- build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos dependencias
COPY package*.json ./
RUN npm ci

# Copiamos el código
COPY . .

# Build de Nest
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copiamos solo lo necesario del build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
