import { auth } from "@/auth"

type ApiResponse<T = unknown> = {
  status: boolean
  message: string
  data?: T
  pagination?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number | null
    to: number | null
    has_more: boolean
  }
  links?: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  errors?: Record<string, string[]>
}

type RequestConfig = RequestInit & {
  params?: Record<string, string | number | boolean | null | undefined>
  token?: string | null
}

class ApiClient {
  private baseURL: string

  constructor() {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    this.baseURL = base.endsWith('/api') ? base : `${base}/api`
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | null | undefined>): string {
    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    // Ensure baseURL doesn't end with /
    const cleanBaseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL
    // Combine baseURL and endpoint properly
    const fullUrl = `${cleanBaseURL}${cleanEndpoint}`
    const url = new URL(fullUrl)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          url.searchParams.append(key, String(value))
        }
      })
    }
    
    return url.toString()
  }

  private async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { params, token: explicitToken, ...fetchConfig } = config
    const url = this.buildUrl(endpoint, params)

    // Get token - prefer explicit token, then try to get from NextAuth session (server-side)
    let token = explicitToken
    
    if (!token && typeof window === 'undefined') {
      // Server-side: get token from NextAuth session
      const session = await auth()
      token = (session as any)?.accessToken as string | undefined
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(fetchConfig.headers as Record<string, string>),
    }

    // Only add Content-Type for JSON body (not FormData)
    if (fetchConfig.body && typeof fetchConfig.body === 'string') {
      headers['Content-Type'] = 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...fetchConfig,
      headers,
    })

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const text = await response.text()
      throw new Error(text || 'An error occurred')
    }

    const data: ApiResponse<T> = await response.json()

    if (!response.ok) {
      // Handle error responses
      if (response.status === 401) {
        // Redirect to login on client-side
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in'
        }
      }
      
      const error = new Error(data.message || 'An error occurred')
      ;(error as any).status = response.status
      ;(error as any).errors = data.errors
      throw error
    }

    return data
  }

  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | boolean | null | undefined>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'GET',
      params,
    })
  }

  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async postFormData<T = unknown>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint)
    const { token: explicitToken, ...restConfig } = config || {}

    // Get token
    let token = explicitToken
    if (!token && typeof window === 'undefined') {
      const session = await auth()
      token = (session as any)?.accessToken as string | undefined
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(restConfig.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...restConfig,
      method: 'POST',
      headers,
      body: formData,
    })

    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const text = await response.text()
      throw new Error(text || 'An error occurred')
    }

    const data: ApiResponse<T> = await response.json()

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        window.location.href = '/sign-in'
      }
      
      const error = new Error(data.message || 'An error occurred')
      ;(error as any).status = response.status
      ;(error as any).errors = data.errors
      throw error
    }

    return data
  }

  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T = unknown>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
      body: config?.body,
    })
  }
}

export const apiClient = new ApiClient()
export type { ApiResponse }
