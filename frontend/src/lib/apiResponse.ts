export type MessageResponse = {
  message: string
}

export type EntityResponse<TKey extends string, TValue> = MessageResponse & Record<TKey, TValue>

export function readMessage(response: MessageResponse): string {
  return response.message
}

export function readEntity<TKey extends string, TValue>(
  response: EntityResponse<TKey, TValue>,
  key: TKey,
): TValue {
  return response[key]
}

export function parseEntityResponse<TKey extends string, TValue>(entityKey: TKey) {
  return (response: unknown): TValue =>
    readEntity(response as EntityResponse<TKey, TValue>, entityKey)
}

export function parseMessageText(response: unknown): string {
  return readMessage(response as MessageResponse)
}
