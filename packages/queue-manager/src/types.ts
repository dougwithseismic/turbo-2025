import { Job, WorkerOptions, JobsOptions, Queue, Worker } from 'bullmq';
import { RequestHandler } from 'express';

export type JobStepResult = any;

/** Information about the current state of a job's execution */
export interface StepInfo {
  /** Current step index in the job's execution */
  currentStepIndex: number;
  /** Total number of steps in the job */
  totalSteps: number;
  /** Results from previous steps, keyed by step name */
  stepResults: Record<string, JobStepResult>;
}

/** Helper functions available to job steps */
export interface JobHelpers {
  /** Add a child job that the current job will wait for */
  addChildJob: <T>(
    queueName: string,
    data: T,
    opts?: JobsOptions,
  ) => Promise<Job<T>>;
  /** Pause the current job until all child jobs complete */
  waitForChildJobs: (token: string) => Promise<void>;
  /** Move to a specific step index */
  moveToStep: (stepIndex: number) => Promise<void>;
  /** Move to the next step */
  moveToNextStep: () => Promise<void>;
  /** Move to the previous step */
  moveToPreviousStep: () => Promise<void>;
  /** Get values from all child jobs */
  getChildrenValues: () => Promise<Record<string, any>>;
  /** Get count of processed and unprocessed dependencies */
  getDependenciesCount: () => Promise<{
    processed: number;
    unprocessed: number;
  }>;
  /** Check if job has waiting dependencies */
  hasWaitingDependencies: () => Promise<boolean>;
  /** Get results from child jobs matching a key */
  getChildJobResults: <T>(key: string) => Promise<T[]>;
  /** Check if all child jobs with a specific key are completed */
  childJobsCompleted: (key: string) => Promise<boolean>;
}

/** Represents a single step in a job's execution */
export interface JobStep<TData, TResult> {
  /** Name of the step */
  name: string;
  /** Handler function that executes the step logic */
  handler: (
    job: Job<TData>,
    stepInfo: StepInfo,
    helpers: JobHelpers,
    token: string,
  ) => Promise<JobStepResult>;
}

/** Configuration for handling a specific type of job */
export interface JobHandler<TData = any, TResult = any> {
  /** Array of steps to execute for this job */
  steps: JobStep<TData, TResult>[];
  /** Called when job completes successfully */
  onCompleted?: (job: Job<TData>, result: TResult) => void;
  /** Called when job fails */
  onFailed?: (job: Job<TData>, error: Error) => void;
}

/** Redis connection configuration */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  username?: string;
  tls?: boolean;
}

/** Options for getting a router */
export interface GetRouterOptions {
  basePath?: string;
}

/** Handlers returned when creating a new queue */
export interface QueueHandlers<TData> {
  /** The BullMQ queue instance */
  queue: Queue<TData>;
  /** The BullMQ worker instance */
  worker: Worker<TData>;
  /** Get an Express router for queue operations */
  getApiRouter: (options?: GetRouterOptions) => RequestHandler;
}
