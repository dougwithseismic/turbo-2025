import {
  Queue,
  Worker,
  Job,
  WaitingChildrenError,
  WorkerOptions,
  QueueOptions,
  JobsOptions,
} from 'bullmq'
import IORedis from 'ioredis'
import {
  JobHandler,
  StepInfo,
  JobHelpers,
  RedisConfig,
  QueueHandlers,
} from './types'
import createQueueRouter from './queue-router'

/** Default options applied to all jobs unless overridden */
const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: false,
  removeOnFail: false,
} as const

/**
 * Manages multiple BullMQ queues with support for multi-step jobs and REST APIs
 * @example
 * ```typescript
 * const queueManager = new QueueManager({
 *   host: 'localhost',
 *   port: 6379
 * });
 *
 * const { queue, worker, getApiRouter } = queueManager.createBull({
 *   name: 'email-queue',
 *   worker: {
 *     steps: [{
 *       name: 'send',
 *       handler: async (job) => {
 *         await sendEmail(job.data);
 *         return { sent: true };
 *       }
 *     }]
 *   }
 * });
 * ```
 */
export class QueueManager {
  private bulls: Map<string, QueueHandlers<any>> = new Map()
  private connection: IORedis

  /**
   * Creates a new QueueManager instance
   * @param redisConfig - Redis connection configuration
   */
  constructor(redisConfig: RedisConfig) {
    this.connection = new IORedis({
      enableOfflineQueue: true,
      connectTimeout: 10000,
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      username: redisConfig.username,
      tls: redisConfig.tls ? {} : undefined,
      maxRetriesPerRequest: null,
    })
  }

