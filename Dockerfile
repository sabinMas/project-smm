FROM node:22-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install all deps
RUN npm install --legacy-peer-deps

# Build in root so references work
RUN npx tsc --project tsconfig.json

EXPOSE 3000
CMD ["node", "backend/dist/index.js"]
