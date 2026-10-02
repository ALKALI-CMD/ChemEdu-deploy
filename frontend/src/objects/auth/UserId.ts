// 文件说明：定义认证用户Id领域数据类型，用于业务流程和接口传输。
export type UserId = string

export const asUserId = (value: string) => value as UserId
