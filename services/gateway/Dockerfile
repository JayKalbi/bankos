# 1. Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed for build (e.g. typescript)
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# 2. Production Dependencies Stage
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev

# 3. Final Production Stage
FROM gcr.io/distroless/nodejs22-debian12 AS runner

WORKDIR /app

# Set Node to production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy only the necessary files from previous stages
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

EXPOSE 3000

# Start the application
CMD ["dist/index.js"]
