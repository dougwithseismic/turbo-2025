import expressWinston from 'express-winston';

import { logger } from '../config/logger';

export const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP  ',
  expressFormat: true,
  colorize: false,
});
