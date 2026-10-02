// 文件说明：定义认证会话Token领域数据类型，用于业务流程和接口传输。
export type SessionToken = string

export const asSessionToken = (value: string) => value as SessionToken
