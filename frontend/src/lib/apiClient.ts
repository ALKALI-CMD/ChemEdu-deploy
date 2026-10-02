type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  payload?: unknown
}

export type APIHttpMethod = RequestOptions['method']

export type ApiRequest<TPayload, TResponse> = {
  name?: string
  method: APIHttpMethod
  path: string
  payload?: TPayload
  parseResponse?: (response: unknown) => TResponse
}

function getDefaultApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return ''
  }

  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:8080'
  }

  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
  return `${protocol}//${window.location.hostname}:8080`
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl()).replace(/\/$/, '')

function resolveRequestUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

function formatApiError(status: number, body: string): string {
  const trimmedBody = body.trim()

  if (status === 404 && /^not found$/i.test(trimmedBody)) {
    return '璇锋眰鐨勫悗绔帴鍙ｄ笉瀛樺湪銆傝纭鍚庣宸茬粡閲嶅惎锛屽苟涓斿綋鍓嶈繍琛岀殑鏄渶鏂颁唬鐮併€?'
  }

  try {
    const parsed = JSON.parse(trimmedBody) as { message?: string; error?: string }
    return parsed.message || parsed.error || trimmedBody || `鎺ュ彛璇锋眰澶辫触锛?{status}`
  } catch {
    return trimmedBody || `鎺ュ彛璇锋眰澶辫触锛?{status}`
  }
}

export function apiNameOf(request: ApiRequest<unknown, unknown>): string {
  return request.name || 'AnonymousAPIRequest'
}

export async function requestJson<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const { method = 'GET', payload } = options
  const response = await fetch(resolveRequestUrl(path), {
    method,
    headers: {
      ...(payload !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(formatApiError(response.status, message))
  }

  return response.json() as Promise<TResponse>
}

export async function sendAPI<TPayload, TResponse>(message: ApiRequest<TPayload, TResponse>): Promise<TResponse> {
  const startedAt = performance.now()
  const apiName = apiNameOf(message)
  try {
    const response = await requestJson<unknown>(message.path, {
      method: message.method,
      payload: message.payload,
    })

    console.info('[api:success]', {
      name: apiName,
      method: message.method,
      path: message.path,
      durationMs: Math.round(performance.now() - startedAt),
    })

    return message.parseResponse ? message.parseResponse(response) : (response as TResponse)
  } catch (error) {
    console.error('[api:error]', {
      name: apiName,
      method: message.method,
      path: message.path,
      durationMs: Math.round(performance.now() - startedAt),
      error,
    })

    if (error instanceof Error) {
      throw new Error(`[${apiName}] ${error.message}`)
    }

    throw error
  }
}
