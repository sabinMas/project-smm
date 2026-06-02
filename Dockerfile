FROM node:22-alpine

WORKDIR /app

# Copy ONLY backend + shared (minimal deps)
COPY package.json package-lock.json tsconfig.base.json ./
COPY shared ./shared
COPY backend ./backend

# Install
RUN npm install

# Build
RUN cd backend && npm run build

# Run
EXPOSE 3000
CMD ["node", "backend/dist/index.js"]
