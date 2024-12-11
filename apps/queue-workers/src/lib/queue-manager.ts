import { QueueManager } from '@repo/queue-manager';
import { config } from '../config/app-config';

const REDIS_CONNECTION = {
  host: config.REDIS.URL!,
  port: config.REDIS.PORT,
  password: config.REDIS.PASSWORD!,
  username: config.REDIS.USER!,
};

export const queueManager = new QueueManager(REDIS_CONNECTION);
