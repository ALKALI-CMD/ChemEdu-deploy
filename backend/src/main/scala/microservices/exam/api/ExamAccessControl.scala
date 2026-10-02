// 文件说明：考试评定域访问控制工具，集中定义各角色可执行的操作边界。
package microservices.exam.api

import cats.effect.IO
import microservices.auth.objects.{UserProfile, UserRole}

object ExamAccessControl:

  /** 教研老师与校长：创建考试、划定改题区域、处理争分。 */
  def requireExamManager(user: UserProfile): IO[Unit] =
    user.role match
      case UserRole.Teacher | UserRole.Admin => IO.unit
      case _ => IO.raiseError(new IllegalArgumentException("只有教研老师或校长可以执行该操作。"))

  /** 助教老师、教研老师与校长：上传答题卡与阅卷打分。 */
  def requireGrader(user: UserProfile): IO[Unit] =
    user.role match
      case UserRole.Assistant | UserRole.Teacher | UserRole.Admin => IO.unit
      case _ => IO.raiseError(new IllegalArgumentException("只有助教老师、教研老师或校长可以执行阅卷操作。"))

  /** 数据分析处、教研老师与校长：查看成绩册与统计数据。 */
  def requireAnalyst(user: UserProfile): IO[Unit] =
    user.role match
      case UserRole.Analyst | UserRole.Teacher | UserRole.Admin => IO.unit
      case _ => IO.raiseError(new IllegalArgumentException("只有数据分析处、教研老师或校长可以查看统计数据。"))

  /** 全部内部角色：助教、教研、数据分析处与校长。 */
  def requireStaff(user: UserProfile): IO[Unit] =
    user.role match
      case UserRole.Assistant | UserRole.Teacher | UserRole.Analyst | UserRole.Admin => IO.unit
      case _ => IO.raiseError(new IllegalArgumentException("仅限内部工作人员访问。"))
