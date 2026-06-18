import { success, fail, delay, randomId } from './base'

// ==================== Types ====================

export interface IKnowledgeSystem {
  id: number
  name: string
  icon: string
  difficulty: string
  sortOrder: number
  chapterCount: number
  sectionCount: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface IChapter {
  id: number
  knowledgeSystemId: number
  knowledgeSystemName: string
  name: string
  goal: string
  description: string
  sortOrder: number
  difficulty: string
  sectionCount: number
}

export interface ISection {
  id: number
  chapterId: number
  chapterName: string
  title: string
  knowledgePoint: string
  sortOrder: number
  htmlContent: string
  htmlUrl: string
  latestHtmlContent?: string
  imageDesigns: string
  createdAt: string
  updatedAt: string
}

// Legacy alias - will be replaced by real ICategory below

export interface ColorRef {
  hex: string
  rgba: string
  name: string
  usage: string
}

export interface GradientRef {
  name: string
  css: string
}

export interface WorkflowColorRef {
  hex: string
  rgba: string
}

export interface WorkflowInput {
  primary: WorkflowColorRef
  secondary: WorkflowColorRef
  success: WorkflowColorRef
  warning: WorkflowColorRef
  error: WorkflowColorRef
  background: WorkflowColorRef
  card: WorkflowColorRef
  textPrimary: WorkflowColorRef
  textSecondary: WorkflowColorRef
  divider: WorkflowColorRef
  primaryGradient: string
  backgroundGradient: string
  cardShadow: string
}

export interface ColorScheme {
  id: string
  schema: string
  theme: string
  description: string | null
  colors: Record<string, ColorRef>
  neutrals: Record<string, ColorRef>
  gradients: Record<string, GradientRef>
  shadows: Record<string, string>
  applicationExamples: Record<string, any> | null
  meta: Record<string, any> | null
  workflowInput: WorkflowInput
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// ==================== Data - Categories (分类/Category) ====================

export interface ICategory {
  id: number
  name: string
  icon: string
  description: string
  sortOrder: number
  subjectCount: number
  status: string
  createdAt: string
  updatedAt: string
}

const categories: ICategory[] = [
  { id: 1, name: '编程语言', icon: '💻', description: '各类编程语言入门与进阶学习', sortOrder: 1, subjectCount: 3, status: '展示', createdAt: '2026-05-01T08:00:00Z', updatedAt: '2026-05-15T10:00:00Z' },
  { id: 2, name: '计算机基础', icon: '🖥️', description: '计算机科学核心基础知识', sortOrder: 2, subjectCount: 1, status: '展示', createdAt: '2026-04-15T08:00:00Z', updatedAt: '2026-05-14T10:00:00Z' },
  { id: 3, name: '人工智能', icon: '🤖', description: 'AI技术与应用实践', sortOrder: 3, subjectCount: 1, status: '隐藏', createdAt: '2026-04-10T08:00:00Z', updatedAt: '2026-05-11T10:00:00Z' },
]

// ==================== Data - Subjects (学科/Subject) ====================

export interface ISubject {
  id: number
  categoryId: number
  name: string
  icon: string
  difficulty: string
  sortOrder: number
  chapterCount: number
  lessonCount: number
  status: string
  createdAt: string
  updatedAt: string
}

const subjects: ISubject[] = [
  { id: 1, categoryId: 1, name: 'Python入门', icon: '🐍', difficulty: '入门', sortOrder: 1, chapterCount: 5, lessonCount: 20, status: '展示', createdAt: '2026-05-01T08:00:00Z', updatedAt: '2026-05-15T10:00:00Z' },
  { id: 2, categoryId: 1, name: 'C++入门', icon: '⚡', difficulty: '入门', sortOrder: 2, chapterCount: 4, lessonCount: 16, status: '展示', createdAt: '2026-04-15T08:00:00Z', updatedAt: '2026-05-14T10:00:00Z' },
  { id: 3, categoryId: 1, name: 'Java基础', icon: '☕', difficulty: '基础', sortOrder: 3, chapterCount: 6, lessonCount: 24, status: '展示', createdAt: '2026-04-10T08:00:00Z', updatedAt: '2026-05-11T10:00:00Z' },
  { id: 4, categoryId: 2, name: '计算机组成原理', icon: '🔧', difficulty: '进阶', sortOrder: 1, chapterCount: 3, lessonCount: 12, status: '展示', createdAt: '2026-05-10T08:00:00Z', updatedAt: '2026-05-10T10:00:00Z' },
  { id: 5, categoryId: 3, name: '人工智能导论', icon: '🧠', difficulty: '入门', sortOrder: 1, chapterCount: 2, lessonCount: 8, status: '草稿', createdAt: '2026-04-01T08:00:00Z', updatedAt: '2026-05-08T10:00:00Z' }
]

// ==================== Data - Chapters ====================

const chapters: IChapter[] = [
  // Python入门 (subjectId=1)
  { id: 1, knowledgeSystemId: 1, knowledgeSystemName: 'Python入门', name: '第1章 Python初识与环境搭建', goal: '了解Python语言的基本概念并成功搭建开发环境', description: '本章将介绍Python语言的历史、特点和应用领域，帮助学习者建立对Python的初步认识。', sortOrder: 1, difficulty: '入门', sectionCount: 4 },
  { id: 2, knowledgeSystemId: 1, knowledgeSystemName: 'Python入门', name: '第2章 Python基础语法与数据类型', goal: '掌握Python程序的基本构成元素和核心语法规则', description: '本章将深入讲解Python代码的书写规范，包括缩进、注释。', sortOrder: 2, difficulty: '入门', sectionCount: 5 },
  { id: 3, knowledgeSystemId: 1, knowledgeSystemName: 'Python入门', name: '第3章 程序控制结构', goal: '学会使用条件判断和循环来控制程序的执行流程', description: '本章将介绍如何让程序根据不同的条件做出决策。', sortOrder: 3, difficulty: '基础', sectionCount: 5 },
  { id: 4, knowledgeSystemId: 1, knowledgeSystemName: 'Python入门', name: '第4章 常用数据结构', goal: '理解并使用列表、元组、字典和集合来组织和管理数据', description: '本章将介绍Python中四种强大的内置数据结构。', sortOrder: 4, difficulty: '基础', sectionCount: 5 },
  { id: 5, knowledgeSystemId: 1, knowledgeSystemName: 'Python入门', name: '第5章 函数与代码复用', goal: '掌握定义和调用函数来封装代码逻辑', description: '本章将引导你学习如何将一段完成特定功能的代码封装成函数。', sortOrder: 5, difficulty: '进阶', sectionCount: 5 },
  // C++入门 (subjectId=2)
  { id: 6, knowledgeSystemId: 2, knowledgeSystemName: 'C++入门', name: '第1章 C++初识', goal: '了解C++语言的基本概念', description: '本章介绍C++的历史、特点和应用领域。', sortOrder: 1, difficulty: '入门', sectionCount: 4 },
  { id: 7, knowledgeSystemId: 2, knowledgeSystemName: 'C++入门', name: '第2章 基础语法', goal: '掌握C++程序的基本构成元素', description: '本章讲解C++的变量、数据类型和运算符。', sortOrder: 2, difficulty: '入门', sectionCount: 4 },
  { id: 8, knowledgeSystemId: 2, knowledgeSystemName: 'C++入门', name: '第3章 面向对象', goal: '理解类和对象的概念', description: '本章介绍面向对象编程的核心概念。', sortOrder: 3, difficulty: '基础', sectionCount: 4 },
  { id: 9, knowledgeSystemId: 2, knowledgeSystemName: 'C++入门', name: '第4章 STL标准库', goal: '掌握STL容器和算法的使用', description: '本章讲解vector、map等常用容器。', sortOrder: 4, difficulty: '进阶', sectionCount: 4 },
  // Java基础 (subjectId=3)
  { id: 13, knowledgeSystemId: 3, knowledgeSystemName: 'Java基础', name: '第1章 Java初识', goal: '了解Java语言的基本概念', description: '本章介绍Java的历史、特点和应用领域。', sortOrder: 1, difficulty: '入门', sectionCount: 4 },
  { id: 14, knowledgeSystemId: 3, knowledgeSystemName: 'Java基础', name: '第2章 面向对象编程', goal: '掌握类和对象的核心概念', description: '本章讲解封装、继承、多态等OOP特性。', sortOrder: 2, difficulty: '基础', sectionCount: 4 },
  // 计算机组成原理 (subjectId=4)
  { id: 10, knowledgeSystemId: 4, knowledgeSystemName: '计算机组成原理', name: '第1章 计算机系统概述', goal: '了解计算机系统的基本组成', description: '本章介绍计算机的五大组成部分。', sortOrder: 1, difficulty: '入门', sectionCount: 4 },
  { id: 11, knowledgeSystemId: 4, knowledgeSystemName: '计算机组成原理', name: '第2章 数据表示与运算', goal: '掌握计算机中的数据表示方法', description: '本章讲解原码、反码、补码等概念。', sortOrder: 2, difficulty: '进阶', sectionCount: 4 },
  { id: 12, knowledgeSystemId: 4, knowledgeSystemName: '计算机组成原理', name: '第3章 指令系统', goal: '理解计算机指令的格式和寻址方式', description: '本章介绍指令格式和常见寻址方式。', sortOrder: 3, difficulty: '进阶', sectionCount: 4 },
  // 人工智能导论 (subjectId=5)
  { id: 15, knowledgeSystemId: 5, knowledgeSystemName: '人工智能导论', name: '第1章 AI概述', goal: '了解人工智能的基本概念', description: '本章介绍AI的定义、历史和应用。', sortOrder: 1, difficulty: '入门', sectionCount: 3 },
  { id: 16, knowledgeSystemId: 5, knowledgeSystemName: '人工智能导论', name: '第2章 机器学习基础', goal: '掌握机器学习的基本原理', description: '本章讲解监督学习、无监督学习等概念。', sortOrder: 2, difficulty: '基础', sectionCount: 3 },
]

// ==================== Data - Sections ====================

const sampleHtml = `<div class="section" style="font-family: Inter, sans-serif; padding: 24px; background: #FFFBEB;">
  <h1 style="color: #292524; font-size: 22px; font-weight: bold; margin-bottom: 16px;">选择开发工具</h1>
  <p style="color: #78716C; font-size: 14px; line-height: 1.8; margin-bottom: 16px;">
    对于初学者来说，选择合适的开发工具非常重要。好的编辑器能让代码编写事半功倍，帮助你更快地进入编程世界。
  </p>
  <div style="background: #FEF3C7; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
    <p style="color: #D4916E; font-size: 13px; text-align: center;">[图片展示区域]</p>
  </div>
  <h2 style="color: #292524; font-size: 16px; font-weight: 600; margin-bottom: 12px;">推荐工具</h2>
  <ul style="color: #78716C; font-size: 14px; line-height: 2;">
    <li>Thonny - 专为初学者设计的轻量Python IDE</li>
    <li>PyCharm Community - JetBrains出品的免费Python IDE</li>
    <li>VS Code - 微软免费编辑器，插件生态丰富</li>
  </ul>
</div>`

const sections: ISection[] = [
  { id: 1, chapterId: 1, chapterName: '第1章 Python初识与环境搭建', title: '1.1 Python语言简介', knowledgePoint: '了解Python是一种解释型、面向对象的高级程序设计语言及其应用领域', sortOrder: 1, htmlContent: '', htmlUrl: '', imageDesigns: '', createdAt: '2026-05-01T08:00:00Z', updatedAt: '2026-05-01T08:00:00Z' },
  { id: 2, chapterId: 1, chapterName: '第1章 Python初识与环境搭建', title: '1.2 安装Python解释器', knowledgePoint: '学习在Windows或macOS操作系统上下载并安装Python解释器', sortOrder: 2, htmlContent: '', htmlUrl: '', imageDesigns: '', createdAt: '2026-05-01T08:00:00Z', updatedAt: '2026-05-01T08:00:00Z' },
  { id: 3, chapterId: 1, chapterName: '第1章 Python初识与环境搭建', title: '1.3 选择开发工具', knowledgePoint: '认识并选择适合初学者的Python代码编辑器或集成开发环境', sortOrder: 3, htmlContent: sampleHtml, htmlUrl: '', imageDesigns: '{"image":"editor comparison illustration for python beginners, warm orange theme"}', createdAt: '2026-05-01T08:00:00Z', updatedAt: '2026-05-15T10:00:00Z' },
  { id: 4, chapterId: 1, chapterName: '第1章 Python初识与环境搭建', title: '1.4 编写并运行第一个程序', knowledgePoint: '学习创建一个Python脚本文件并运行Hello World程序', sortOrder: 4, htmlContent: '', htmlUrl: '', imageDesigns: '', createdAt: '2026-05-01T08:00:00Z', updatedAt: '2026-05-01T08:00:00Z' },
  { id: 5, chapterId: 2, chapterName: '第2章 Python基础语法与数据类型', title: '2.1 代码规范：缩进与注释', knowledgePoint: '理解Python使用缩进来定义代码块以及如何使用#添加注释', sortOrder: 1, htmlContent: '', htmlUrl: '', imageDesigns: '', createdAt: '2026-05-02T08:00:00Z', updatedAt: '2026-05-02T08:00:00Z' },
  { id: 6, chapterId: 2, chapterName: '第2章 Python基础语法与数据类型', title: '2.2 变量与赋值', knowledgePoint: '学习如何创建变量并使用赋值运算符将数据存储到变量中', sortOrder: 2, htmlContent: '', htmlUrl: '', imageDesigns: '', createdAt: '2026-05-02T08:00:00Z', updatedAt: '2026-05-02T08:00:00Z' },
  { id: 9, chapterId: 3, chapterName: '第3章 程序控制结构', title: '3.1 条件判断：if语句', knowledgePoint: '学习使用if关键字根据条件是否为真来决定是否执行一段代码', sortOrder: 1, htmlContent: '', htmlUrl: '', imageDesigns: '', createdAt: '2026-05-03T08:00:00Z', updatedAt: '2026-05-03T08:00:00Z' },
  { id: 10, chapterId: 3, chapterName: '第3章 程序控制结构', title: '3.2 多分支判断：if-elif-else结构', knowledgePoint: '掌握使用if、elif和else组合来处理多个可能条件的情况', sortOrder: 2, htmlContent: '', htmlUrl: '', imageDesigns: '', createdAt: '2026-05-03T08:00:00Z', updatedAt: '2026-05-03T08:00:00Z' },
  { id: 11, chapterId: 3, chapterName: '第3章 程序控制结构', title: '3.3 循环结构：for循环', knowledgePoint: '学习使用for循环来遍历一个序列中的每个元素', sortOrder: 3, htmlContent: sampleHtml, htmlUrl: '', imageDesigns: '{"image":"python for loop illustration, warm orange theme"}', createdAt: '2026-05-03T08:00:00Z', updatedAt: '2026-05-15T10:00:00Z' },
  { id: 12, chapterId: 9, chapterName: '第1章 HTML基础', title: '1.1 HTML文档结构', knowledgePoint: '掌握HTML5文档的基本结构DOCTYPE、html、head、body标签', sortOrder: 1, htmlContent: sampleHtml, htmlUrl: '', imageDesigns: '{"image":"html document structure diagram"}', createdAt: '2026-05-10T08:00:00Z', updatedAt: '2026-05-10T10:00:00Z' },
  { id: 13, chapterId: 10, chapterName: '第1章 什么是人工智能', title: '1.1 AI的基本概念', knowledgePoint: '理解人工智能的定义、图灵测试和弱AI与强AI的区别', sortOrder: 1, htmlContent: sampleHtml, htmlUrl: '', imageDesigns: '{"image":"AI concept illustration"}', createdAt: '2026-04-01T08:00:00Z', updatedAt: '2026-04-05T10:00:00Z' },
  { id: 7, chapterId: 6, chapterName: '第1章 计算机概述', title: '1.1 计算机的定义', knowledgePoint: '理解计算机的基本概念和核心功能', sortOrder: 1, htmlContent: '', htmlUrl: '', imageDesigns: '', createdAt: '2026-04-15T08:00:00Z', updatedAt: '2026-04-15T08:00:00Z' },
  { id: 8, chapterId: 6, chapterName: '第1章 计算机概述', title: '1.2 计算机的发展历程', knowledgePoint: '了解计算机从电子管到大规模集成电路的演变过程', sortOrder: 2, htmlContent: '', htmlUrl: '', imageDesigns: '', createdAt: '2026-04-15T08:00:00Z', updatedAt: '2026-04-15T08:00:00Z' }
]

// ==================== Mock Functions ====================

export const knowledgeMock = {
  // ---------- Category CRUD ----------

  async getCategories(params?: { status?: string; keyword?: string }) {
    await delay(300)
    let list = [...categories]
    if (params?.status && params.status !== '全部') {
      list = list.filter((c) => c.status === params.status)
    }
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase()
      list = list.filter((c) => c.name.toLowerCase().includes(kw))
    }
    return success(list.sort((a, b) => a.sortOrder - b.sortOrder))
  },

