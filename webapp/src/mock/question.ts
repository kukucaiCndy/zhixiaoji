import { success, delay, paginate, randomId } from './base'

const questions = [
  { id: 1, content: 'Python中用于输出的函数是什么？', type: '单选题', difficulty: '入门', relatedCard: 'Python变量与数据类型', correctRate: 95.2, answerCount: 3100, status: '已上架', updatedAt: '2026-05-12 10:00' },
  { id: 2, content: '以下哪些是Python的合法变量名？（多选）', type: '多选题', difficulty: '入门', relatedCard: 'Python变量与数据类型', correctRate: 78.5, answerCount: 2800, status: '已上架', updatedAt: '2026-05-11 14:00' },
  { id: 3, content: 'JavaScript是强类型语言。', type: '判断题', difficulty: '基础', relatedCard: 'JavaScript变量作用域', correctRate: 88.0, answerCount: 2400, status: '已上架', updatedAt: '2026-05-10 09:30' },
  { id: 4, content: '二分查找的时间复杂度是？', type: '单选题', difficulty: '进阶', relatedCard: '二分查找算法', correctRate: 65.8, answerCount: 1400, status: '已上架', updatedAt: '2026-05-09 11:00' },
  { id: 5, content: 'CSS中box-sizing的默认值是什么？', type: '单选题', difficulty: '基础', relatedCard: 'CSS盒模型详解', correctRate: 72.3, answerCount: 2300, status: '草稿', updatedAt: '2026-05-08 16:20' }
]

export const questionMock = {
  async getQuestions(params: { page: number; pageSize: number; type?: string; difficulty?: string; status?: string }) {
    await delay(400)
    let filtered = [...questions]
    if (params.type) filtered = filtered.filter((q) => q.type === params.type)
    if (params.difficulty) filtered = filtered.filter((q) => q.difficulty === params.difficulty)
    if (params.status) filtered = filtered.filter((q) => q.status === params.status)
    return success(paginate(filtered, { page: params.page, pageSize: params.pageSize }))
  },

  async getQuestion(id: number) {
    await delay(300)
    const q = questions.find((item) => item.id === id)
    if (!q) return { code: -1, data: null, message: '题目不存在' }
    return success({
      ...q,
      options: [
        { label: 'A', content: 'print()' },
        { label: 'B', content: 'echo()' },
        { label: 'C', content: 'console.log()' },
        { label: 'D', content: 'display()' }
      ],
      correctAnswer: 'A',
      explanation: 'print()是Python内置的输出函数，用于在控制台打印信息。'
    })
  },

  async createQuestion(data: Record<string, unknown>) {
    await delay(400)
    const q = {
      id: randomId(),
      content: data.content as string,
      type: data.type as string,
      difficulty: data.difficulty as string,
      relatedCard: (data.relatedCard as string) || '',
      correctRate: 0,
      answerCount: 0,
      status: (data.status as string) || '草稿',
      updatedAt: new Date().toISOString()
    }
    questions.unshift(q)
    return success(q)
  },

  async updateQuestion(id: number, data: Record<string, unknown>) {
    await delay(400)
    const q = questions.find((item) => item.id === id)
    if (!q) return { code: -1, data: null, message: '题目不存在' }
    Object.assign(q, data)
    return success(q)
  },

  async deleteQuestion(id: number) {
    await delay(400)
    const idx = questions.findIndex((q) => q.id === id)
    if (idx === -1) return { code: -1, data: null, message: '题目不存在' }
    questions.splice(idx, 1)
    return success(null, '删除成功')
  },

  async batchUpdateStatus(ids: number[], status: string) {
    await delay(500)
    ids.forEach((id) => {
      const q = questions.find((item) => item.id === id)
      if (q) q.status = status
    })
    return success(null, '操作成功')
  },

  async getImportTemplate() {
    await delay(200)
    return success({ url: '/templates/question-import-template.xlsx' })
  },

  async importQuestions(file: File) {
    await delay(2000)
    return success({ total: 120, success: 115, fail: 5 })
  },

  async exportQuestions() {
    await delay(1500)
    return success({ url: '/exports/questions-export.xlsx' })
  }
}
