/** Supported HTTP methods */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/**
 * Configuration options for individual API requests
 */
export interface RequestConfig {
  /** HTTP method for the request */
  method?: HttpMethod
  /** Request headers */
  headers?: Record<string, string>
  /** Request body */
  body?: unknown
  /** AbortSignal for request cancellation */
  signal?: AbortSignal
  /** Request timeout in milliseconds */
  timeout?: number
  /** Custom status validation function */
  validateStatus?: (status: number) => boolean
}

/**
 * Configuration options for the API client
 */
export interface ApiClientConfig {
  /** Base URL for all API requests */
  baseUrl: string
  /** Default headers to include in all requests */
  defaultHeaders?: Record<string, string>
  /** Default timeout in milliseconds */
  timeout?: number
}

/**
 * Custom error class for API-related errors
 *
 * @example
 * ```ts
 * try {
 *   await api.get('/users');
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.log(error.status); // HTTP status code
 *     console.log(error.data);   // Error response data
 *   }
 * }
 * ```
 */
export class ApiError extends Error {
  constructor({
    message,
    status,
    response,
    data,
  }: {
    message: string
    status?: number
    response?: Response
    data?: unknown
  }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.response = response
    this.data = data
  }

  public status?: number
  public response?: Response
  public data?: unknown
}
