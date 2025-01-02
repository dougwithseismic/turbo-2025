import { SupabaseClient } from '@supabase/supabase-js'
import { CreditReservation } from '../types'

export interface FinalizeCreditParams {
  supabaseClient: SupabaseClient
  userId: string
  reservationId: string
  metadata: Record<string, unknown>
}

export class CreditFinalizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CreditFinalizationError'
  }
}

export const finalizeCredits = async ({
  supabaseClient,
  userId,
  reservationId,
  metadata,
}: FinalizeCreditParams): Promise<void> => {
  // Start a transaction to update both the reservation and user balance
  const { data: reservation, error: fetchError } = await supabaseClient
    .from('credit_reservations')
    .select('*')
    .eq('id', reservationId)
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    throw new CreditFinalizationError(
      `Failed to fetch reservation: ${fetchError.message}`,
    )
  }

  if (!reservation) {
    throw new CreditFinalizationError('Reservation not found')
  }

  if (reservation.status !== 'reserved') {
    throw new CreditFinalizationError('Reservation already finalized')
  }

  const { error: updateError } = await supabaseClient
    .from('credit_reservations')
    .update({
      status: 'charged',
      metadata: {
        ...reservation.metadata,
        ...metadata,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .eq('user_id', userId)

  if (updateError) {
    throw new CreditFinalizationError(
      `Failed to update reservation: ${updateError.message}`,
    )
  }

  // Update user's credit balance by moving reserved credits to charged
  const { error: balanceError } = await supabaseClient.rpc(
    'finalize_credit_reservation',
    {
      p_user_id: userId,
      p_reservation_id: reservationId,
    },
  )

  if (balanceError) {
    throw new CreditFinalizationError(
      `Failed to update credit balance: ${balanceError.message}`,
    )
  }
}
