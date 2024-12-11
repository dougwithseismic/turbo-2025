import { queueManager } from '../lib/queue-manager';

const {
  queue: crawlQueue,
  worker: crawlWorker,
  getApiRouter: getCrawlApiRouter,
} = queueManager.createBull<{ name: string }, { name: string }>({
  name: 'crawl',
  worker: {
    steps: [
      {
        name: 'crawl',
        handler: async (job) => {
          console.log(job.data);
          return { name: job.data.name };
        },
      },
      {
        name: 'crawl2',
        handler: async (job, stepInfo) => {
          console.log('crawl2', job.data);
          console.log(stepInfo);
          return { name: job.data.name };
        },
      },
    ],
  },
});

export { crawlQueue, crawlWorker, getCrawlApiRouter };
