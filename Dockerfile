FROM node:22-alpine

WORKDIR /app

# Copy monorepo
COPY package*.json ./
COPY tsconfig.base.json ./
COPY shared/ ./shared/
COPY backend/ ./backend/

# Install all deps
RUN npm install

# Build
WORKDIR /app/backend
RUN npm run build

# Start backend
EXPOSE 3000
CMD ["node", "dist/index.js"]