  /**
   * Creates a new queue with associated worker and API router
   * @param name - Unique name for the queue
   * @param worker - Configuration for processing jobs
   * @returns Queue handlers including queue, worker, and API router
   *
   * @example
   * ```typescript
   * const { queue } = queueManager.createBull({
   *   name: 'email',
   *   worker: {
   *     steps: [{
   *       name: 'send',
   *       handler: async (job, stepInfo, helpers) => {
   *         // Send email logic
   *         if (needsRetry) {
   *           await helpers.moveToStep(0);
   *         }
   *         return { sent: true };
   *       }
   *     }],
   *     defaultJobOptions: {
   *       attempts: 3
   *     }
   *   }
   * });
   * ```
   */
  createBull<TData, TResult>({
    name,
    worker,
    queueOptions = {
      defaultJobOptions: {
        removeOnComplete: false,
        removeOnFail: false,
      },
    },
  }: {
    name: string
    worker: JobHandler<TData, TResult> & {
      workerOptions?: Partial<WorkerOptions>
    }
    queueOptions?: Partial<QueueOptions>
  }): QueueHandlers<TData> {
    const existingBull = this.bulls.get(name)
    if (existingBull) {
      return existingBull as QueueHandlers<TData>
    }

    const queue = new Queue<TData>(name, {
      connection: this.connection,
      defaultJobOptions: {
        ...DEFAULT_JOB_OPTIONS,
      },
      ...queueOptions,
    })

    const workerInstance = new Worker<TData>(
      name,
      async (job, token) => {
        const jobData = job.data as TData & {
          currentStepIndex?: number
          stepResults?: Record<string, unknown>
        }
        const stepInfo: StepInfo = {
          currentStepIndex: jobData.currentStepIndex ?? 0,
          totalSteps: worker.steps.length,
          stepResults: jobData.stepResults ?? {},
        }

        const updateJobStep = async (newIndex: number) => {
          stepInfo.currentStepIndex = newIndex
          const updatedData = {
            ...jobData,
            currentStepIndex: newIndex,
            stepResults: stepInfo.stepResults,
          }
          await job.updateData(updatedData)
        }

        const helpers: JobHelpers = {
          addChildJob: async <T>(
            queueName: string,
            data: T,
            opts?: JobsOptions,
          ) => {
            const childQueue = this.getQueue<T>(queueName)
            const jobId = job.id
            if (!jobId) {
              throw new Error('Job ID is required for child jobs')
            }
            return await childQueue.add(`${jobId}-${queueName}`, data, {
              ...opts,
              parent: {
                id: jobId,
                queue: job.queueQualifiedName || '',
              },
            })
          },
          waitForChildJobs: async (token: string) => {
            const childJobAdded = await job.moveToWaitingChildren(token)
            if (!childJobAdded) {
              throw new Error('Failed to move to waiting children')
            }
            throw new WaitingChildrenError()
          },
          moveToStep: async (stepIndex: number) => {
            if (stepIndex < 0 || stepIndex >= stepInfo.totalSteps) {
              throw new Error(`Invalid step index: ${stepIndex}`)
            }
            await updateJobStep(stepIndex)
          },
          moveToNextStep: async () => {
            if (stepInfo.currentStepIndex < stepInfo.totalSteps - 1) {
              await updateJobStep(stepInfo.currentStepIndex + 1)
            }
          },
          moveToPreviousStep: async () => {
            if (stepInfo.currentStepIndex > 0) {
              await updateJobStep(stepInfo.currentStepIndex - 1)
            }
          },
          getChildrenValues: async () => job.getChildrenValues(),
          getDependenciesCount: async () => {
            const result = await job.getDependenciesCount()
            return {
              processed: result.processed ?? 0,
              unprocessed: result.unprocessed ?? 0,
            }
          },
          hasWaitingDependencies: async () => {
            const { processed, unprocessed } =
              await helpers.getDependenciesCount()
            return unprocessed > 0 || processed < unprocessed + processed
          },
          getChildJobResults: async <T>(key: string): Promise<T[]> => {
            const { processed } = await job.getDependencies()
            const results = Object.entries(processed || {})
              .filter(([dependencyKey]) => dependencyKey.includes(key))
              .map(([, value]) => value as T)
            return results
          },
          childJobsCompleted: async (key: string): Promise<boolean> => {
            const filteredDependencies = await helpers.getChildJobResults(key)
            const { unprocessed } = await helpers.getDependenciesCount()
            return filteredDependencies.length > 0 && unprocessed === 0
          },
        }

        while (stepInfo.currentStepIndex < stepInfo.totalSteps) {
          const currentStep = worker.steps[stepInfo.currentStepIndex]
          if (!currentStep) {
            throw new Error('Current step is undefined')
          }

          try {
            const hasWaiting = await helpers.hasWaitingDependencies()

            if (hasWaiting) {
              await helpers.waitForChildJobs(String(token))
              continue
            }

            const result = await currentStep.handler(
              job,
              stepInfo,
              helpers,
              String(token),
            )
            stepInfo.stepResults[currentStep.name] = result

            if (stepInfo.currentStepIndex === stepInfo.totalSteps - 1) {
              return result as TResult
            }

            if (
              stepInfo.currentStepIndex === worker.steps.indexOf(currentStep)
            ) {
              const stillHasWaiting = await helpers.hasWaitingDependencies()
              if (!stillHasWaiting) {
                await helpers.moveToNextStep()
              }
            }
          } catch (error) {
            if (error instanceof WaitingChildrenError) {
              continue
            }
            throw error
          }
        }
      },
      {
        connection: this.connection,
        concurrency: worker.workerOptions?.concurrency ?? 8,
        ...worker.workerOptions,
      },
    )

    if (worker.onCompleted) {
      workerInstance.on('completed', worker.onCompleted)
    }
    if (worker.onFailed) {
      workerInstance.on('failed', (job, error) => {
        if (job && worker.onFailed) {
          worker.onFailed(job, error)
        }
      })
    }

    const handlers = {
      queue,
      worker: workerInstance,
      getApiRouter: () => {
        return createQueueRouter(queue)
      },
    }

    this.bulls.set(name, handlers)
    return handlers
  }

  /**
   * Gets an existing queue by name
   * @param name - Name of the queue to retrieve
   * @returns The queue instance
   * @throws Error if queue doesn't exist
   */
  getQueue<T>(name: string): Queue<T> {
    const bull = this.bulls.get(name)
    if (!bull) {
      throw new Error(`Queue ${name} does not exist`)
    }
    return bull.queue as Queue<T>
  }

  /**
   * Closes all queues and workers
   * Should be called when shutting down the application
   */
  async closeAll(): Promise<void> {
    await Promise.all(
      [...this.bulls.values()].map(({ queue, worker }) =>
        Promise.all([queue.close(), worker.close()]),
      ),
    )
    await this.connection.quit()
  }
}

export type { Queue, Worker }
