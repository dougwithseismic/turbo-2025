import { queueManager } from '../lib/queue-manager';

const {
  queue: testQueue,
  worker: testWorker,
  getApiRouter: getTestApiRouter,
} = queueManager.createBull<{ name: string }, { name: string }>({
  name: 'test',
  worker: {
    steps: [
      {
        name: 'test',
        handler: async (job) => {
          console.log(job.data);
          return { name: job.data.name };
        },
      },
      {
        name: 'test2',
        handler: async (job, stepInfo) => {
          console.log('test2', job.data);
          console.log(stepInfo);
          return { name: job.data.name };
        },
      },
    ],
  },
});

export { testQueue, testWorker, getTestApiRouter };
