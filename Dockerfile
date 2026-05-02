# Multi-stage Dockerfile for Zafkiel Arcade
FROM node:22-alpine AS frontend-builder
WORKDIR /app/web
COPY interface/web/package*.json ./
RUN npm install
COPY interface/web/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
COPY --from=frontend-builder /app/web/dist ./interface/web/dist
EXPOSE 3000
CMD ["node", "interface/api/server.js"]
