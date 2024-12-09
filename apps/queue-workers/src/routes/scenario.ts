import { Router } from 'express';
import type { Request, Response, Router as ExpressRouter } from 'express';
import { z } from 'zod';
import { puppeteerService } from '../services/puppeteer-service';
import { logger } from '../config/logger';

export const scenarioRouter: ExpressRouter = Router();

const InteractionSchema = z.object({
  selector: z.string(),
  action: z.enum(['click', 'type', 'hover']),
  value: z.string().optional(),
  waitAfter: z.number().optional(),
});

const ScenarioSchema = z.object({
  url: z.string().url(),
  interactions: z.array(InteractionSchema).optional(),
  captureScreenshots: z.boolean().optional(),
});

type ScenarioRequest = z.infer<typeof ScenarioSchema>;

const createScenario = async (
  req: Request<unknown, unknown, ScenarioRequest>,
  res: Response,
): Promise<void> => {
  try {
    const { url, interactions, captureScreenshots } =
      await ScenarioSchema.parseAsync(req.body);

    const result = await puppeteerService.executeScenario({
      url,
      interactions,
      captureScreenshots,
    });

    res.json(result);
  } catch (err) {
    logger.error('Error creating scenario', { error: err });
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Invalid request',
    });
  }
};

scenarioRouter.post('/', createScenario);
