import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

export type Json = Database['public']['CompositeTypes']
export type PaymentProvider =
  Database['public']['Tables']['payment_providers']['Row']

export type PaymentProviderAccount =
  Database['public']['Tables']['payment_provider_accounts']['Row']

export type PaymentMethod =
  Database['public']['Tables']['payment_methods']['Row']

export type PaymentAccountWithMethods = PaymentProviderAccount & {
  methods: PaymentMethod[]
}

/**
 * Gets the default payment account for an owner
 */
export const getPaymentAccount = async ({
  supabase,
  ownerType,
  ownerId,
  providerName = 'stripe',
}: {
  supabase: SupabaseClient<Database>
  ownerType: 'user' | 'organization'
  ownerId: string
  providerName?: string
}): Promise<PaymentProviderAccount | null> => {
  const { data, error } = await supabase
    .from('payment_provider_accounts')
    .select()
    .eq('owner_type', ownerType)
    .eq('owner_id', ownerId)
    .eq('is_default', true)
    .single()

  if (error) throw error
  return data
}

/**
 * Gets payment methods for an account
 */
export const getPaymentMethods = async ({
  supabase,
  accountId,
}: {
  supabase: SupabaseClient<Database>
  accountId: string
}): Promise<PaymentMethod[]> => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select()
    .eq('account_id', accountId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Gets a payment account with its methods
 */
export const getPaymentAccountWithMethods = async ({
  supabase,
  ownerType,
  ownerId,
  providerName = 'stripe',
}: {
  supabase: SupabaseClient<Database>
  ownerType: 'user' | 'organization'
  ownerId: string
  providerName?: string
}): Promise<PaymentAccountWithMethods | null> => {
  const account = await getPaymentAccount({
    supabase,
    ownerType,
    ownerId,
    providerName,
  })

  if (!account) return null

  const methods = await getPaymentMethods({
    supabase,
    accountId: account.id,
  })

  return {
    ...account,
    methods,
  }
}

/**
 * Creates a new payment provider account
 */
export const createPaymentAccount = async ({
  supabase,
  providerId,
  ownerType,
  ownerId,
  providerCustomerId,
  providerData = {},
  isDefault = true,
}: {
  supabase: SupabaseClient<Database>
  providerId: string
  ownerType: 'user' | 'organization'
  ownerId: string
  providerCustomerId: string
  providerData?: Record<string, unknown>
  isDefault?: boolean
}): Promise<PaymentProviderAccount> => {
  const { data, error } = await supabase
    .from('payment_provider_accounts')
    .insert({
      provider_id: providerId,
      owner_type: ownerType,
      owner_id: ownerId,
      provider_customer_id: providerCustomerId,
      provider_data: providerData as Json,
      is_default: isDefault,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Adds a payment method to an account
 */
export const addPaymentMethod = async ({
  supabase,
  accountId,
  providerPaymentMethodId,
  type,
  providerData = {},
  isDefault = false,
}: {
  supabase: SupabaseClient<Database>
  accountId: string
  providerPaymentMethodId: string
  type: string
  providerData?: Record<string, unknown>
  isDefault?: boolean
}): Promise<PaymentMethod> => {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      account_id: accountId,
      provider_payment_method_id: providerPaymentMethodId,
      type,
      provider_data: providerData as Json,
      is_default: isDefault,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Updates a payment method
 */
export const updatePaymentMethod = async ({
  supabase,
  id,
  isDefault,
  providerData,
}: {
  supabase: SupabaseClient<Database>
  id: string
  isDefault?: boolean
  providerData?: Record<string, unknown>
}): Promise<PaymentMethod> => {
  const updates: Partial<PaymentMethod> = {}

  if (isDefault !== undefined) updates.is_default = isDefault
  if (providerData !== undefined) updates.provider_data = providerData as Json

  const { data, error } = await supabase
    .from('payment_methods')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Removes a payment method
 */
export const removePaymentMethod = async ({
  supabase,
  id,
}: {
  supabase: SupabaseClient<Database>
  id: string
}): Promise<void> => {
  const { error } = await supabase.from('payment_methods').delete().eq('id', id)

  if (error) throw error
}
