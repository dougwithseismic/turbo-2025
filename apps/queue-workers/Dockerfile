FROM apify/actor-node-playwright-chrome:20 AS builder

# Copy package files and lockfile
COPY --chown=myuser package*.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY --chown=myuser . ./

# Build the project
RUN pnpm run build

# Create final image
FROM apify/actor-node-playwright-chrome:20

# Copy built files and dependencies
COPY --from=builder --chown=myuser /home/myuser/dist ./dist
COPY --chown=myuser package*.json ./

# Install production dependencies
RUN pnpm config set progress false \
    && pnpm install --prod \
    && pnpm dlx playwright install \
    && pnpm dlx crawlee install-playwright-browsers

# Copy remaining files
COPY --chown=myuser . ./

# Create storage directory for Crawlee
RUN mkdir -p storage \
    && chown -R myuser:myuser storage

# Set environment variable for storage
ENV CRAWLEE_STORAGE_DIR=/home/myuser/storage

# Expose the port
EXPOSE 3000

# Start the service
CMD ./start_xvfb_and_run_cmd.sh && pnpm run start:prod --silent 