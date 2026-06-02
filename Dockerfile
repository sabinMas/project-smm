FROM node:22-alpine

WORKDIR /app

# Copy monorepo
COPY package*.json tsconfig*.json ./
COPY shared/ ./shared/
COPY backend/ ./backend/

# Install deps
RUN npm install --workspace=backend

# Build backend (shared is just types, no build needed)
RUN npm --workspace=backend run build

# Start backend
EXPOSE 3000
CMD ["node", "backend/dist/index.js"]
