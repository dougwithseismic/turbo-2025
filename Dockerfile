# Use Node.js LTS with glibc
FROM node:20

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

# Set working directory
WORKDIR /app

# Copy entire project for Turborepo
COPY . .

# Install dependencies
RUN pnpm install

# Build queue workers package
RUN pnpm build:queue

# Set environment variables
ENV NODE_ENV=production

# Start the queue worker
CMD cd apps/queue-workers && pnpm start