  async getCategory(id: number) {
    await delay(300)
    const cat = categories.find((c) => c.id === id)
    if (!cat) {
      const now = new Date().toISOString()
      return success({
        id, name: `分类 ${id}`, icon: '📁', description: '', sortOrder: 1,
        subjectCount: 0, status: '草稿', createdAt: now, updatedAt: now, subjects: []
      })
    }
    const subjs = subjects
      .filter((s) => s.categoryId === id)
      .map((s) => ({
        id: s.id,
        name: s.name,
        icon: s.icon || null,
        difficulty: s.difficulty,
        sortOrder: s.sortOrder,
        status: s.status === '展示' ? 'published' : s.status === '草稿' ? 'draft' : 'inactive',
      }))
    return success({ ...cat, subjects: subjs })
  },

  async createCategory(data: { name: string; icon?: string; description?: string }) {
    await delay(400)
    const now = new Date().toISOString()
    const cat: ICategory = {
      id: randomId(),
      name: data.name,
      icon: data.icon || '📁',
      description: data.description || '',
      sortOrder: categories.length + 1,
      subjectCount: 0,
      status: '草稿',
      createdAt: now,
      updatedAt: now
    }
    categories.push(cat)
    return success(cat)
  },

  async updateCategory(id: number, data: Partial<ICategory>) {
    await delay(400)
    const cat = categories.find((c) => c.id === id)
    if (!cat) return fail('分类不存在')
    Object.assign(cat, data, { updatedAt: new Date().toISOString() })
    return success(cat)
  },

