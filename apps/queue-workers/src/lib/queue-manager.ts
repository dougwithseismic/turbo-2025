import { QueueManager } from '@repo/queue-manager'

export const queueManager = new QueueManager({ url: process.env.REDIS_URL! })
