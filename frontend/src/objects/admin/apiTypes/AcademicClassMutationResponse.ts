// 文件说明：定义管理端教学班级变更接口响应类型，用于前后端 API 返回值约束。
import type { AcademicClass } from '@/objects/admin/AcademicClass'

export type AcademicClassMutationResponse = {
  message: string
  academicClass: AcademicClass
}
