# Multi-stage build for optimized production image

# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build app
RUN npm run build


# Stage 2: Production server
FROM node:18-alpine

WORKDIR /app

# Install static server
RUN npm install -g serve

# Copy built app
COPY --from=builder /app/dist ./dist

# Expose app port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => { if (r.statusCode !== 200) process.exit(1) })"

# Run app
CMD ["serve", "-s", "dist", "-l", "3000"]
