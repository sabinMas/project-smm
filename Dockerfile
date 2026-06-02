FROM node:22-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install

# Build shared first (generates dist/index.d.ts)
RUN npx tsc --project shared/tsconfig.json

# Build backend
RUN npx tsc --build backend

# Start server
EXPOSE 3000
CMD ["node", "backend/dist/index.js"]
