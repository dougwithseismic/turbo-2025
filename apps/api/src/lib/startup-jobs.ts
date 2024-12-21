// Essential Types for API Requests
export interface OffersApiParams {
  page: number
  area?: string[]
  location?: string[]
  'disable-reorder'?: 0 | 1
}

export interface FileUploadOptions {
  fileName?: string
  headers?: Record<string, string>
}

export interface OffersResponse {
  items: Array<{
    id: string
    title: string
    company: string
    location: string
    // Add other specific fields as needed
  }>
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

export interface FileUploadResponse {
  url: string
  fileName: string
  fileSize: number
  mimeType: string
  // Add other specific fields as needed
}

// Basic API Helper Functions
export const fetchOffers = async (
  params: OffersApiParams,
): Promise<OffersResponse> => {
  const queryParams = new URLSearchParams()

  queryParams.append('page', params.page.toString())

  params.area?.forEach((area) => queryParams.append('area[]', area))
  params.location?.forEach((location) =>
    queryParams.append('location[]', location),
  )

  if (params['disable-reorder'] !== undefined) {
    queryParams.append('disable-reorder', params['disable-reorder'].toString())
  }

  const response = await fetch(
    `https://www.startupjobs.com/api/offers?${queryParams.toString()}`,
    {
      headers: {
        accept: 'application/json',
      },
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch offers: ${response.statusText}`)
  }

  return response.json() as Promise<OffersResponse>
}

export const uploadFile = async (
  fileUrl: string,
  options: FileUploadOptions = {},
): Promise<FileUploadResponse> => {
  const fileResponse = await fetch(fileUrl)
  if (!fileResponse.ok) {
    throw new Error(`Failed to fetch file: ${fileResponse.statusText}`)
  }

  const fileBuffer = await fileResponse.arrayBuffer()
  const file = new Blob([fileBuffer])
  const formData = new FormData()

  const fileName = options.fileName || fileUrl.split('/').pop() || 'file'
  formData.append('file', file, fileName)

  const defaultHeaders = {
    accept: 'application/json',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    ...options.headers,
  }

  const response = await fetch('https://www.startupjobs.com/api/file', {
    method: 'POST',
    headers: defaultHeaders as HeadersInit,
    body: formData,
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }

  return response.json() as Promise<FileUploadResponse>
}
