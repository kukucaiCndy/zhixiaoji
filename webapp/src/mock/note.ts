import { success, delay, paginate, randomId } from './base'

const notes = [
  { id: 1, title: 'Python变量命名规范笔记', content: 'Python的变量命名需要遵循以下规则:\n1. 变量名只能包含字母、数字和下划线\n2. 变量名不能以数字开头\n3. 变量名区分大小写\n4. 不能使用Python关键字作为变量名\n5. 推荐使用下划线命名法(snake_case)', cardName: 'Python变量与数据类型', authorId: 10001, authorName: '编程小王子', createdAt: '2026-05-12 14:30', auditStatus: '审核存疑', aiConfidence: 72 },
  { id: 2, title: '条件判断学习笔记', content: 'if-elif-else结构是Python中最重要的控制流结构之一。if后面跟条件表达式，elif可以有多个，else是可选的。', cardName: 'Python条件判断', authorId: 10002, authorName: '代码少女', createdAt: '2026-05-11 16:00', auditStatus: '审核通过', aiConfidence: 95 },
  { id: 3, title: '作用域链的理解', content: 'JavaScript的作用域分为全局作用域、函数作用域和块级作用域（ES6引入let/const）。作用域链决定了变量的访问顺序。', cardName: 'JavaScript变量作用域', authorId: 10003, authorName: '算法大师', createdAt: '2026-05-10 10:00', auditStatus: '审核通过', aiConfidence: 98 },
  { id: 4, title: '关于排序算法', content: '这个算法太难了，我为什么学不会。大家可以去github搜索相关资源。', cardName: '数组排序算法', authorId: 10005, authorName: '前端萌新', createdAt: '2026-05-09 20:00', auditStatus: '已删除', aiConfidence: 45 }
]

export const noteMock = {
  async getNotes(params: { page: number; pageSize: number; title?: string; auditStatus?: string }) {
    await delay(400)
    let filtered = [...notes]
    if (params.title) filtered = filtered.filter((n) => n.title.includes(params.title!) || n.content.includes(params.title!))
    if (params.auditStatus) filtered = filtered.filter((n) => n.auditStatus === params.auditStatus)
    return success(paginate(filtered, { page: params.page, pageSize: params.pageSize }))
  },

  async getNoteDetail(id: number) {
    await delay(300)
    const note = notes.find((n) => n.id === id)
    if (!note) return { code: -1, data: null, message: '笔记不存在' }
    return success(note)
  },

  async auditNote(id: number, action: string, remark: string) {
    await delay(400)
    const note = notes.find((n) => n.id === id)
    if (!note) return { code: -1, data: null, message: '笔记不存在' }
    if (action === 'approve') note.auditStatus = '审核通过'
    else if (action === 'reject') note.auditStatus = '已删除'
    else if (action === 'keep') note.auditStatus = '审核存疑'
    return success(null, '操作成功')
  },

  async deleteNote(id: number) {
    await delay(400)
    const idx = notes.findIndex((n) => n.id === id)
    if (idx === -1) return { code: -1, data: null, message: '笔记不存在' }
    notes.splice(idx, 1)
    return success(null, '删除成功')
  },

  async batchDelete(ids: number[]) {
    await delay(500)
    ids.forEach((id) => {
      const idx = notes.findIndex((n) => n.id === id)
      if (idx !== -1) notes.splice(idx, 1)
    })
    return success(null, '删除成功')
  }
}
