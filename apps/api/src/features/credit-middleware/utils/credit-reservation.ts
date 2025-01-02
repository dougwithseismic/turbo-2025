import { v4 as uuidv4 } from 'uuid'
import type { CreditReservation, ReserveCreditParams } from '../types'
import { InsufficientCreditsError, CreditReservationError } from '../types'

// Simulated database operations - replace with actual Supabase calls
const mockUserBalances = new Map<
  string,
  { available: number; reserved: number }
>()
const mockReservations = new Map<string, CreditReservation>()

const RESERVATION_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes

export const reserveCredits = async ({
  userId,
  serviceId,
  amount,
  metadata,
}: ReserveCreditParams): Promise<CreditReservation> => {
  // Get user balance (replace with actual DB query)
  const balance = mockUserBalances.get(userId) || {
    available: 100,
    reserved: 0,
  }

  if (balance.available < amount) {
    throw new InsufficientCreditsError()
  }

  try {
    // Create reservation
    const reservation: CreditReservation = {
      id: uuidv4(),
      userId,
      serviceId,
      amount,
      status: 'reserved',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata,
    }

    // Update balance
    mockUserBalances.set(userId, {
      available: balance.available - amount,
      reserved: balance.reserved + amount,
    })

    // Store reservation
    mockReservations.set(reservation.id, reservation)

    // Set timeout to release credits if not finalized
    setTimeout(() => {
      const currentReservation = mockReservations.get(reservation.id)
      if (currentReservation?.status === 'reserved') {
        mockReservations.set(reservation.id, {
          ...currentReservation,
          status: 'released',
          updatedAt: new Date(),
        })

        // Restore balance
        const currentBalance = mockUserBalances.get(userId)
        if (currentBalance) {
          mockUserBalances.set(userId, {
            available: currentBalance.available + amount,
            reserved: currentBalance.reserved - amount,
          })
        }
      }
    }, RESERVATION_TIMEOUT_MS)

    return reservation
  } catch (error) {
    throw new CreditReservationError(
      error instanceof Error ? error.message : 'Failed to reserve credits',
    )
  }
}

// Export for testing
export const __test__ = {
  mockUserBalances,
  mockReservations,
  RESERVATION_TIMEOUT_MS,
}
