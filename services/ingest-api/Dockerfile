FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# Production stage
FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --no-frozen-lockfile --prod

# Copy built files from base stage
COPY --from=base /app/dist ./dist

EXPOSE 3001

CMD ["pnpm", "start"]
