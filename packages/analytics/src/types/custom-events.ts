import { z } from 'zod'

export interface RegisteredEvent {
  name: string
  schema: z.ZodSchema
}

// Type to extract the inferred type from a Zod schema
export type InferSchemaType<T extends z.ZodSchema> = z.infer<T>

// Type to represent a custom event with its schema
export interface CustomEventConfig {
  schema: z.ZodSchema
}

// Type to represent all registered custom events
export interface CustomEventRegistry {
  [eventName: string]: z.ZodSchema
}

// Remove duplicate CustomEventProperties type since it's in events.ts
