FROM node:22-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install ALL dependencies
RUN npm install

# Build backend from root (tsc --build in backend dir)
WORKDIR /app/backend
RUN npm run build

# Start server
EXPOSE 3000
CMD ["node", "dist/index.js"]
