import type { CreditReservation, FinalizeCreditParams } from '../types'
import { CreditFinalizationError } from '../types'
import { __test__ } from './credit-reservation'

const { mockReservations, mockUserBalances } = __test__

export const finalizeCredits = async ({
  reservationId,
  success,
  metadata = {},
}: FinalizeCreditParams): Promise<CreditReservation> => {
  const reservation = mockReservations.get(reservationId)

  if (!reservation) {
    throw new CreditFinalizationError('Reservation not found')
  }

  if (reservation.status !== 'reserved') {
    throw new CreditFinalizationError('Reservation already finalized')
  }

  try {
    const updatedReservation: CreditReservation = {
      ...reservation,
      status: success ? 'charged' : 'released',
      updatedAt: new Date(),
      metadata: {
        ...reservation.metadata,
        ...metadata,
      },
    }

    // Update reservation
    mockReservations.set(reservationId, updatedReservation)

    // Update balance if released
    if (!success) {
      const balance = mockUserBalances.get(reservation.userId)
      if (balance) {
        mockUserBalances.set(reservation.userId, {
          available: balance.available + reservation.amount,
          reserved: balance.reserved - reservation.amount,
        })
      }
    }

    return updatedReservation
  } catch (error) {
    throw new CreditFinalizationError(
      error instanceof Error ? error.message : 'Failed to finalize credits',
    )
  }
}
