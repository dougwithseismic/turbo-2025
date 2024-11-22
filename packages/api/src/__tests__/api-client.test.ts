import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApiClient } from '../api-client.js'
import { ApiError } from '../types.js'

describe('ApiClient', () => {
  let apiClient: ReturnType<typeof createApiClient>
  const baseUrl = 'https://api.example.com'
  const defaultHeaders = { 'Content-Type': 'application/json' }

  beforeEach(() => {
    apiClient = createApiClient({ baseUrl, defaultHeaders })
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.resetAllMocks()
    vi.restoreAllMocks()
  })

  it('should perform a GET request and return data', async () => {
    const mockResponse = { data: 'test' }
    global.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      ),
    ) as any

    const data = await apiClient.get('/test')

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.any(Object),
    )
    expect(data).toEqual(mockResponse)
  })

  it('should perform a POST request with body and return data', async () => {
    const mockResponse = { success: true }
    const payload = { name: 'John' }
    global.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockResponse), { status: 201 }),
      ),
    ) as any

    const data = await apiClient.post('/users', payload)

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    )
    console.log('data', data)
    expect(data).toEqual(mockResponse)
  })

  it('should handle request timeouts', async () => {
    const timeoutEndpoint = '/timeouts-endpoint'
    global.fetch = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    ) // Simulate slow request

    const client = createApiClient({
      baseUrl: 'http://example.com',
      timeout: 1000, // Very short timeout
    })
    await expect(client.get(timeoutEndpoint)).rejects.toThrow('Request timeout')
  })

  it('should throw ApiError on non-2xx responses', async () => {
    const errorMessage = 'Not Found'
    global.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { message: errorMessage } }), {
          status: 404,
        }),
      ),
    ) as any

    await expect(apiClient.get('/not-found')).rejects.toThrowError(ApiError)
    await expect(apiClient.get('/not-found')).rejects.toMatchObject({
      status: 404,
      data: { message: errorMessage },
    })
  })

  it('should allow custom validateStatus function', async () => {
    const mockResponse = { data: 'test' }
    global.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockResponse), { status: 400 }),
      ),
    ) as any

    const data = await apiClient.get('/custom-validate', {
      validateStatus: (status: number) => status === 400,
    })

    console.log(data)

    expect(data).toEqual(mockResponse)
  })

  it('should handle network errors', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error')),
    ) as any

    await expect(apiClient.get('/error')).rejects.toThrow(ApiError)
    await expect(apiClient.get('/error')).rejects.toMatchObject({
      message: 'Network error',
      status: 500,
    })
  })

  it('should abort fetch when timeout is reached', async () => {
    const client = createApiClient({
      baseUrl: 'http://example.com',
      timeout: 100, // Very short timeout
    })

    const slowEndpoint = '/slow-endpoint'
    global.fetch = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    ) // Simulate slow request

    await expect(client.get(slowEndpoint)).rejects.toThrow('Request timeout')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(slowEndpoint),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    )
  })
})
