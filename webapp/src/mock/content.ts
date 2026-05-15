import { success, fail, delay, paginate, randomId } from './base'

export interface ICard {
  id: number
  title: string
  chapterName: string
  chapterId: number
  difficulty: string
  estimatedMinutes: number
  studyCount: number
  correctRate: number
  status: string
  updatedAt: string
  content?: string
  conceptExplanation?: string
  lifeAnalogy?: string
  codeExample?: string
  summary?: string
  interactiveQuestion?: string
}

let cardList: ICard[] = [
  { id: 1, title: 'Python变量与数据类型', chapterName: '1.1 Python基础', chapterId: 1, difficulty: '入门', estimatedMinutes: 10, studyCount: 3200, correctRate: 88.5, status: '已上架', updatedAt: '2026-05-12 14:30' },
  { id: 2, title: 'Python条件判断', chapterName: '1.1 Python基础', chapterId: 1, difficulty: '入门', estimatedMinutes: 8, studyCount: 2800, correctRate: 85.2, status: '已上架', updatedAt: '2026-05-11 10:15' },
  { id: 3, title: 'JavaScript变量作用域', chapterName: '2.1 JS核心', chapterId: 4, difficulty: '基础', estimatedMinutes: 15, studyCount: 2500, correctRate: 82.1, status: '已上架', updatedAt: '2026-05-10 09:00' },
  { id: 4, title: '数组排序算法', chapterName: '3.1 算法入门', chapterId: 7, difficulty: '进阶', estimatedMinutes: 20, studyCount: 1800, correctRate: 75.8, status: '已上架', updatedAt: '2026-05-09 16:20' },
  { id: 5, title: '链表数据结构', chapterName: '3.2 数据结构', chapterId: 8, difficulty: '进阶', estimatedMinutes: 25, studyCount: 1200, correctRate: 72.3, status: '草稿', updatedAt: '2026-05-08 11:00' },
  { id: 6, title: 'CSS盒模型详解', chapterName: '2.2 Web基础', chapterId: 5, difficulty: '基础', estimatedMinutes: 12, studyCount: 2600, correctRate: 90.1, status: '已上架', updatedAt: '2026-05-07 08:30' },
  { id: 7, title: 'HTML表单元素', chapterName: '2.2 Web基础', chapterId: 5, difficulty: '入门', estimatedMinutes: 8, studyCount: 3000, correctRate: 92.5, status: '已上架', updatedAt: '2026-05-06 14:10' },
  { id: 8, title: '二分查找算法', chapterName: '3.1 算法入门', chapterId: 7, difficulty: '进阶', estimatedMinutes: 18, studyCount: 1500, correctRate: 70.0, status: '已下架', updatedAt: '2026-05-05 10:45' }
]

export const contentMock = {
  async getCards(params: { page: number; pageSize: number; title?: string; chapterId?: number; difficulty?: string; status?: string }) {
    await delay(400)
    let filtered = [...cardList]
    if (params.title) {
      filtered = filtered.filter((c) => c.title.includes(params.title!))
    }
    if (params.chapterId) {
      filtered = filtered.filter((c) => c.chapterId === params.chapterId)
    }
    if (params.difficulty) {
      filtered = filtered.filter((c) => c.difficulty === params.difficulty)
    }
    if (params.status) {
      filtered = filtered.filter((c) => c.status === params.status)
    }
    return success(paginate(filtered, { page: params.page, pageSize: params.pageSize }))
  },

  async getCard(id: number) {
    await delay(300)
    const card = cardList.find((c) => c.id === id)
    if (!card) return fail('卡片不存在')
    return success({
      ...card,
      content: `## ${card.title}\n\n这是卡片 "${card.title}" 的详细内容。\n\n### 概念解释\n通俗易懂地解释核心概念...\n\n### 生活类比\n用日常生活场景类比说明...\n\n### 代码示例\n\`\`\`python\nprint("Hello, World!")\n\`\`\`\n\n### 要点总结\n\n- 要点1\n- 要点2\n- 要点3\n\n### 互动提问\n思考：这个概念的实践应用场景有哪些？`,
      conceptExplanation: '概念解释内容...',
      lifeAnalogy: '生活类比内容...',
      codeExample: 'print("Hello, World!")',
      summary: '要点总结内容...',
      interactiveQuestion: '互动提问内容...'
    })
  },

  async createCard(data: Partial<ICard>) {
    await delay(500)
    const newCard: ICard = {
      id: randomId(),
      title: data.title || '',
      chapterName: data.chapterName || '未分类',
      chapterId: data.chapterId || 0,
      difficulty: data.difficulty || '入门',
      estimatedMinutes: data.estimatedMinutes || 10,
      studyCount: 0,
      correctRate: 0,
      status: data.status || '草稿',
      updatedAt: new Date().toISOString()
    }
    cardList.unshift(newCard)
    return success(newCard)
  },

  async updateCard(id: number, data: Partial<ICard>) {
    await delay(500)
    const idx = cardList.findIndex((c) => c.id === id)
    if (idx === -1) return fail('卡片不存在')
    cardList[idx] = { ...cardList[idx], ...data, updatedAt: new Date().toISOString() }
    return success(cardList[idx])
  },

  async deleteCard(id: number) {
    await delay(400)
    const idx = cardList.findIndex((c) => c.id === id)
    if (idx === -1) return fail('卡片不存在')
    cardList.splice(idx, 1)
    return success(null, '删除成功')
  },

  async batchUpdateStatus(ids: number[], status: string) {
    await delay(500)
    ids.forEach((id) => {
      const card = cardList.find((c) => c.id === id)
      if (card) card.status = status
    })
    return success(null, '操作成功')
  }
}
