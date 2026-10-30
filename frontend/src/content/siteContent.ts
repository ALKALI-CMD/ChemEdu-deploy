// 文件说明：清北营官方网站静态文案数据，集中维护团队、课程与教研内容。
// 内容原则：只陈述可公开核验的信息，不暗示与清华大学、北京大学或中国化学会存在任何官方关系。

export const brand = {
  name: '清北营',
  tagline: '化学竞赛团队',
  contactNote: '留下联系方式，咨询课程与训练安排。',
}

export type CourseProgram = {
  id: string
  name: string
  season: string
  target: string
  duration: string
  paperCount: string
  highlights: string[]
  suitableFor: string
}

export const coursePrograms: CourseProgram[] = [
  {
    id: 'winter-vip',
    name: '寒假化学竞赛高端 VIP 班',
    season: '寒假',
    target: '省一水平 · 冲省队',
    duration: '约 7 天',
    paperCount: '5 套全真模拟卷',
    highlights: ['小班分层教学', '完整套卷限时训练', '逐题讲评与过程分复盘'],
    suitableFor: '已完成一轮系统学习，需要在寒假保持高强度刷题节奏的学员。',
  },
  {
    id: 'spring-vip',
    name: '春季高端 VIP 班',
    season: '春季（周末）',
    target: '国初冲刺',
    duration: '约 14 周',
    paperCount: '约 12 套初赛模拟卷',
    highlights: ['按国初真题结构命题', '陌生背景材料训练', '每周一次考试窗口与学情反馈'],
    suitableFor: '稳定省一水平、正在冲省队的学员，可与学校教练的常规训练并行。',
  },
  {
    id: 'summer-camp',
    name: '暑期高端集训营',
    season: '暑期',
    target: '国初前大规模模拟',
    duration: '约 6 周',
    paperCount: '约 15 套套卷',
    highlights: ['连续高强度模拟', '当晚讲评', '结业测试与个人短板分析报告'],
    suitableFor: '已完成知识体系搭建，需要在国初前集中暴露与修补短板的学员。',
  },
  {
    id: 'initial-sprint',
    name: '国初模拟与冲刺专项',
    season: '贯穿全年',
    target: '中国化学奥林匹克（初赛）',
    duration: '随班进行',
    paperCount: '单场完整考试 + 智能评定',
    highlights: ['综合计算与长题干训练', '无机结构、有机合成、物化交叉命题', '折合分成绩册与班级对比'],
    suitableFor: '所有在营学员；也接受单次模考报名（以当期通知为准）。',
  },
  {
    id: 'final-sprint',
    name: '国决冲刺班',
    season: '国庆前后',
    target: '中国化学奥林匹克（决赛）',
    duration: '约 9 天封闭集训',
    paperCount: '7 次左右完整考试',
    highlights: ['有机、无机、物化分科授课', '当晚讲评', '大学化学前沿题型训练'],
    suitableFor: '已进入省队或具备国决实力的学员。',
  },
]

export const subjectAreas = ['无机化学', '有机化学', '物理化学', '结构化学']

export type ResearchBlock = {
  id: string
  title: string
  body: string
  tags: string[]
}

export const researchBlocks: ResearchBlock[] = [
  {
    id: 'paper-system',
    title: '全真模拟卷体系',
    body:
      '每期课程配套完整套卷：春季班约 12 套、暑期营约 15 套、国决冲刺 7 次完整考试。' +
      '所有试卷按国初/国决真题的题量、分值结构与长题干风格命制，考试在评定平台内完成判分与折合分统计。',
    tags: ['完整套卷', '当晚讲评', '评分细则'],
  },
  {
    id: 'coverage',
    title: '命题覆盖面',
    body: '近年模拟卷覆盖的高阶主题包括（部分）：',
    tags: [
      '能带理论',
      '高价态钴配合物',
      'Zintl 离子',
      '金属簇与质谱',
      '一维热传导',
      '合成氨工业热力学',
      '晶体点阵与系统消光',
      '光化学分子开关',
      '超分子配位化学',
      'Flory–Huggins 高分子溶液理论',
      '立体电子效应',
      '复杂天然产物全合成',
    ],
  },
  {
    id: 'assessment',
    title: '考试评定平台',
    body:
      '我们自研的在线评定平台覆盖"答题卡上传 → 改题区域划分 → 助教判分 → 折合分统计 → AI 学情分析 → 争分复核"全流程：' +
      '每道题按评分细则给过程分，折合分统一口径排名，学生对判分有异议可在争分窗口内一键申诉，由教研老师复核。',
    tags: ['答题卡阅读器', '折合分', '争分窗口'],
  },
  {
    id: 'integrity',
    title: '答案严谨度承诺',
    body:
      '高难度不等于高可靠性。每套试卷配套参考答案与评分细则，讲评中公开得分点拆分；' +
      '学员或学校教练若发现答案存疑，可通过平台争分通道反馈，经命题组复核后在讲义勘误中公示。',
    tags: ['评分细则公开', '勘误公示'],
  },
]

export const resultsPolicy = {
  title: '学员成果：只公布可核验的成绩',
  commitments: [
    { label: '姓名与学校', detail: '公布的成绩均注明学员姓名（或经本人授权的化名）与所在学校。' },
    { label: '具体课程', detail: '注明学员所上的具体期次与班型，区分长期学员与单次模考学员。' },
    { label: '获奖年份与等级', detail: '注明获奖年份、赛事层级（省一/省队/国决等），不接受模糊表述。' },
    { label: '本人授权', detail: '所有署名成绩均获得学员本人或其学校的授权。' },
    { label: '统计口径', detail: '转化率类数据注明分母口径；不把"参加过一次模考"计入长期学员战绩。' },
  ],
  statement:
    '无法满足上述口径的数据不予公布。报名前，欢迎家长与学校教练要求我们提供任一宣传成绩对应的核验材料。',
}

export const faqs: { q: string; a: string }[] = [
  {
    q: '如何选择课程？',
    a: '根据当前学习进度和目标赛段选择课程，也可以在咨询时说明你的基础与训练需求。',
  },
  {
    q: '如何查看成绩和申请复核？',
    a: '登录平台后，在考试中心查看成绩与逐题反馈，并在争分窗口内提交复核申请。',
  },
]
