# backend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files from root
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Production image
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy Backend application code
COPY Backend/ ./Backend/

# Copy root files needed
COPY package*.json ./

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/users/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "Backend/Server/server.js"]
