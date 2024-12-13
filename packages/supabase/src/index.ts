import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { z } from 'zod';
import { createEnv } from '@t3-oss/env-core';

// Re-export base types
export type {
  Json,
  ResourceType,
  Role,
  SubscriberType,
  OwnerType,
} from './types';

export type { Database } from './database.types';
export type { DbFunctions } from './database.functions';

// Export all modules with their types
export * from './module/api-services';
export * from './module/api-usage';
export * from './module/credit-pools';
export * from './module/credit-transactions';
export * from './module/oauth';
export * from './module/onboarding';
export * from './module/organizations';
export * from './module/profiles';
export * from './module/projects';

// Export stripe and subscriptions separately to avoid conflicts
export {
  createSubscription,
  getSubscription,
  updateSubscription,
  allocateSubscriptionCredits,
} from './module/stripe';
export type { SubscriptionPlan } from './module/stripe';

const env = createEnv({
  server: {
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export type SupabaseClient = ReturnType<typeof createClient<Database>>;

let supabaseInstance: SupabaseClient | null = null;

const createSupabaseClient = ({
  supabaseUrl = env.SUPABASE_URL,
  supabaseAnonKey = env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY,
}: {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
}): SupabaseClient => {
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is required');
  }

  if (!supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY is required');
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      supabaseUrl,
      supabaseServiceRoleKey ?? supabaseAnonKey,
    );
  }
  return supabaseInstance;
};

export { createSupabaseClient };
