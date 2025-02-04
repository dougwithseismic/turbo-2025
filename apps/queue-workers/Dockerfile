FROM apify/actor-node-playwright-chrome:20

# Install PNPM globally
RUN npm install -g pnpm@8.15.6

# Set up work directory
WORKDIR /app

# Copy root workspace files
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./

# Copy all workspace packages and apps
COPY packages/ packages/
COPY apps/ apps/
COPY .env* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build all dependencies
RUN pnpm build

# Install browsers for Crawlee
RUN pnpm dlx playwright install \
    && pnpm dlx crawlee install-playwright-browsers

# Create storage directory for Crawlee
RUN mkdir -p /app/apps/queue-workers/storage

# Set environment variable for storage
ENV CRAWLEE_STORAGE_DIR=/app/apps/queue-workers/storage

# Set working directory to queue-workers
WORKDIR /app/apps/queue-workers

# Expose the port (adjust if needed)
EXPOSE 3000

# Start the queue workers service
CMD ["pnpm", "start"]