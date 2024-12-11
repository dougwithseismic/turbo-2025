import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

import { config } from './app-config';

export const initSentry = (): void => {
  if (config.SENTRY.ENABLED) {
    Sentry.init({
      dsn: config.SENTRY.DSN,
      environment: config.NODE_ENV,
      integrations: [new ProfilingIntegration()],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });
  }
};
