import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reserveCredits, __test__ } from '../utils/credit-reservation'
import type { CreditReservation } from '../types'

const { mockUserBalances, mockReservations } = __test__

describe('reserveCredits', () => {
  beforeEach(() => {
    mockUserBalances.clear()
    mockReservations.clear()
    vi.useRealTimers()
  })

  it('should successfully reserve credits when available', async () => {
    mockUserBalances.set('user-123', {
      available: 100,
      reserved: 0,
    })

    const reservation = await reserveCredits({
      userId: 'user-123',
      serviceId: 'service-456',
      amount: 5,
      metadata: {
        operation: 'test_operation',
      },
    })

    expect(reservation).toMatchObject({
      userId: 'user-123',
      serviceId: 'service-456',
      amount: 5,
      status: 'reserved',
    })

    const balance = mockUserBalances.get('user-123')
    expect(balance).toEqual({
      available: 95,
      reserved: 5,
    })
  })

  it('should fail when insufficient credits available', async () => {
    mockUserBalances.set('user-123', {
      available: 3,
      reserved: 0,
    })

    await expect(
      reserveCredits({
        userId: 'user-123',
        serviceId: 'service-456',
        amount: 5,
        metadata: {
          operation: 'test_operation',
        },
      }),
    ).rejects.toThrow('Insufficient credits')

    const balance = mockUserBalances.get('user-123')
    expect(balance).toEqual({
      available: 3,
      reserved: 0,
    })
  })

  it('should handle concurrent reservations correctly', async () => {
    mockUserBalances.set('user-123', {
      available: 10,
      reserved: 0,
    })

    const reservations = await Promise.all([
      reserveCredits({
        userId: 'user-123',
        serviceId: 'service-456',
        amount: 4,
        metadata: { operation: 'concurrent_1' },
      }),
      reserveCredits({
        userId: 'user-123',
        serviceId: 'service-456',
        amount: 4,
        metadata: { operation: 'concurrent_2' },
      }),
    ])

    expect(reservations).toHaveLength(2)
    expect(reservations[0].status).toBe('reserved')
    expect(reservations[1].status).toBe('reserved')

    const balance = mockUserBalances.get('user-123')
    expect(balance?.available).toBe(2) // 10 - 4 - 4
    expect(balance?.reserved).toBe(8) // 4 + 4
  })

  it('should expire reservations after timeout', async () => {
    vi.useFakeTimers()
    mockUserBalances.set('user-123', {
      available: 10,
      reserved: 0,
    })

    const reservation = await reserveCredits({
      userId: 'user-123',
      serviceId: 'service-456',
      amount: 5,
      metadata: { operation: 'test_operation' },
    })

    // Fast forward past reservation timeout
    vi.advanceTimersByTime(__test__.RESERVATION_TIMEOUT_MS)

    const updatedReservation = mockReservations.get(reservation.id)
    expect(updatedReservation?.status).toBe('released')

    const balance = mockUserBalances.get('user-123')
    expect(balance).toEqual({
      available: 10,
      reserved: 0,
    })
  })

  it('should include required metadata in reservation', async () => {
    const metadata = {
      operation: 'test_operation',
      requestId: 'req-123',
      custom: 'value',
    }

    const reservation = await reserveCredits({
      userId: 'user-123',
      serviceId: 'service-456',
      amount: 5,
      metadata,
    })

    expect(reservation.metadata).toMatchObject(metadata)
  })
})
