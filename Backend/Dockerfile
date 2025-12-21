# backend
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

FROM node:18-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder /app/node_modules ./node_modules

COPY Backend/ ./Backend/

COPY package*.json ./
RUN chown -R nodejs:nodejs /app
USER nodejs


EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/users/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "Backend/Server/server.js"]
