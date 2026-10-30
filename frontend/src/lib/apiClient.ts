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
  return ''
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl()).replace(/\/$/, '')

function resolveRequestUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

function formatApiError(status: number, body: string): string {
  if (status === 502 || status === 503 || status === 504) return '服务暂不可用或正在启动，请稍后重试。'
  if (status === 413) return '上传内容过大，请压缩图片后重试。'
  if (status === 404) return '请求的接口不存在，请刷新页面后重试。'
  try {
    const parsed = JSON.parse(body) as { message?: unknown; error?: unknown }
    if (typeof parsed.message === 'string') return parsed.message
    if (typeof parsed.error === 'string') return parsed.error
  } catch { /* 不向用户展示网关 HTML。 */ }
  return `请求失败（${status}），请稍后重试。`
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
  }).catch(() => { throw new Error('网络连接失败，请检查网络后重试。') })

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
