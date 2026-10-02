// 文件说明：考试评定域演示种子数据，启动时在空库中填充期次、考试、答题卡、判分、争分与分析样例。
package microservices.exam.tables

import cats.effect.IO
import cats.syntax.all.*
import microservices.exam.api.GenerateExamAnalysisAPIMessage
import microservices.exam.objects.*

import java.sql.Connection
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Base64

private[exam] object ExamSeedData:

  private case class DemoStudent(email: String, name: String, base: Double)

  private val students: List[DemoStudent] = List(
    DemoStudent("lin@example.com", "林晓", 0.86),
    DemoStudent("su@example.com", "苏航", 0.78),
    DemoStudent("jiang@example.com", "江晚晴", 0.75),
    DemoStudent("he@example.com", "何雨桐", 0.72),
    DemoStudent("yuan@example.com", "袁清越", 0.69),
    DemoStudent("deng@example.com", "邓子昂", 0.64),
    DemoStudent("luo@example.com", "罗一鸣", 0.58),
    DemoStudent("bai@example.com", "白景行", 0.52)
  )

  def seedIfEmpty(connection: Connection): IO[Unit] =
    ExamTable.listCohorts(connection).flatMap {
      case _ :: _ => IO.unit
      case Nil => seedDemoData(connection)
    }

  private def seedDemoData(connection: Connection): IO[Unit] =
    for
      userRows <- resolveStudents(connection)
      members: List[(String, String)] = userRows.values.toList
      memberIdByEmail: Map[String, String] = userRows.view.mapValues(_._1).toMap
      memberIds = members.map(_._1)
      graderId <- ExamTable.findUserByEmail(connection, "qian@example.com").map(_.map(_._1).getOrElse("assistant-demo"))
      managerId <- ExamTable.findUserByEmail(connection, "zhou@example.com").map(_.map(_._1).getOrElse("teacher-demo"))
      managerName <- ExamTable.findUserByEmail(connection, "zhou@example.com").map(_.map(_._2).getOrElse("周老师"))
      now <- IO.pure(Instant.now())
      spring = TrainingCohort(
        id = "cohort-qb-spring",
        name = "2026 春季高端 VIP 班",
        season = "春季班",
        startDate = "2026-02-27",
        endDate = "2026-06-07",
        description = "面向国初冲刺阶段学员，覆盖无机、有机、物化、结构四大模块，配套 12 套全真初赛模拟卷。",
        memberIds = memberIds,
        status = "active",
        createdBy = Some(managerId),
        createdAt = now.toString
      )
      summer = TrainingCohort(
        id = "cohort-qb-summer",
        name = "2026 暑期高端集训营",
        season = "暑期班",
        startDate = "2026-07-06",
        endDate = "2026-08-16",
        description = "国初前高强度模拟训练营，安排 15 套陌生背景套卷与当晚讲评。",
        memberIds = memberIds.take(5),
        status = "active",
        createdBy = Some(managerId),
        createdAt = now.toString
      )
      finalSprint = TrainingCohort(
        id = "cohort-qb-final",
        name = "2026 国决冲刺班",
        season = "国决冲刺",
        startDate = "2026-09-28",
        endDate = "2026-10-06",
        description = "面向中国化学奥林匹克决赛学员的封闭冲刺，有机、无机、物化分科授课并安排 7 次全真考试。",
        memberIds = memberIds.take(3),
        status = "active",
        createdBy = Some(managerId),
        createdAt = now.toString
      )
      _ <- List(spring, summer, finalSprint).traverse_(ExamTable.insertCohort(connection, _))

      exam1Questions = mockExamOneQuestions
      exam1 = Exam(
        id = "exam-qb-mock-1",
        cohortId = spring.id,
        name = "国初模拟考试（一）",
        description = "全真初赛模拟：10 道大题，覆盖原理、结构、无机、有机与物化交叉，卷面满分 110 折合 100。",
        scheduledStart = "2026-04-18 09:00",
        scheduledEnd = "2026-04-18 12:30",
        argueHours = 48,
        argueDeadline = Some("2026-04-20T15:00:00Z"),
        status = ExamStatus.Released.entryName,
        questions = exam1Questions,
        gradingRegions = regionsFor(exam1Questions),
        sheetTemplateImage = Some(sheetImage("国初模拟考试（一）", "样卷", exam1Questions)),
        createdBy = managerId,
        createdAt = now.minus(40, ChronoUnit.DAYS).toString,
        releasedAt = Some(now.minus(38, ChronoUnit.DAYS).toString)
      )
      exam2Questions = mockExamOneQuestions.map(q => q.copy(id = q.id.replace("e1", "e2")))
      exam2 = Exam(
        id = "exam-qb-mock-2",
        cohortId = spring.id,
        name = "国初模拟考试（二）",
        description = "全真初赛模拟第二套，当前处于集中阅卷阶段。",
        scheduledStart = "2026-05-16 09:00",
        scheduledEnd = "2026-05-16 12:30",
        argueHours = 48,
        argueDeadline = None,
        status = ExamStatus.Grading.entryName,
        questions = exam2Questions,
        gradingRegions = regionsFor(exam2Questions),
        sheetTemplateImage = Some(sheetImage("国初模拟考试（二）", "样卷", exam2Questions)),
        createdBy = managerId,
        createdAt = now.minus(20, ChronoUnit.DAYS).toString,
        releasedAt = None
      )
      exam3Questions = summerPlacementQuestions
      exam3 = Exam(
        id = "exam-qb-summer-placement",
        cohortId = summer.id,
        name = "暑期集训营摸底测试",
        description = "入营摸底：定位每位学员在四大模块的起点水平。",
        scheduledStart = "2026-07-10 09:00",
        scheduledEnd = "2026-07-10 12:00",
        argueHours = 48,
        argueDeadline = None,
        status = ExamStatus.Published.entryName,
        questions = exam3Questions,
        gradingRegions = regionsFor(exam3Questions),
        sheetTemplateImage = Some(sheetImage("暑期集训营摸底测试", "样卷", exam3Questions)),
        createdBy = managerId,
        createdAt = now.minus(60, ChronoUnit.DAYS).toString,
        releasedAt = None
      )
      exam4Questions = summerFinalQuestions
      exam4 = Exam(
        id = "exam-qb-summer-final",
        cohortId = summer.id,
        name = "暑期集训营结业测试",
        description = "结业全真测试，成绩已公布，争分窗口开放中。",
        scheduledStart = "2026-08-14 09:00",
        scheduledEnd = "2026-08-14 12:30",
        argueHours = 48,
        argueDeadline = Some(now.plus(48, ChronoUnit.HOURS).toString),
        status = ExamStatus.Released.entryName,
        questions = exam4Questions,
        gradingRegions = regionsFor(exam4Questions),
        sheetTemplateImage = Some(sheetImage("暑期集训营结业测试", "样卷", exam4Questions)),
        createdBy = managerId,
        createdAt = now.minus(25, ChronoUnit.DAYS).toString,
        releasedAt = Some(now.minus(1, ChronoUnit.DAYS).toString)
      )
      exam5Questions = finalSprintQuestions
      exam5 = Exam(
        id = "exam-qb-final-mock-1",
        cohortId = finalSprint.id,
        name = "国决全真模拟（一）",
        description = "国决全真模拟第一套，命题组正在做最后的审校。",
        scheduledStart = "2026-09-30 09:00",
        scheduledEnd = "2026-09-30 13:00",
        argueHours = 48,
        argueDeadline = None,
        status = ExamStatus.Draft.entryName,
        questions = exam5Questions,
        gradingRegions = Map.empty,
        sheetTemplateImage = None,
        createdBy = managerId,
        createdAt = now.minus(3, ChronoUnit.DAYS).toString,
        releasedAt = None
      )
      _ <- List(exam1, exam2, exam3, exam4, exam5).traverse_(ExamTable.insertExam(connection, _))

      // 考试一：8 位学生全部阅卷完成
      _ <- members.take(8).zipWithIndex.traverse { case ((studentId, studentName), index) =>
        seedGradedSheet(
          connection,
          exam = exam1,
          sheetId = s"sheet-e1-${index + 1}",
          studentId = studentId,
          studentName = studentName,
          base = students(index).base,
          graderId = graderId,
          graderName = "钱老师",
          gradedQuestionCount = exam1.questions.size,
          uploadedAt = now.minus(38, ChronoUnit.DAYS).toString
        )
      }
      // 考试二：2 张完成、1 张部分判分、2 张待判
      _ <- members.take(5).zipWithIndex.traverse { case ((studentId, studentName), index) =>
        val gradedQuestions = index match
          case 0 | 1 => exam2.questions.size
          case 2 => 6
          case _ => 0
        if gradedQuestions == 0 then
          ExamTable.upsertSheet(connection, AnswerSheet(
            id = s"sheet-e2-${index + 1}",
            examId = exam2.id,
            studentId = studentId,
            studentName = studentName,
            imageDataUrl = sheetImage("国初模拟考试（二）", studentName, exam2Questions),
            status = SheetStatus.Pending.entryName,
            rawTotal = None,
            convertedTotal = None,
            uploadedByName = "钱老师",
            uploadedAt = now.minus(10, ChronoUnit.DAYS).toString,
            gradedAt = None
          ))
        else
          seedGradedSheet(
            connection,
            exam = exam2,
            sheetId = s"sheet-e2-${index + 1}",
            studentId = studentId,
            studentName = studentName,
            base = students(index).base - 0.04,
            graderId = graderId,
            graderName = "钱老师",
            gradedQuestionCount = gradedQuestions,
            uploadedAt = now.minus(10, ChronoUnit.DAYS).toString
          )
      }
      // 考试四（结业测试）：5 位学生阅卷完成，争分窗口开放
      _ <- members.take(5).zipWithIndex.traverse { case ((studentId, studentName), index) =>
        seedGradedSheet(
          connection,
          exam = exam4,
          sheetId = s"sheet-e4-${index + 1}",
          studentId = studentId,
          studentName = studentName,
          base = students(index).base + 0.03,
          graderId = graderId,
          graderName = "钱老师",
          gradedQuestionCount = exam4.questions.size,
          uploadedAt = now.minus(1, ChronoUnit.DAYS).toString
        )
      }

      _ <- seedArguesAndAnalysis(connection, exam1, exam4, memberIdByEmail, managerId, managerName, now)
    yield ()

  private def resolveStudents(connection: Connection): IO[Map[String, (String, String)]] =
    students.traverse(student => ExamTable.findUserByEmail(connection, student.email).map(email => email.map(user => student.email -> user))).map(_.flatten.toMap)

  /** 生成一张已判分（或部分判分）的答题卡及其判分记录。 */
  private def seedGradedSheet(
    connection: Connection,
    exam: Exam,
    sheetId: String,
    studentId: String,
    studentName: String,
    base: Double,
    graderId: String,
    graderName: String,
    gradedQuestionCount: Int,
    uploadedAt: String
  ): IO[Unit] =
    val gradedQuestions = exam.questions.take(gradedQuestionCount)
    val entries = gradedQuestions.zipWithIndex.map { case (question, questionIndex) =>
      val delta = ((studentId.hashCode.abs % 7) + questionIndex * 13 % 11 - 5).toDouble / 40.0
      val rawScore = clamp1(base + delta) * question.maxScore
      val score = round1(rawScore.max(0.0).min(question.maxScore))
      QuestionScoreEntry(
        id = s"${sheetId}-q${question.orderIndex}",
        examId = exam.id,
        sheetId = sheetId,
        questionId = question.id,
        score = score,
        maxScore = question.maxScore,
        convertedScore = round1(score / question.maxScore * question.convertedScore),
        comment = if score >= question.maxScore * 0.85 then "过程完整，结论准确。" else if score >= question.maxScore * 0.6 then "关键步骤正确，中间过程有跳步。" else "解题路径方向正确，但核心计算与结论不完整。",
        graderId = graderId,
        graderName = graderName,
        gradedAt = uploadedAt,
        adjusted = false
      )
    }
    val rawTotal = round1(entries.map(_.score).sum)
    val convertedTotal = round1(entries.map(_.convertedScore).sum)
    val allScored = exam.questions.size == gradedQuestionCount
    for
      _ <- ExamTable.upsertSheet(connection, AnswerSheet(
        id = sheetId,
        examId = exam.id,
        studentId = studentId,
        studentName = studentName,
        imageDataUrl = sheetImage(exam.name, studentName, exam.questions),
        status = if allScored then SheetStatus.Graded.entryName else SheetStatus.Pending.entryName,
        rawTotal = if entries.isEmpty then None else Some(rawTotal),
        convertedTotal = if entries.isEmpty then None else Some(convertedTotal),
        uploadedByName = "钱老师",
        uploadedAt = uploadedAt,
        gradedAt = if allScored then Some(uploadedAt) else None
      ))
      _ <- entries.traverse_(ExamTable.insertScore(connection, _))
    yield ()

  private def seedArguesAndAnalysis(
    connection: Connection,
    exam1: Exam,
    exam4: Exam,
    memberIdByEmail: Map[String, String],
    managerId: String,
    managerName: String,
    now: Instant
  ): IO[Unit] =
    def userIdOf(email: String): String = memberIdByEmail.getOrElse(email, "")
    for
      // 考试一：两条已复核的争分（一条维持原判、一条调整得分）
      _ <- ExamTable.insertArgue(connection, ArgueTicket(
        id = "argue-e1-1",
        examId = exam1.id,
        sheetId = "sheet-e1-1",
        studentId = userIdOf("lin@example.com"),
        studentName = "林晓",
        questionId = exam1.questions(4).id,
        questionTitle = exam1.questions(4).title,
        reason = "第5题装置排序第二空，我认为冷凝水进出水方向的标注也应给分，参考答案的标准过于单一。",
        status = ArgueStatus.Resolved.entryName,
        response = "复核原卷与评分细则，该空位考查的是分离操作顺序，进出水方向不在给分点内，维持原判。",
        handledByName = Some(managerName),
        createdAt = now.minus(38, ChronoUnit.DAYS).toString,
        resolvedAt = Some(now.minus(37, ChronoUnit.DAYS).toString)
      ))
      _ <- ExamTable.insertArgue(connection, ArgueTicket(
        id = "argue-e1-2",
        examId = exam1.id,
        sheetId = "sheet-e1-2",
        studentId = userIdOf("su@example.com"),
        studentName = "苏航",
        questionId = exam1.questions(8).id,
        questionTitle = exam1.questions(8).title,
        reason = "第9题第三小问的相互作用参数推导过程我写了完整步骤，但只拿到了结论分。",
        status = ArgueStatus.Resolved.entryName,
        response = "复核确认推导过程分漏计，已将本题得分上调，折合分同步更新。",
        handledByName = Some(managerName),
        createdAt = now.minus(38, ChronoUnit.DAYS).plus(2, ChronoUnit.HOURS).toString,
        resolvedAt = Some(now.minus(37, ChronoUnit.DAYS).toString)
      ))
      // 争分调整落库：sheet-e1-2 第 9 题 +2 分并标记为复核调整
      _ <- ExamTable.listScoresBySheet(connection, "sheet-e1-2").flatMap { scores =>
        IO.fromOption(scores.find(_.questionId == exam1.questions(8).id))(new IllegalStateException("seed: score not found")).flatMap { entry =>
          val adjustedScore = (entry.score + 2.0).min(entry.maxScore)
          ExamTable.updateScore(connection, entry.copy(
            score = round1(adjustedScore),
            convertedScore = round1(adjustedScore / entry.maxScore * exam1.questions(8).convertedScore),
            comment = "复核补充推导过程分。",
            graderId = managerId,
            graderName = managerName,
            gradedAt = now.minus(37, ChronoUnit.DAYS).toString,
            adjusted = true
          ))
        }
      }
      // 考试一：争分调整后重算苏航的折合总分
      _ <- ExamTable.listScoresBySheet(connection, "sheet-e1-2").flatMap { scores =>
        ExamTable.updateSheetTotals(
          connection,
          "sheet-e1-2",
          SheetStatus.Graded.entryName,
          Some(round1(scores.map(_.score).sum)),
          Some(round1(scores.map(_.convertedScore).sum)),
          Some(now.minus(37, ChronoUnit.DAYS).toString)
        )
      }
      // 考试四：一条待处理的争分（争分窗口开放中）
      _ <- ExamTable.insertArgue(connection, ArgueTicket(
        id = "argue-e4-1",
        examId = exam4.id,
        sheetId = "sheet-e4-1",
        studentId = userIdOf("lin@example.com"),
        studentName = "林晓",
        questionId = exam4.questions(4).id,
        questionTitle = exam4.questions(4).title,
        reason = "第5题同位素标记实验的机理判断，我给出了两种可能路径并分别讨论，请老师复核是否可以按最优路径给分。",
        status = ArgueStatus.Open.entryName,
        response = "",
        handledByName = None,
        createdAt = now.minus(5, ChronoUnit.HOURS).toString,
        resolvedAt = None
      ))
      // 考试一：为林晓预生成一份规则分析报告
      sheetScores <- ExamTable.listScoresBySheet(connection, "sheet-e1-1")
      allScores <- ExamTable.listScoresByExam(connection, exam1.id)
      content = GenerateExamAnalysisAPIMessage.heuristicContent(
        exam1,
        "林晓",
        sheetScores,
        GenerateExamAnalysisAPIMessage.questionRates(exam1, sheetScores, allScores)
      )
      _ <- ExamTable.upsertAnalysis(connection, ExamAnalysis(
        id = "analysis-e1-lin",
        examId = exam1.id,
        studentId = userIdOf("lin@example.com"),
        studentName = "林晓",
        source = "heuristic",
        model = "",
        content = content,
        generatedAt = now.minus(37, ChronoUnit.DAYS).toString
      ))
    yield ()

  // ---------- 试卷定义 ----------

  private def mockExamOneQuestions: List[ExamQuestion] = List(
    ExamQuestion("q-e1-1", 1, "弱酸电离与缓冲体系计算", "化学原理与计算", 12, 10, "分段计算电离平衡、缓冲比与滴定突跃，注意活度修正。"),
    ExamQuestion("q-e1-2", 2, "能带理论与固体离子导电", "结构化学", 12, 10, "由能带结构判断导体/半导体，结合缺陷化学解释离子电导率。"),
    ExamQuestion("q-e1-3", 3, "高价态钴配合物的氧化还原", "无机元素化学", 12, 10, "配体场强对 Co(IV)/Co(III) 电对电位的影响与电子转移数计算。"),
    ExamQuestion("q-e1-4", 4, "Zintl 离子与金属簇结构", "无机元素化学", 10, 8, "Wade 规则计数、 skeletal 电子对与簇骨架几何的对应。"),
    ExamQuestion("q-e1-5", 5, "无机实验装置与分离操作", "分析化学", 10, 8, "装置连接顺序、冷凝回流与无水无氧操作的要点。"),
    ExamQuestion("q-e1-6", 6, "合成氨工业热力学分析", "物理化学", 12, 12, "ΔG-T 关系、平衡常数随温度变化与催化剂作用的辨析。"),
    ExamQuestion("q-e1-7", 7, "晶体点阵、螺旋轴与系统消光", "结构化学", 10, 8, "由消光规律确定空间群，计算晶胞参数与理论密度。"),
    ExamQuestion("q-e1-8", 8, "立体电子效应与自由基反应", "有机化学", 12, 12, "anomeric 效应、自由基稳定性排序与区域选择性判断。"),
    ExamQuestion("q-e1-9", 9, "Flory–Huggins 高分子溶液理论", "高分子化学", 10, 12, "相互作用参数 χ 的物理意义、相分离临界条件推导。"),
    ExamQuestion("q-e1-10", 10, "复杂天然产物全合成路线设计", "有机化学", 10, 10, "逆合成分析、关键串联反应与立体化学控制策略。")
  )

  private def summerPlacementQuestions: List[ExamQuestion] = List(
    ExamQuestion("q-e3-1", 1, "化学平衡与电化学综合计算", "化学原理与计算", 14, 14, "耦合电极反应的平衡常数与能斯特方程综合应用。"),
    ExamQuestion("q-e3-2", 2, "配合物晶体场与光谱化学序列", "无机元素化学", 12, 12, "d 轨道分裂能计算、颜色与磁性的解释。"),
    ExamQuestion("q-e3-3", 3, "分子对称性与轨道相互作用", "结构化学", 12, 12, "点群判断、轨道对称性匹配与反应活性关联。"),
    ExamQuestion("q-e3-4", 4, "主族元素环状簇合物", "无机元素化学", 10, 10, "苯环等电子体的无机类似物结构与芳香性判断。"),
    ExamQuestion("q-e3-5", 5, "有机反应机理与同位素标记", "有机化学", 14, 14, "用同位素示踪确定机理路径，写出关键中间体。"),
    ExamQuestion("q-e3-6", 6, "电化学腐蚀防护实验设计", "分析化学", 10, 10, "牺牲阳极与外加电流方案的比较与实验装置设计。"),
    ExamQuestion("q-e3-7", 7, "相平衡与萃取分配", "物理化学", 12, 12, "分配定律、多级萃取计算与相图分析。"),
    ExamQuestion("q-e3-8", 8, "糖化学与立体化学综合", "有机化学", 16, 16, "糖苷键构建、构型确定与保护基策略。")
  )

  private def summerFinalQuestions: List[ExamQuestion] = List(
    ExamQuestion("q-e4-1", 1, "缓冲体系与滴定曲线分析", "化学原理与计算", 12, 12, "多元酸滴定曲线分段讨论与指示剂选择。"),
    ExamQuestion("q-e4-2", 2, "固态离子导体缺陷化学", "结构化学", 12, 12, "掺杂缺陷方程与电导率-温度关系。"),
    ExamQuestion("q-e4-3", 3, "过渡金属羰基簇电子结构", "无机元素化学", 12, 12, "18 电子规则与簇骨架电子计数。"),
    ExamQuestion("q-e4-4", 4, "配合物动力学与反应机理", "无机元素化学", 10, 10, "八面体配合物取代反应的活性判据与速率方程。"),
    ExamQuestion("q-e4-5", 5, "同位素标记的机理判断实验", "有机化学", 14, 14, "设计同位素标记实验区分竞争机理，给出判据。"),
    ExamQuestion("q-e4-6", 6, "络合滴定与掩蔽剂方案", "分析化学", 10, 10, "酸效应系数、条件稳定常数与掩蔽剂选择计算。"),
    ExamQuestion("q-e4-7", 7, "电化学腐蚀热力学与动力学", "物理化学", 12, 12, "E-pH 图绘制与极化曲线分析。"),
    ExamQuestion("q-e4-8", 8, "生物碱骨架的逆合成设计", "有机化学", 16, 16, "关键 C-C 键切断、串联环化与手性中心构建。")
  )

  private def finalSprintQuestions: List[ExamQuestion] = List(
    ExamQuestion("q-e5-1", 1, "固体能带与超导材料", "结构化学", 12, 12, "能带重叠与 BCS 基础图景的定性分析。"),
    ExamQuestion("q-e5-2", 2, "金属簇合物质谱解析", "无机元素化学", 12, 12, "由同位素峰簇推断簇组成与电荷。"),
    ExamQuestion("q-e5-3", 3, "一维热传导模型", "物理化学", 10, 10, "傅里叶定律与边界条件的稳态解。"),
    ExamQuestion("q-e5-4", 4, "光化学分子开关", "有机化学", 12, 12, "顺反异构光响应循环与量子产率计算。"),
    ExamQuestion("q-e5-5", 5, "超分子配位自组装", "无机元素化学", 12, 12, "配位驱动组装的拓扑结构与热力学。"),
    ExamQuestion("q-e5-6", 6, "主客体识别热力学", "物理化学", 10, 10, "结合常数测定方法与焓熵补偿。"),
    ExamQuestion("q-e5-7", 7, "不对称催化机理", "有机化学", 12, 12, "手性配体构型-选择性关联与催化循环。"),
    ExamQuestion("q-e5-8", 8, "金属酶活性中心模拟", "无机元素化学", 10, 10, "活性中心结构-功能关系与模型化合物。"),
    ExamQuestion("q-e5-9", 9, "晶体衍射数据精修", "结构化学", 10, 10, "R 因子、占有率和无序的处理。"),
    ExamQuestion("q-e5-10", 10, "全合成中的串联反应设计", "有机化学", 10, 10, "串联环化策略与立体化学控制。")
  )

  // ---------- 答题卡图片生成 ----------

  /** 生成答题卡 SVG 的 data URL：两栏题框布局，与归一化改题区域的换算保持一致。 */
  private def sheetImage(examName: String, studentName: String, questions: List[ExamQuestion]): String =
    val boxes = questions.take(10).zipWithIndex.map { case (question, index) =>
      val column = index % 2
      val row = index / 2
      val x = 40 + column * 260
      val y = 150 + row * 88
      s"""<rect x="$x" y="$y" width="250" height="76" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>""" +
        s"""<text x="${x + 12}" y="${y + 24}" font-size="13" font-weight="bold" fill="#0f172a">第 ${index + 1} 题（满分 ${question.maxScore.toInt}）</text>""" +
        s"""<text x="${x + 12}" y="${y + 44}" font-size="10" fill="#64748b">${escapeXml(question.topicTag)} · ${escapeXml(question.title)}</text>""" +
        s"""<line x1="${x + 12}" y1="${y + 56}" x2="${x + 238}" y2="${y + 56}" stroke="#cbd5e1"/>""" +
        s"""<line x1="${x + 12}" y1="${y + 68}" x2="${x + 238}" y2="${y + 68}" stroke="#cbd5e1"/>"""
    }.mkString
    val svg =
      s"""<svg xmlns="http://www.w3.org/2000/svg" width="570" height="600" viewBox="0 0 570 600">""" +
        s"""<rect width="570" height="600" fill="#f8fafc"/>""" +
        s"""<text x="285" y="42" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">清北营 · ${escapeXml(examName)}</text>""" +
        s"""<text x="285" y="66" text-anchor="middle" font-size="13" fill="#475569">高中化学奥林匹克 · 答题卡</text>""" +
        s"""<text x="40" y="102" font-size="14" fill="#0f172a">姓名：${escapeXml(studentName)}</text>""" +
        s"""<text x="380" y="102" font-size="14" fill="#0f172a">考号：QB-${examName.hashCode.abs % 10000}</text>""" +
        s"""<line x1="40" y1="120" x2="530" y2="120" stroke="#334155" stroke-width="1.5"/>""" +
        boxes +
        s"""</svg>"""
    s"data:image/svg+xml;base64," + Base64.getEncoder.encodeToString(svg.getBytes("UTF-8"))

  /** 与 sheetImage 布局一致的归一化改题区域。 */
  private def regionsFor(questions: List[ExamQuestion]): Map[String, GradingRegion] =
    questions.take(10).zipWithIndex.map { case (question, index) =>
      val column = index % 2
      val row = index / 2
      val x = (40 + column * 260).toDouble / 570.0
      val y = (150 + row * 88).toDouble / 600.0
      question.id -> GradingRegion(
        x = round4(x),
        y = round4(y),
        w = round4(250.0 / 570.0),
        h = round4(76.0 / 600.0)
      )
    }.toMap

  private def escapeXml(value: String): String =
    value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;")

  private def clamp1(value: Double): Double = value.max(0.2).min(1.0)

  private def round1(value: Double): Double =
    BigDecimal(value).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble

  private def round4(value: Double): Double =
    BigDecimal(value).setScale(4, BigDecimal.RoundingMode.HALF_UP).toDouble
