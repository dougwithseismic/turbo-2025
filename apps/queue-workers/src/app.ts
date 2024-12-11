import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';

import { config } from './config/app-config';
import { logger } from './config/logger';
import { initializeSentry } from './config/sentry';
import { requestLogger } from './middleware/request-logger';
import { healthRouter } from './routes/health';
import { webhookRouter } from './routes/webhook';

import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { testQueue } from './services/test-bull';
import { getTestApiRouter } from './services/test-bull';
import { crawlQueue, getCrawlApiRouter } from './services/crawl-bull';
import { Queue } from '@repo/queue-manager';

const PORT = config.PORT;

// Initialize Sentry
initializeSentry();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/health', healthRouter);
app.use('/api/webhook', webhookRouter);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, next: any) => {
  logger.error('Unhandled error', { error: err.stack });

  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
  next(err);
});

// Queues
const setupQueuesAndBullBoard = ({
  queues,
}: {
  queues: Array<{ queue: Queue; getApiRouter: () => express.RequestHandler }>;
}) => {
  // Setup Bull Board
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const board = createBullBoard({
    queues: [],
    serverAdapter,
  });

  // Setup API routes for each queue
  queues.forEach(({ queue, getApiRouter }) => {
    const queueName = queue.name;
    app.use(`/api/queues/${queueName}`, getApiRouter());
    board.addQueue(new BullMQAdapter(queue));
  });

  app.use('/admin/queues', serverAdapter.getRouter());
  logger.info(`BullBoard is running on http://localhost:${PORT}/admin/queues`);
};

setupQueuesAndBullBoard({
  queues: [
    { queue: testQueue, getApiRouter: getTestApiRouter },
    { queue: crawlQueue, getApiRouter: getCrawlApiRouter },
  ],
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 :: Server is running on port ${PORT}`);
});

// Cleanup on shutdown
const cleanup = async () => {
  server.close();
  process.exit(0);
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
