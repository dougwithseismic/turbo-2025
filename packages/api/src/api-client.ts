import { ApiError, ApiClientConfig, RequestConfig } from './types.js'
import { streamParser } from './stream.js'
import { env } from '@repo/env'

class HttpClient {
  private readonly baseUrl: string
  private readonly defaultHeaders: Record<string, string>
  private readonly timeout: number

  constructor({
    baseUrl,
    defaultHeaders = {},
    timeout = 30000,
  }: ApiClientConfig) {
    this.baseUrl = baseUrl
    this.defaultHeaders = defaultHeaders
    this.timeout = timeout
  }

  private createAbortController = (timeoutMs: number) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort('timeout')
    }, timeoutMs)
    return {
      controller,
      timeoutId,
      cleanup: () => clearTimeout(timeoutId),
    }
  }

  private buildUrl = (endpoint: string): string => {
    return new URL(endpoint, this.baseUrl).toString()
  }

  private createFetchConfig = (config: RequestConfig): RequestInit => {
    const { method, headers, body } = config

    return {
      method,
      headers: { ...this.defaultHeaders, ...headers },
      body: this.serializeBody(body),
    }
  }

  private serializeBody = (body: unknown): string | undefined => {
    if (body === undefined) return undefined
    return typeof body === 'string' ? body : JSON.stringify(body)
  }

  private validateResponse = async (
    response: Response,
    validateStatus?: (status: number) => boolean,
  ) => {
    const isValid =
      validateStatus?.(response.status) ??
      (response.status >= 200 && response.status < 300)

    if (!isValid) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = {
          message: await response.text().catch(() => 'No response body'),
        }
      }

      throw new ApiError({
        message:
          errorData.message || `Request failed with status ${response.status}`,
        status: response.status,
        response,
        ...errorData,
      })
    }

    return response
  }

  private async fetchWithTimeout(
    url: string,
    config: RequestConfig = {},
  ): Promise<Response> {
    const timeout = config.timeout ?? this.timeout
    const { controller, timeoutId, cleanup } =
      this.createAbortController(timeout)

    try {
      const fetchConfig = {
        ...this.createFetchConfig(config),
        signal: controller.signal,
      }

      const response = await fetch(url, fetchConfig)
      cleanup()

      const validatedResponse = await this.validateResponse(
        response,
        config.validateStatus,
      )
      return validatedResponse
    } catch (error) {
      cleanup()

      if (error instanceof ApiError) throw error

      if (controller.signal.aborted) {
        throw new ApiError({
          message: 'Request timeout',
          status: 408,
        })
      }

      throw new ApiError({
        message: error instanceof Error ? error.message : 'Request failed',
        status: 500,
      })
    }
  }

  protected async request<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<T> {
    const url = this.buildUrl(endpoint)
    const response = await this.fetchWithTimeout(url, config)
    const result = await response.json()
    return result
  }

  async stream<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<ReadableStream<T>> {
    const url = this.buildUrl(endpoint)
    const response = await this.fetchWithTimeout(url, config)

    if (!response.body) {
      throw new ApiError({
        message: 'No response body available for streaming',
        status: 500,
      })
    }

    return streamParser<T>(response.body)
  }
}

export class ApiClient extends HttpClient {
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>) {
    try {
      return this.request<T>(endpoint, { ...config, method: 'GET' })
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError({
        message: 'Request failed',
        status: 500,
      })
    }
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'method' | 'body'>,
  ) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data,
    })
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'method' | 'body'>,
  ) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data,
    })
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

const DEFAULT_CONFIG: Partial<ApiClientConfig> = {
  timeout: env.API_TIMEOUT,
  defaultHeaders: {
    Authorization: `Bearer ${env.API_KEY}`,
  },
}

export const createApiClient = (config: ApiClientConfig): ApiClient => {
  return new ApiClient({
    ...DEFAULT_CONFIG,
    ...config,
  })
}
