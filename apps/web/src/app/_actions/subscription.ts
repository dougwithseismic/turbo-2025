'use server';

import { stripe } from '@repo/stripe';
import { supabaseClient as supabase } from '@/lib/supabase/client';
import { auth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Stripe } from 'stripe';

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
  url?: string;
};

type SubscriptionWithPrice = Stripe.Subscription & {
  items: {
    data: Array<{
      price: Stripe.Price;
    }>;
  };
};

/**
 * Fetches the current user's subscription data
 */
export const getCurrentSubscription = async () => {
  try {
    const user = await auth();

    const serverClient = await createSupabaseServerClient();

    if (!user) {
      return null;
    }

    // Since we're using the client library, RLS policies will be enforced
    // The user can only access their own data based on auth.uid() in the policies
    const { data: customerData, error: customerError } = await serverClient
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id) // Using user.id ensures RLS policy is satisfied
      .single();

    if (customerError || !customerData?.stripe_customer_id) {
      // It's okay if the customer does not exist, it just means they haven't purchased a subscription yet
      console.info('Customer does not exist:', customerError);
      return null;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerData.stripe_customer_id,
      status: 'active',
      expand: ['data.items.data.price'],
    });

    if (!subscriptions.data.length) {
      return null;
    }

    const subscription = subscriptions.data[0] as SubscriptionWithPrice;
    const price = subscription.items.data[0]?.price;

    if (!price) {
      console.error('No price found for subscription');
      return null;
    }

    return {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      priceId: price.id,
      customerId: customerData.stripe_customer_id,
      planName: price.nickname || 'Pro Plan',
    };
  } catch (error) {
    console.error('Error in getCurrentSubscription:', error);
    return null;
  }
};

type PriceType = {
  id: string;
  type: 'recurring' | 'one_time';
};

/**
 * Creates a new checkout session for subscription management
 */
export const createCheckoutSession = async ({
  price,
  redirectPath = '/dashboard',
}: {
  price: PriceType;
  redirectPath?: string;
}): Promise<CheckoutResponse> => {
  try {
    const user = await auth();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (customerError || !customerData?.stripe_customer_id) {
      throw new Error('Customer not found');
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      customer: customerData.stripe_customer_id,
      customer_email: userData.email || undefined,
      billing_address_collection: 'auto',
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: price.type === 'recurring' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}${redirectPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${redirectPath}`,
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(params);

    return {
      url: session.url ?? undefined,
      sessionId: session.id ?? undefined,
    };
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    if (error instanceof Error) {
      return {
        errorRedirect: `/error?message=${error.message}&redirect=${redirectPath}`,
      };
    }
    return {
      errorRedirect: `/error?message=Unknown error&redirect=${redirectPath}`,
    };
  }
};

/**
 * Creates a new billing portal session for subscription management
 */
export const createBillingPortalSession = async ({
  returnPath = '/dashboard',
}: {
  returnPath?: string;
}) => {
  try {
    const user = await auth();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (customerError || !customerData?.stripe_customer_id) {
      throw new Error('Customer not found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerData.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}${returnPath}`,
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error in createBillingPortalSession:', error);
    if (error instanceof Error) {
      return {
        errorRedirect: `/error?message=${error.message}&redirect=${returnPath}`,
      };
    }
    return {
      errorRedirect: `/error?message=Unknown error&redirect=${returnPath}`,
    };
  }
};