  async deleteCategory(id: number) {
    await delay(400)
    const idx = categories.findIndex((c) => c.id === id)
    if (idx === -1) return fail('分类不存在')
    categories.splice(idx, 1)
    return success(null, '删除成功')
  },

  async showCategory(id: number) {
    await delay(300)
    const cat = categories.find((c) => c.id === id)
    if (!cat) return fail('分类不存在')
    cat.status = '展示'
    cat.updatedAt = new Date().toISOString()
    return success(cat)
  },

  async hideCategory(id: number) {
    await delay(300)
    const cat = categories.find((c) => c.id === id)
    if (!cat) return fail('分类不存在')
    cat.status = '隐藏'
    cat.updatedAt = new Date().toISOString()
    return success(cat)
  },

  // ---------- Subject CRUD ----------

  async getSubjects(params?: { categoryId?: number; status?: string; keyword?: string }) {
    await delay(300)
    let list = [...subjects]
    if (params?.categoryId) {
      list = list.filter((s) => s.categoryId === params.categoryId)
    }
    if (params?.status && params.status !== '全部') {
      list = list.filter((s) => s.status === params.status)
    }
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(kw))
    }
    return success(list.sort((a, b) => a.sortOrder - b.sortOrder))
  },

  async getSubject(id: number) {
    await delay(300)
    const sub = subjects.find((s) => s.id === id)
    if (!sub) return fail('学科不存在')
    return success({ ...sub })
  },

  async createSubject(data: { categoryId: number; name: string; icon?: string; difficulty: string }) {
    await delay(400)
    const now = new Date().toISOString()
    const sub: ISubject = {
      id: randomId(),
      categoryId: data.categoryId,
      name: data.name,
      icon: data.icon || '📁',
      difficulty: data.difficulty || '入门',
      sortOrder: subjects.length + 1,
      chapterCount: 0,
      lessonCount: 0,
      status: '草稿',
      createdAt: now,
      updatedAt: now
    }
    subjects.push(sub)
    const cat = categories.find((c) => c.id === sub.categoryId)
    if (cat) cat.subjectCount++
    return success(sub)
  },

  async updateSubject(id: number, data: Partial<ISubject>) {
    await delay(400)
    const sub = subjects.find((s) => s.id === id)
    if (!sub) return fail('学科不存在')
    Object.assign(sub, data, { updatedAt: new Date().toISOString() })
    return success(sub)
  },

  async deleteSubject(id: number) {
    await delay(400)
    const idx = subjects.findIndex((s) => s.id === id)
    if (idx === -1) return fail('学科不存在')
    const sub = subjects[idx]
    subjects.splice(idx, 1)
    const cat = categories.find((c) => c.id === sub.categoryId)
    if (cat) cat.subjectCount--
    return success(null, '删除成功')
  },

  async showSubject(id: number) {
    await delay(300)
    const sub = subjects.find((s) => s.id === id)
    if (!sub) return fail('学科不存在')
    sub.status = '展示'
    sub.updatedAt = new Date().toISOString()
    return success(sub)
  },

  async hideSubject(id: number) {
    await delay(300)
    const sub = subjects.find((s) => s.id === id)
    if (!sub) return fail('学科不存在')
    sub.status = '隐藏'
    sub.updatedAt = new Date().toISOString()
    return success(sub)
  },

  // ---------- Chapter CRUD ----------

  async getChapters(subjectId?: number | string) {
    await delay(300)
    const list = subjectId
      ? chapters.filter((ch) => ch.knowledgeSystemId === Number(subjectId))
      : [...chapters]
    return success(list.sort((a, b) => a.sortOrder - b.sortOrder))
  },

  async createChapter(data: {
    knowledgeSystemId: number
    knowledgeSystemName: string
    name: string
    goal: string
    description: string
    sortOrder: number
    difficulty: string
  }) {
    await delay(400)
    const ch: IChapter = {
      id: randomId(),
      knowledgeSystemId: data.knowledgeSystemId,
      knowledgeSystemName: data.knowledgeSystemName || '',
      name: data.name,
      goal: data.goal || '',
      description: data.description || '',
      sortOrder: data.sortOrder || 1,
      difficulty: data.difficulty || '入门',
      sectionCount: 0
    }
    chapters.push(ch)
    const sub = subjects.find((s) => s.id === ch.knowledgeSystemId)
    if (sub) sub.chapterCount++
    return success(ch)
  },
  async updateChapter(id: number, data: Partial<IChapter>) {
    await delay(400)
    const ch = chapters.find((c) => c.id === id)
    if (!ch) return fail('章节不存在')
    Object.assign(ch, data)
    return success(ch)
  },

  async deleteChapter(id: number) {
    await delay(400)
    const idx = chapters.findIndex((c) => c.id === id)
    if (idx === -1) return fail('章节不存在')
    const ch = chapters[idx]
    chapters.splice(idx, 1)
    const sub = subjects.find((s) => s.id === ch.knowledgeSystemId)
    if (sub) sub.chapterCount--
    return success(null, '删除成功')
  },

  // ---------- Section CRUD ----------

  async getSections(chapterId?: number | string) {
    await delay(300)
    const list = chapterId
      ? sections.filter((s) => s.chapterId === Number(chapterId))
      : [...sections]
    return success(list.sort((a, b) => a.sortOrder - b.sortOrder))
  },

  async getSection(id: number) {
    await delay(300)
    const section = sections.find((s) => s.id === id)
    if (!section) {
      const now = new Date().toISOString()
      return success({
        id, chapterId: 0, chapterName: '',
        title: `小节 ${id}`, knowledgePoint: '',
        sortOrder: 1, htmlContent: '', htmlUrl: '',
        latestHtmlContent: '', imageDesigns: '',
        createdAt: now, updatedAt: now
      })
    }
    return success({ ...section })
  },

  async createSection(data: {
    chapterId: number
    chapterName: string
    title: string
    knowledgePoint: string
    sortOrder: number
  }) {
    await delay(400)
    const now = new Date().toISOString()
    const sec: ISection = {
      id: randomId(),
      chapterId: data.chapterId,
      chapterName: data.chapterName || '',
      title: data.title,
      knowledgePoint: data.knowledgePoint || '',
      sortOrder: data.sortOrder || 1,
      htmlContent: '',
      htmlUrl: '',
      latestHtmlContent: '',
      imageDesigns: '',
      createdAt: now,
      updatedAt: now
    }
    sections.push(sec)
    const ch = chapters.find((c) => c.id === sec.chapterId)
    if (ch) ch.sectionCount++
    const sub = subjects.find((s) => s.id === ch?.knowledgeSystemId)
    if (sub) sub.lessonCount++
    return success(sec)
  },

  async updateSection(id: number, data: Partial<ISection>) {
    await delay(400)
    const idx = sections.findIndex((s) => s.id === id)
    if (idx === -1) return fail('小节不存在')
    sections[idx] = { ...sections[idx], ...data, updatedAt: new Date().toISOString() }
    return success(sections[idx])
  },

  async deleteSection(id: number) {
    await delay(400)
    const idx = sections.findIndex((s) => s.id === id)
    if (idx === -1) return fail('小节不存在')
    const sec = sections[idx]
    sections.splice(idx, 1)
    const ch = chapters.find((c) => c.id === sec.chapterId)
    if (ch) ch.sectionCount--
    if (ch) {
      const sub = subjects.find((s) => s.id === ch.knowledgeSystemId)
      if (sub) sub.lessonCount--
    }
    return success(null, '删除成功')
  },

  async saveSectionHtml(id: number, htmlContent: string) {
    await delay(300)
    const idx = sections.findIndex((s) => s.id === id)
    if (idx === -1) return fail('小节不存在')
    const htmlUrl = `/api/v1/knowledge/sections/${id}/html`
    sections[idx] = { ...sections[idx], htmlContent, htmlUrl, latestHtmlContent: htmlContent, updatedAt: new Date().toISOString() }
    return success(sections[idx])
  },

  // ---------- AI Workflows ----------

  async generateOutline(name: string) {
    await delay(1500)
    const chNames = [
      `${name}初识与环境搭建`,
      `${name}基础语法与数据类型`,
      `${name}核心编程概念`,
      `${name}进阶技术与应用`
    ]
    const generatedChapters = chNames.map((cn, i) => ({
      id: randomId() + i,
      name: `第${i + 1}章 ${cn}`,
      goal: `掌握${cn}的核心知识`,
      description: `本章将系统讲解${cn}的相关内容。`,
      sortOrder: i + 1,
      difficulty: i === 0 ? '入门' : i < 3 ? '基础' : '进阶',
      sections: [
        { title: `${cn}（一）`, knowledgePoint: `理解${cn}的基本概念` },
        { title: `${cn}（二）`, knowledgePoint: `掌握${cn}的关键技术` },
        { title: `${cn}（三）`, knowledgePoint: `${cn}的实践与应用` }
      ]
    }))
    return success({
      chapters: generatedChapters,
      topic: name
    })
  },

  async generateSectionContent(params: { chapter: string; section: string; knowledgePoint: string }) {
    await delay(2000)
    const html = `<div class="section" style="font-family: Inter, sans-serif; padding: 24px; background: #FFFBEB;">
  <h1 style="color: #292524; font-size: 22px; font-weight: bold; margin-bottom: 16px;">${params.section}</h1>
  <p style="color: #78716C; font-size: 14px; line-height: 1.8; margin-bottom: 16px;">
    ${params.knowledgePoint}
  </p>
  <div style="background: linear-gradient(135deg, #F97316, #FBBF24); border-radius: 12px; padding: 24px; margin-bottom: 16px; text-align: center;">
    <span style="color: #FFFFFF; font-size: 48px;">📚</span>
    <p style="color: #FFFFFF; font-size: 14px; margin-top: 8px;">${params.chapter}</p>
  </div>
  <h2 style="color: #292524; font-size: 16px; font-weight: 600; margin-bottom: 12px;">核心概念</h2>
  <p style="color: #78716C; font-size: 14px; line-height: 1.8; margin-bottom: 12px;">
    在学习${params.section}的过程中，需要理解其核心概念和实际应用场景。掌握这些知识将为你后续的学习打下坚实基础。
  </p>
  <div style="background: #FFFFFF; border-radius: 8px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <p style="color: #292524; font-size: 14px; font-weight: 600; margin-bottom: 8px;">💡 学习要点</p>
    <ul style="color: #78716C; font-size: 13px; line-height: 2; padding-left: 20px;">
      <li>理解${params.section}的基本定义和核心原理</li>
      <li>掌握实际开发中的常用方法和技巧</li>
      <li>了解常见误区及其解决方案</li>
    </ul>
  </div>
</div>`
    return success({
      section_html: html,
      new_blk_designs: `{"images":[{"prompt":"illustration for ${params.knowledgePoint}, warm orange gradient theme, educational style"}]}`
    })
  },

  async regenerateImage(prompt: string) {
    await delay(1000)
    return success({
      url: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_16_9`
    })
  },

  // ---------- ColorScheme ----------

  colorSchemes: [
    {
      id: 'default-bluegreen',
      schema: '知小记设计系统 · 配色方案 V1.0',
      theme: '清新蓝绿（默认主题）',
      description: '清新、专注、知性，适合知识学习场景。以靛蓝为主色调，搭配青色为辅助色，营造安静、专业的沉浸式学习氛围。',
      colors: {
        primary: { hex: '#4F46E5', rgba: 'rgba(79, 70, 229, 1)', name: 'Primary · 主色', usage: '按钮、选中状态、重点标记' },
        secondary: { hex: '#06B6D4', rgba: 'rgba(6, 182, 212, 1)', name: 'Secondary · 辅助色', usage: '次级按钮、标签、图标' },
        success: { hex: '#10B981', rgba: 'rgba(16, 185, 129, 1)', name: 'Success · 成功色', usage: '成功状态、通过标识' },
        warning: { hex: '#F59E0B', rgba: 'rgba(245, 158, 11, 1)', name: 'Warning · 警告色', usage: '警告提示、待办事项' },
        error: { hex: '#EF4444', rgba: 'rgba(239, 68, 68, 1)', name: 'Error · 错误色', usage: '错误状态、删除操作' },
      },
      neutrals: {
        background: { hex: '#F8FAFC', rgba: 'rgba(248, 250, 252, 1)', name: 'Background · 背景色', usage: '页面背景' },
        card: { hex: '#FFFFFF', rgba: 'rgba(255, 255, 255, 1)', name: 'Card · 卡片色', usage: '卡片背景' },
        textPrimary: { hex: '#1E293B', rgba: 'rgba(30, 41, 59, 1)', name: 'Text Primary · 文字主色', usage: '标题、正文' },
        textSecondary: { hex: '#64748B', rgba: 'rgba(100, 116, 139, 1)', name: 'Text Secondary · 文字次色', usage: '辅助文字、描述' },
        divider: { hex: '#E2E8F0', rgba: 'rgba(226, 232, 240, 1)', name: 'Divider · 分割线', usage: '分割线、边框' },
        purpleLight: { hex: '#EEF2FF', rgba: 'rgba(238, 242, 255, 1)', name: 'Purple Light · 紫色浅底', usage: '背景渐变浅色端' },
      },
      gradients: {
        primaryGradient: { name: '主渐变', css: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' },
        backgroundGradient: { name: '背景渐变', css: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)' },
      },
      shadows: { cardShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)' },
      applicationExamples: {
        buttons: {
          primary: { bg: '#4F46E5', text: '#FFFFFF', label: '主要按钮' },
          success: { bg: '#10B981', text: '#FFFFFF', label: '成功按钮' },
          warning: { bg: '#F59E0B', text: '#FFFFFF', label: '警告按钮' },
        },
        tags: {
          primaryTag: { bg: '#4F46E5', text: '#FFFFFF', label: 'JavaScript' },
          secondaryTag: { bg: '#06B6D4', text: '#FFFFFF', label: '编程语言' },
          successTag: { bg: '#10B981', text: '#FFFFFF', label: '已完成' },
          warningTag: { bg: '#F59E0B', text: '#FFFFFF', label: '待复习' },
        },
        textHierarchy: {
          title: { color: '#1E293B', text: '这是标题文字' },
          description: { color: '#64748B', text: '这是辅助说明文字' },
          divider: { color: '#E2E8F0', text: '分割线' },
        },
      },
      meta: { footer: '知小记设计系统 · 配色方案 V1.0 · 清新蓝绿', totalColors: 11, totalGradients: 2 },
      workflowInput: {
        primary: { hex: '#4F46E5', rgba: 'rgba(79, 70, 229, 1)' },
        secondary: { hex: '#06B6D4', rgba: 'rgba(6, 182, 212, 1)' },
        success: { hex: '#10B981', rgba: 'rgba(16, 185, 129, 1)' },
        warning: { hex: '#F59E0B', rgba: 'rgba(245, 158, 11, 1)' },
        error: { hex: '#EF4444', rgba: 'rgba(239, 68, 68, 1)' },
        background: { hex: '#F8FAFC', rgba: 'rgba(248, 250, 252, 1)' },
        card: { hex: '#FFFFFF', rgba: 'rgba(255, 255, 255, 1)' },
        textPrimary: { hex: '#1E293B', rgba: 'rgba(30, 41, 59, 1)' },
        textSecondary: { hex: '#64748B', rgba: 'rgba(100, 116, 139, 1)' },
        divider: { hex: '#E2E8F0', rgba: 'rgba(226, 232, 240, 1)' },
        primaryGradient: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
        backgroundGradient: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)',
        cardShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
      },
      isDefault: true,
      createdAt: '2026-05-01T08:00:00Z',
      updatedAt: '2026-05-15T10:00:00Z',
    },
    {
      id: 'theme-warm-orange',
      schema: '知小记设计系统 · 配色方案 V1.0',
      theme: '温暖橙黄（活力主题）',
      description: '温暖、活力、亲和，适合轻松学习氛围。以橙红色为主色调，搭配明黄为辅助色，营造温暖积极的学习氛围，激发学习动力。',
      colors: {
        primary: { hex: '#F97316', rgba: 'rgba(249, 115, 22, 1)', name: 'Primary · 主色', usage: '按钮、选中状态、重点标记' },
        secondary: { hex: '#FBBF24', rgba: 'rgba(251, 191, 36, 1)', name: 'Secondary · 辅助色', usage: '次级按钮、标签、图标' },
        success: { hex: '#22C55E', rgba: 'rgba(34, 197, 94, 1)', name: 'Success · 成功色', usage: '成功状态、通过标识' },
        warning: { hex: '#EAB308', rgba: 'rgba(234, 179, 8, 1)', name: 'Warning · 警告色', usage: '警告提示、待办事项' },
        error: { hex: '#DC2626', rgba: 'rgba(220, 38, 38, 1)', name: 'Error · 错误色', usage: '错误状态、删除操作' },
      },
      neutrals: {
        background: { hex: '#FFFBEB', rgba: 'rgba(255, 251, 235, 1)', name: 'Background · 背景色', usage: '页面背景' },
        card: { hex: '#FFFFFF', rgba: 'rgba(255, 255, 255, 1)', name: 'Card · 卡片色', usage: '卡片背景' },
        textPrimary: { hex: '#292524', rgba: 'rgba(41, 37, 36, 1)', name: 'Text Primary · 文字主色', usage: '标题、正文' },
        textSecondary: { hex: '#78716C', rgba: 'rgba(120, 113, 108, 1)', name: 'Text Secondary · 文字次色', usage: '辅助文字、描述' },
        divider: { hex: '#E7E5E4', rgba: 'rgba(231, 229, 228, 1)', name: 'Divider · 分割线', usage: '分割线、边框' },
        warmLight: { hex: '#FEF3C7', rgba: 'rgba(254, 243, 199, 1)', name: 'Warm Yellow · 暖黄底', usage: '背景渐变浅色端' },
      },
      gradients: {
        primaryGradient: { name: '主渐变', css: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)' },
        backgroundGradient: { name: '背景渐变', css: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)' },
      },
      shadows: { cardShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)' },
      applicationExamples: {
        buttons: {
          primary: { bg: '#F97316', text: '#FFFFFF', label: '主要按钮' },
          success: { bg: '#22C55E', text: '#FFFFFF', label: '成功按钮' },
          warning: { bg: '#EAB308', text: '#FFFFFF', label: '警告按钮' },
        },
        tags: {
          primaryTag: { bg: '#F97316', text: '#FFFFFF', label: 'JavaScript' },
          secondaryTag: { bg: '#FBBF24', text: '#292524', label: '编程语言' },
          successTag: { bg: '#22C55E', text: '#FFFFFF', label: '已完成' },
          warningTag: { bg: '#EAB308', text: '#292524', label: '待复习' },
        },
        textHierarchy: {
          title: { color: '#292524', text: '这是标题文字' },
          description: { color: '#78716C', text: '这是辅助说明文字' },
          divider: { color: '#E7E5E4', text: '分割线' },
        },
      },
      meta: { footer: '知小记设计系统 · 配色方案 V1.0 · 温暖橙黄', totalColors: 11, totalGradients: 2 },
      workflowInput: {
        primary: { hex: '#F97316', rgba: 'rgba(249, 115, 22, 1)' },
        secondary: { hex: '#FBBF24', rgba: 'rgba(251, 191, 36, 1)' },
        success: { hex: '#22C55E', rgba: 'rgba(34, 197, 94, 1)' },
        warning: { hex: '#EAB308', rgba: 'rgba(234, 179, 8, 1)' },
        error: { hex: '#DC2626', rgba: 'rgba(220, 38, 38, 1)' },
        background: { hex: '#FFFBEB', rgba: 'rgba(255, 251, 235, 1)' },
        card: { hex: '#FFFFFF', rgba: 'rgba(255, 255, 255, 1)' },
        textPrimary: { hex: '#292524', rgba: 'rgba(41, 37, 36, 1)' },
        textSecondary: { hex: '#78716C', rgba: 'rgba(120, 113, 108, 1)' },
        divider: { hex: '#E7E5E4', rgba: 'rgba(231, 229, 228, 1)' },
        primaryGradient: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)',
        backgroundGradient: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)',
        cardShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
      },
      isDefault: false,
      createdAt: '2026-05-20T08:00:00Z',
      updatedAt: '2026-05-20T10:00:00Z',
    },
    {
      id: 'theme-dark-purple',
      schema: '知小记设计系统 · 配色方案 V1.0',
      theme: '深邃紫靛（深色主题）',
      description: '深邃、专业、沉浸，适合夜间学习和专注模式。以淡紫为明亮主色，搭配紫罗兰辅助色，在暗色背景上营造静谧专注的沉浸式学习体验。',
      colors: {
        primary: { hex: '#818CF8', rgba: 'rgba(129, 140, 248, 1)', name: 'Primary · 主色', usage: '按钮、选中状态、重点标记' },
        secondary: { hex: '#C084FC', rgba: 'rgba(192, 132, 252, 1)', name: 'Secondary · 辅助色', usage: '次级按钮、标签、图标' },
        success: { hex: '#34D399', rgba: 'rgba(52, 211, 153, 1)', name: 'Success · 成功色', usage: '成功状态、通过标识' },
        warning: { hex: '#FBBF24', rgba: 'rgba(251, 191, 36, 1)', name: 'Warning · 警告色', usage: '警告提示、待办事项' },
        error: { hex: '#F87171', rgba: 'rgba(248, 113, 113, 1)', name: 'Error · 错误色', usage: '错误状态、删除操作' },
      },
      neutrals: {
        background: { hex: '#0F172A', rgba: 'rgba(15, 23, 42, 1)', name: 'Background · 背景色', usage: '页面背景' },
        card: { hex: '#1E293B', rgba: 'rgba(30, 41, 59, 1)', name: 'Card · 卡片色', usage: '卡片背景' },
        textPrimary: { hex: '#F1F5F9', rgba: 'rgba(241, 245, 249, 1)', name: 'Text Primary · 文字主色', usage: '标题、正文' },
        textSecondary: { hex: '#94A3B8', rgba: 'rgba(148, 163, 184, 1)', name: 'Text Secondary · 文字次色', usage: '辅助文字、描述' },
        divider: { hex: '#334155', rgba: 'rgba(51, 65, 85, 1)', name: 'Divider · 分割线', usage: '分割线、边框' },
        deepPurple: { hex: '#1E1B4B', rgba: 'rgba(30, 27, 75, 1)', name: 'Deep Purple · 深紫底', usage: '背景渐变深色端' },
      },
      gradients: {
        primaryGradient: { name: '主渐变', css: 'linear-gradient(135deg, #818CF8 0%, #C084FC 100%)' },
        backgroundGradient: { name: '背景渐变', css: 'linear-gradient(180deg, #0F172A 0%, #1E1B4B 100%)' },
      },
      shadows: { cardShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)' },
      applicationExamples: {
        buttons: {
          primary: { bg: '#818CF8', text: '#0F172A', label: '主要按钮' },
          success: { bg: '#34D399', text: '#0F172A', label: '成功按钮' },
          warning: { bg: '#FBBF24', text: '#0F172A', label: '警告按钮' },
        },
        tags: {
          primaryTag: { bg: '#818CF8', text: '#0F172A', label: 'JavaScript' },
          secondaryTag: { bg: '#C084FC', text: '#0F172A', label: '编程语言' },
          successTag: { bg: '#34D399', text: '#0F172A', label: '已完成' },
          warningTag: { bg: '#FBBF24', text: '#0F172A', label: '待复习' },
        },
        textHierarchy: {
          title: { color: '#F1F5F9', text: '这是标题文字' },
          description: { color: '#94A3B8', text: '这是辅助说明文字' },
          divider: { color: '#334155', text: '分割线' },
        },
      },
      meta: { footer: '知小记设计系统 · 配色方案 V1.0 · 深邃紫靛', totalColors: 11, totalGradients: 2 },
      workflowInput: {
        primary: { hex: '#818CF8', rgba: 'rgba(129, 140, 248, 1)' },
        secondary: { hex: '#C084FC', rgba: 'rgba(192, 132, 252, 1)' },
        success: { hex: '#34D399', rgba: 'rgba(52, 211, 153, 1)' },
        warning: { hex: '#FBBF24', rgba: 'rgba(251, 191, 36, 1)' },
        error: { hex: '#F87171', rgba: 'rgba(248, 113, 113, 1)' },
        background: { hex: '#0F172A', rgba: 'rgba(15, 23, 42, 1)' },
        card: { hex: '#1E293B', rgba: 'rgba(30, 41, 59, 1)' },
        textPrimary: { hex: '#F1F5F9', rgba: 'rgba(241, 245, 249, 1)' },
        textSecondary: { hex: '#94A3B8', rgba: 'rgba(148, 163, 184, 1)' },
        divider: { hex: '#334155', rgba: 'rgba(51, 65, 85, 1)' },
        primaryGradient: 'linear-gradient(135deg, #818CF8 0%, #C084FC 100%)',
        backgroundGradient: 'linear-gradient(180deg, #0F172A 0%, #1E1B4B 100%)',
        cardShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
      },
      isDefault: false,
      createdAt: '2026-05-25T08:00:00Z',
      updatedAt: '2026-05-25T10:00:00Z',
    },
  ],

  async listColorSchemes() {
    await delay(300)
    return success([...this.colorSchemes])
  },

  async getDefaultColorScheme() {
    await delay(200)
    const scheme = this.colorSchemes.find((s) => s.isDefault)
    return scheme ? success(scheme) : success(this.colorSchemes[0])
  },

  async getColorScheme(schemeId: string) {
    await delay(200)
    const scheme = this.colorSchemes.find((s) => s.id === schemeId)
    if (!scheme) return fail('配色方案不存在')
    return success(scheme)
  },

  async createColorScheme(data: Record<string, unknown>) {
    await delay(400)
    const scheme: ColorScheme = {
      id: `scheme-${randomId()}`,
      schema: (data.schema as string) || '',
      theme: (data.theme as string) || 'light',
      description: (data.description as string) || '',
      colors: data.colors as Record<string, ColorRef> || {},
      neutrals: data.neutrals as Record<string, ColorRef> || {},
      gradients: data.gradients as Record<string, GradientRef> || {},
      shadows: data.shadows as Record<string, string> || {},
      applicationExamples: data.applicationExamples !== undefined ? data.applicationExamples as Record<string, any> : null,
      meta: data.meta !== undefined ? data.meta as Record<string, any> : null,
      workflowInput: data.workflowInput as WorkflowInput || {} as WorkflowInput,
      isDefault: data.isDefault as boolean || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.colorSchemes.push(scheme as any)
    return success(scheme)
  },

  async updateColorScheme(schemeId: string, data: Record<string, unknown>) {
    await delay(300)
    const scheme = this.colorSchemes.find((s) => s.id === schemeId)
    if (!scheme) return fail('配色方案不存在')
    Object.assign(scheme, data, { updatedAt: new Date().toISOString() })
    return success(scheme)
  },

  async deleteColorScheme(schemeId: string) {
    await delay(200)
    const idx = this.colorSchemes.findIndex((s) => s.id === schemeId)
    if (idx === -1) return fail('配色方案不存在')
    this.colorSchemes.splice(idx, 1)
    return success(null, '删除成功')
  },

  // ---------- Legacy backward-compat ----------

  async reorderChapters(order: string[]) {
    await delay(200)
    return success(null, '排序已更新')
  },

  async reorderSections(chapterId: string, order: string[]) {
    await delay(200)
    return success(null, '排序已更新')
  },

  // Legacy aliases for backward compatibility
  async getKnowledgeSystems(params?: { status?: string; keyword?: string }) {
    return this.getCategories(params)
  },
  async getKnowledgeSystem(id: number) { return this.getCategory(id) },
  async createKnowledgeSystem(data: any) { return this.createCategory(data) },
  async updateKnowledgeSystem(id: number, data: any) { return this.updateCategory(id, data) },
  async deleteKnowledgeSystem(id: number) { return this.deleteCategory(id) },
  async hideKnowledgeSystem(id: number) { return this.hideCategory(id) },
  async showKnowledgeSystem(id: number) { return this.showCategory(id) },
  async cancelPendingDelete(id: number) {
    await delay(300)
    const cat = categories.find((c) => c.id === id)
    if (!cat) return fail('分类不存在')
    if (cat.status !== '删除等待中') return fail('当前状态不是删除等待中')
    cat.status = '隐藏'
    cat.updatedAt = new Date().toISOString()
    return success(cat)
  },
  async generateCategoryContent(name: string) { return knowledgeMock.generateOutline(name) }
}

// ==================== Named Exports ====================

// 兼容旧代码的 knowledgeSystems 引用
const knowledgeSystems = subjects

export { categories, subjects, knowledgeSystems, chapters, sections }
