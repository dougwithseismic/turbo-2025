import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import type { Json } from '../types';

type OnboardingStep =
  | 'signup_completed'
  | 'google_connected'
  | 'gsc_connected'
  | 'first_project_created'
  | 'first_site_added'
  | 'first_crawl_completed'
  | 'subscription_selected';

type UserOnboarding = Database['public']['Tables']['user_onboarding']['Row'];

const getUserOnboarding = async ({
  supabase,
  userId,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
}) => {
  const { data, error } = await supabase
    .from('user_onboarding')
    .select()
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

const updateOnboardingStep = async ({
  supabase,
  userId,
  currentStep,
  isCompleted = false,
  metadata = {},
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  currentStep: OnboardingStep;
  isCompleted?: boolean;
  metadata?: Json;
}) => {
  const { data: existing } = await supabase
    .from('user_onboarding')
    .select('completed_steps')
    .eq('user_id', userId)
    .single();

  const completedSteps = existing?.completed_steps || [];
  if (!completedSteps.includes(currentStep)) {
    completedSteps.push(currentStep);
  }

  const { data, error } = await supabase
    .from('user_onboarding')
    .upsert({
      user_id: userId,
      current_step: currentStep,
      completed_steps: completedSteps,
      is_completed: isCompleted,
      metadata,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const createOAuthState = async ({
  supabase,
  userId,
  redirectTo,
  expiresIn = 3600, // 1 hour
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  redirectTo?: string;
  expiresIn?: number;
}) => {
  const state = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { data, error } = await supabase
    .from('oauth_states')
    .insert({
      user_id: userId,
      state,
      redirect_to: redirectTo,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const verifyOAuthState = async ({
  supabase,
  state,
}: {
  supabase: SupabaseClient<Database>;
  state: string;
}) => {
  const { data, error } = await supabase
    .from('oauth_states')
    .select()
    .eq('state', state)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) throw error;
  return data;
};

export {
  getUserOnboarding,
  updateOnboardingStep,
  createOAuthState,
  verifyOAuthState,
};

export type { OnboardingStep, UserOnboarding };
