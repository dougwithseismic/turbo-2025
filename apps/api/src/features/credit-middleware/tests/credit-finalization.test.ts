import { describe, it, expect, beforeEach } from 'vitest'
import { finalizeCredits } from '../utils/credit-finalization'
import { reserveCredits, __test__ } from '../utils/credit-reservation'
import type { CreditReservation } from '../types'

const { mockUserBalances, mockReservations } = __test__

describe('finalizeCredits', () => {
  beforeEach(() => {
    mockUserBalances.clear()
    mockReservations.clear()
  })

  it('should charge credits on successful operation', async () => {
    // Set up initial balance
    mockUserBalances.set('user-123', {
      available: 100,
      reserved: 0,
    })

    // Create a reservation first
    const reservation = await reserveCredits({
      userId: 'user-123',
      serviceId: 'service-456',
      amount: 5,
      metadata: {
        operation: 'test_operation',
      },
    })

    const result = await finalizeCredits({
      reservationId: reservation.id,
      success: true,
    })

    expect(result.status).toBe('charged')
    expect(result.updatedAt).toBeInstanceOf(Date)

    // Check balance
    const balance = mockUserBalances.get('user-123')
    expect(balance).toEqual({
      available: 95,
      reserved: 5,
    })
  })

  it('should release credits on failed operation', async () => {
    // Set up initial balance
    mockUserBalances.set('user-123', {
      available: 100,
      reserved: 0,
    })

    // Create a reservation first
    const reservation = await reserveCredits({
      userId: 'user-123',
      serviceId: 'service-456',
      amount: 5,
      metadata: {
        operation: 'test_operation',
      },
    })

    const result = await finalizeCredits({
      reservationId: reservation.id,
      success: false,
    })

    expect(result.status).toBe('released')
    expect(result.updatedAt).toBeInstanceOf(Date)

    // Check balance is restored
    const balance = mockUserBalances.get('user-123')
    expect(balance).toEqual({
      available: 100,
      reserved: 0,
    })
  })

  it('should throw error when finalizing non-existent reservation', async () => {
    await expect(
      finalizeCredits({
        reservationId: 'non-existent',
        success: true,
      }),
    ).rejects.toThrow('Reservation not found')
  })

  it('should throw error when finalizing already finalized reservation', async () => {
    // Set up initial balance
    mockUserBalances.set('user-123', {
      available: 100,
      reserved: 0,
    })

    // Create and finalize a reservation
    const reservation = await reserveCredits({
      userId: 'user-123',
      serviceId: 'service-456',
      amount: 5,
      metadata: {
        operation: 'test_operation',
      },
    })

    await finalizeCredits({
      reservationId: reservation.id,
      success: true,
    })

    // Try to finalize again
    await expect(
      finalizeCredits({
        reservationId: reservation.id,
        success: true,
      }),
    ).rejects.toThrow('Reservation already finalized')
  })

  it('should update transaction history on finalization', async () => {
    // Set up initial balance
    mockUserBalances.set('user-123', {
      available: 100,
      reserved: 0,
    })

    // Create a reservation
    const reservation = await reserveCredits({
      userId: 'user-123',
      serviceId: 'service-456',
      amount: 5,
      metadata: {
        operation: 'test_operation',
      },
    })

    const result = await finalizeCredits({
      reservationId: reservation.id,
      success: true,
      metadata: {
        completionTime: 1500,
        resultSize: 1000,
      },
    })

    expect(result.metadata).toMatchObject({
      operation: 'test_operation',
      completionTime: 1500,
      resultSize: 1000,
    })
  })
})
