FROM apify/actor-node-playwright-chrome:20

# Copy package files and lockfile
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Install browsers
RUN pnpm dlx playwright install \
    && pnpm dlx crawlee install-playwright-browsers

# Create storage directory for Crawlee
RUN mkdir -p storage

# Set environment variable for storage
ENV CRAWLEE_STORAGE_DIR=/storage

# Change to queue-workers directory
WORKDIR /apps/queue-workers

# Expose the port
EXPOSE 3000

# Start the service
CMD ["pnpm", "run", "start"]