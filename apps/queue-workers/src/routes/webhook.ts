import { Router } from 'express';
import type { Request, Response, Router as ExpressRouter } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';

export const webhookRouter: ExpressRouter = Router();

// Type for the record in the webhook payload
const TableRecordSchema = z.record(z.unknown());

// Schema for different webhook payload types
const WebhookPayloadSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('INSERT'),
    table: z.string(),
    schema: z.string(),
    record: TableRecordSchema,
    old_record: z.null(),
  }),
  z.object({
    type: z.literal('UPDATE'),
    table: z.string(),
    schema: z.string(),
    record: TableRecordSchema,
    old_record: TableRecordSchema,
  }),
  z.object({
    type: z.literal('DELETE'),
    table: z.string(),
    schema: z.string(),
    record: z.null(),
    old_record: TableRecordSchema,
  }),
]);

const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = await WebhookPayloadSchema.parseAsync(req.body);

    console.info('Received webhook payload', {
      type: payload.type,
      table: payload.table,
      schema: payload.schema,
    });

    // Log the full payload for debugging
    console.dir(payload, { depth: null });

    res.status(200).json({ status: 'success' });
  } catch (err) {
    logger.error('Error processing webhook', { error: err });
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Invalid webhook payload',
    });
  }
};

webhookRouter.post('/users', handleWebhook);
