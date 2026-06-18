import { success, delay } from './base'

function randomStrId(): string {
  return String(Math.floor(Math.random() * 100000) + 1)
}

export interface IQuestionOption {
  key: string
  text: string
}

export interface IQuestion {
  id: string
  lessonId: number | string
  content: string
  type: 'single_choice' | 'multiple_choice' | 'true_false'
  options: IQuestionOption[] | null
  correctAnswer: string
  explanation: string | null
  difficulty: string
  subjectId?: string
  chapterId?: string
  sortOrder: number
  status: string
  createdAt: string
  updatedAt: string
}

const questions: IQuestion[] = [
  {
    id: '1', lessonId: 1,
    content: 'Python中用于向控制台输出信息的函数是什么？',
    type: 'single_choice',
    options: [
      { key: 'A', text: 'print()' },
      { key: 'B', text: 'echo()' },
      { key: 'C', text: 'console.log()' },
      { key: 'D', text: 'println()' }
    ],
    correctAnswer: 'A',
    explanation: 'print()是Python内置的输出函数，用于在控制台打印信息。echo()用于PHP，console.log()用于JavaScript。',
    difficulty: '入门', sortOrder: 1, status: '展示',
    createdAt: '2026-05-12T10:00:00Z', updatedAt: '2026-05-12T10:00:00Z'
  },
  {
    id: '2', lessonId: 1,
    content: '以下哪些是合法的Python变量名？',
    type: 'multiple_choice',
    options: [
      { key: 'A', text: '_myVar' },
      { key: 'B', text: '2things' },
      { key: 'C', text: 'user_name' },
      { key: 'D', text: 'my-var' }
    ],
    correctAnswer: 'A,C',
    explanation: 'Python变量名可以包含字母、数字和下划线，但不能以数字开头（B错误），也不能包含连字符（D错误）。',
    difficulty: '入门', sortOrder: 2, status: '展示',
    createdAt: '2026-05-12T10:00:00Z', updatedAt: '2026-05-12T10:00:00Z'
  },
  {
    id: '3', lessonId: 1,
    content: 'Python是一种强类型语言。',
    type: 'true_false',
    options: [
      { key: 'A', text: '正确' },
      { key: 'B', text: '错误' }
    ],
    correctAnswer: 'A',
    explanation: 'Python是强类型语言（Strongly Typed），变量类型在运行时确定但不会自动转换不兼容的类型。',
    difficulty: '入门', sortOrder: 3, status: '展示',
    createdAt: '2026-05-12T10:00:00Z', updatedAt: '2026-05-12T10:00:00Z'
  },
  {
    id: '4', lessonId: 1,
    content: 'Python的官方包管理工具是什么？',
    type: 'single_choice',
    options: [
      { key: 'A', text: 'npm' },
      { key: 'B', text: 'pip' },
      { key: 'C', text: 'gem' },
      { key: 'D', text: 'composer' }
    ],
    correctAnswer: 'B',
    explanation: 'pip是Python官方推荐的包管理工具，用于安装和管理Python第三方库。',
    difficulty: '入门', sortOrder: 4, status: '展示',
    createdAt: '2026-05-12T10:00:00Z', updatedAt: '2026-05-12T10:00:00Z'
  },
  {
    id: '5', lessonId: 1,
    content: 'Python中注释单行代码使用 // 符号。',
    type: 'true_false',
    options: [
      { key: 'A', text: '正确' },
      { key: 'B', text: '错误' }
    ],
    correctAnswer: 'B',
    explanation: 'Python中单行注释使用 # 符号，// 是整除运算符。',
    difficulty: '入门', sortOrder: 5, status: '展示',
    createdAt: '2026-05-12T10:00:00Z', updatedAt: '2026-05-12T10:00:00Z'
  },
  {
    id: '6', lessonId: 2,
    content: '以下哪个不是Python的基本数据类型？',
    type: 'single_choice',
    options: [
      { key: 'A', text: 'int' },
      { key: 'B', text: 'float' },
      { key: 'C', text: 'char' },
      { key: 'D', text: 'str' }
    ],
    correctAnswer: 'C',
    explanation: 'Python中没有单独的char（字符）类型，单个字符也是str类型。int、float、str都是Python基本数据类型。',
    difficulty: '入门', sortOrder: 1, status: '展示',
    createdAt: '2026-05-13T10:00:00Z', updatedAt: '2026-05-13T10:00:00Z'
  },
  {
    id: '7', lessonId: 2,
    content: '以下哪些方法可以将字符串转换为整数？',
    type: 'multiple_choice',
    options: [
      { key: 'A', text: 'int("42")' },
      { key: 'B', text: 'float("3.14")' },
      { key: 'C', text: 'str(100)' },
      { key: 'D', text: 'eval("2+3")' }
    ],
    correctAnswer: 'A',
    explanation: '只有int()直接返回整数类型。float()返回浮点数，str()返回字符串，eval()返回表达式结果。',
    difficulty: '基础', sortOrder: 2, status: '展示',
    createdAt: '2026-05-13T10:00:00Z', updatedAt: '2026-05-13T10:00:00Z'
  },
  {
    id: '8', lessonId: 2,
    content: '在Python中，type(3.14) 返回 float。',
    type: 'true_false',
    options: [
      { key: 'A', text: '正确' },
      { key: 'B', text: '错误' }
    ],
    correctAnswer: 'A',
    explanation: '3.14是浮点数字面量，type()函数返回其类型为float。',
    difficulty: '入门', sortOrder: 3, status: '展示',
    createdAt: '2026-05-13T10:00:00Z', updatedAt: '2026-05-13T10:00:00Z'
  },
  {
    id: '9', lessonId: 2,
    content: '以下哪种方式可以正确创建一个空列表？',
    type: 'single_choice',
    options: [
      { key: 'A', text: 'list = {}' },
      { key: 'B', text: 'list = []' },
      { key: 'C', text: 'list = ()' },
      { key: 'D', text: 'list = ""' }
    ],
    correctAnswer: 'B',
    explanation: '[] 创建空列表，{} 创建空字典，() 创建空元组，"" 创建空字符串。',
    difficulty: '入门', sortOrder: 4, status: '展示',
    createdAt: '2026-05-13T10:00:00Z', updatedAt: '2026-05-13T10:00:00Z'
  },
  {
    id: '10', lessonId: 3,
    content: 'JavaScript中声明变量的关键字不包括以下哪个？',
    type: 'single_choice',
    options: [
      { key: 'A', text: 'var' },
      { key: 'B', text: 'let' },
      { key: 'C', text: 'const' },
      { key: 'D', text: 'def' }
    ],
    correctAnswer: 'D',
    explanation: 'def是Python中定义函数的关键字，不是JavaScript的变量声明关键字。',
    difficulty: '入门', sortOrder: 1, status: '隐藏',
    createdAt: '2026-05-14T10:00:00Z', updatedAt: '2026-05-14T10:00:00Z'
  }
]

