# Stage 1: Build the Vite frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/interface/web
COPY interface/web/package*.json ./
RUN npm install
COPY interface/web/ ./
RUN npm run build

# Stage 2: Build the Express backend
FROM node:22-alpine
WORKDIR /app

# No native build tools needed for Supabase client

# Copy package.json and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy backend source code
COPY core/ ./core/
COPY utils/ ./utils/
COPY interface/api/ ./interface/api/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/interface/web/dist ./interface/web/dist

# Ensure the database directory exists and is writable if needed
# Better-sqlite3 will create it in /app/arcade.db by default

EXPOSE 3000
CMD ["npm", "run", "start"]
