/**
 * @module @repo/api
 *
 * A TypeScript HTTP client with built-in retry, timeout, and streaming capabilities
 *
 * @example
 * ```ts
 * import { createApiClient } from '@repo/api';
 *
 * const api = createApiClient({
 *   baseUrl: 'https://api.example.com',
 *   defaultHeaders: { 'Authorization': 'Bearer token' }
 * });
 *
 * // Make requests
 * const users = await api.get('/users');
 * const user = await api.post('/users', { name: 'John' });
 * ```
 */
export { createApiClient } from './api-client.js'
export { ApiError } from './types.js'
export type { ApiClientConfig, RequestConfig, HttpMethod } from './types.js'
