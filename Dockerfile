# ============================================================
# Stage 1 — Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first so dependency layer is cached
COPY package*.json ./

# Clean install (uses package-lock.json for reproducibility)
RUN npm ci

# Copy the rest of the source
COPY . .

# Build Angular SSR application
RUN npm run build

# ============================================================
# Stage 2 — Production
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy compiled Angular SSR output from builder
COPY --from=builder /app/dist ./dist

# Copy package manifests and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Expose the SSR server port
EXPOSE 4000

# Start the Angular SSR/Express server
CMD ["node", "dist/task-manager/server/server.mjs"]