export const questionMock = {
  async getQuestions(params: { lessonId?: number | string; page?: number; pageSize?: number; type?: string; difficulty?: string; status?: string }) {
    await delay(400)
    let filtered = [...questions]
    if (params.lessonId) filtered = filtered.filter((q) => q.lessonId == params.lessonId)
    if (params.type) {
      const mapped = params.type === '单选题' ? 'single_choice' : params.type === '多选题' ? 'multiple_choice' : params.type === '判断题' ? 'true_false' : params.type
      filtered = filtered.filter((q) => q.type === mapped)
    }
    if (params.difficulty) filtered = filtered.filter((q) => q.difficulty === params.difficulty)
    if (params.status) filtered = filtered.filter((q) => q.status === params.status)
    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const total = filtered.length
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)
    return success({ list, total, page, pageSize }, 'ok')
  },

  async getQuestion(id: string) {
    await delay(300)
    const q = questions.find((item) => String(item.id) === String(id))
    if (!q) return { code: -1, data: null, message: '题目不存在' }
    return success({ ...q })
  },

  async createQuestion(data: Record<string, unknown>) {
    await delay(400)
    const type = data.type as string
    const q: IQuestion = {
      id: randomStrId(),
      lessonId: data.lessonId as number | string,
      content: data.content as string,
      type: type as IQuestion['type'],
      options: (data.options as IQuestionOption[]) || [],
      correctAnswer: (data.correctAnswer as string) || '',
      explanation: (data.explanation as string) || null,
      difficulty: (data.difficulty as string) || '入门',
      sortOrder: (data.sortOrder as number) || questions.length + 1,
      status: (data.status as string) || '草稿',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    questions.unshift(q)
    return success(q)
  },

  async updateQuestion(id: string, data: Record<string, unknown>) {
    await delay(400)
    const q = questions.find((item) => String(item.id) === String(id))
    if (!q) return { code: -1, data: null, message: '题目不存在' }
    Object.assign(q, data, { updatedAt: new Date().toISOString() })
    return success(q)
  },

  async deleteQuestion(id: string) {
    await delay(400)
    const idx = questions.findIndex((q) => String(q.id) === String(id))
    if (idx === -1) return { code: -1, data: null, message: '题目不存在' }
    questions.splice(idx, 1)
    return success(null, '删除成功')
  },

  async batchUpdateStatus(ids: string[], status: string) {
    await delay(500)
    ids.forEach((id) => {
      const q = questions.find((item) => String(item.id) === String(id))
      if (q) q.status = status
    })
    return success(null, '操作成功')
  },

  async getLessonQuestionStats() {
    await delay(300)
    const stats: Record<string, { lessonId: number | string; total: number; published: number }> = {}
    questions.forEach((q) => {
      const key = String(q.lessonId)
      if (!stats[key]) stats[key] = { lessonId: q.lessonId, total: 0, published: 0 }
      stats[key].total++
      if (q.status === '展示') stats[key].published++
    })
    return success(Object.values(stats))
  },

  async aiImportQuestions(lessonId: number | string, lessonTitle: string) {
    await delay(3000)
    const generated: IQuestion[] = [
      {
        id: randomStrId(), lessonId,
        content: '下列哪个是Python中的不可变数据类型？',
        type: 'single_choice',
        options: [
          { key: 'A', text: 'list' },
          { key: 'B', text: 'tuple' },
          { key: 'C', text: 'dict' },
          { key: 'D', text: 'set' }
        ],
        correctAnswer: 'B',
        explanation: 'tuple（元组）是不可变数据类型，list、dict、set都是可变数据类型。',
        difficulty: '基础', sortOrder: questions.filter((q) => q.lessonId == lessonId).length + 1, status: '展示',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      },
      {
        id: String(Number(randomStrId()) + 1), lessonId,
        content: 'Python中，2 ** 3 的计算结果是 6。',
        type: 'true_false',
        options: [{ key: 'A', text: '正确' }, { key: 'B', text: '错误' }],
        correctAnswer: 'B',
        explanation: '** 是指数运算符，2 ** 3 = 2³ = 8，不是6。',
        difficulty: '入门', sortOrder: questions.filter((q) => q.lessonId == lessonId).length + 2, status: '展示',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      },
      {
        id: String(Number(randomStrId()) + 2), lessonId,
        content: '以下哪些是有效的Python字典操作？',
        type: 'multiple_choice',
        options: [
          { key: 'A', text: 'dict["key"] = "value"' },
          { key: 'B', text: 'dict.get("key")' },
          { key: 'C', text: 'del dict["key"]' },
          { key: 'D', text: 'dict.push("value")' }
        ],
        correctAnswer: 'A,B,C',
        explanation: '字典没有push方法（那是列表的），其他三个都是有效的字典操作。',
        difficulty: '基础', sortOrder: questions.filter((q) => q.lessonId == lessonId).length + 3, status: '展示',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      }
    ]
    questions.unshift(...generated)
    return success(generated)
  }
}
