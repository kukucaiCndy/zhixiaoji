import { success, delay, randomId } from './base'

const volumes = [
  { id: 1, name: '第一章：编程入门', sortOrder: 1, status: '已上架', chapterCount: 3 },
  { id: 2, name: '第二章：Web开发基础', sortOrder: 2, status: '已上架', chapterCount: 2 },
  { id: 3, name: '第三章：算法与数据结构', sortOrder: 3, status: '已上架', chapterCount: 2 },
  { id: 4, name: '第四章：AI入门', sortOrder: 4, status: '草稿', chapterCount: 0 }
]

const chapters = [
  { id: 1, volumeId: 1, volumeName: '第一章：编程入门', name: 'Python基础', sortOrder: 1, difficulty: '入门', needPoints: false, pointsRequired: 0, preChapterId: 0, preChapterName: '', status: '已上架', cardCount: 2 },
  { id: 2, volumeId: 1, volumeName: '第一章：编程入门', name: 'Python进阶', sortOrder: 2, difficulty: '基础', needPoints: true, pointsRequired: 100, preChapterId: 1, preChapterName: 'Python基础', status: '已上架', cardCount: 1 },
  { id: 3, volumeId: 1, volumeName: '第一章：编程入门', name: 'Python实战', sortOrder: 3, difficulty: '进阶', needPoints: true, pointsRequired: 200, preChapterId: 2, preChapterName: 'Python进阶', status: '草稿', cardCount: 0 },
  { id: 4, volumeId: 2, volumeName: '第二章：Web开发基础', name: 'JavaScript核心', sortOrder: 1, difficulty: '基础', needPoints: false, pointsRequired: 0, preChapterId: 0, preChapterName: '', status: '已上架', cardCount: 1 },
  { id: 5, volumeId: 2, volumeName: '第二章：Web开发基础', name: 'HTML/CSS基础', sortOrder: 2, difficulty: '入门', needPoints: false, pointsRequired: 0, preChapterId: 0, preChapterName: '', status: '已上架', cardCount: 2 },
  { id: 6, volumeId: 2, volumeName: '第二章：Web开发基础', name: '前端框架入门', sortOrder: 3, difficulty: '进阶', needPoints: true, pointsRequired: 150, preChapterId: 4, preChapterName: 'JavaScript核心', status: '已下架', cardCount: 0 },
  { id: 7, volumeId: 3, volumeName: '第三章：算法与数据结构', name: '算法入门', sortOrder: 1, difficulty: '基础', needPoints: true, pointsRequired: 100, preChapterId: 0, preChapterName: '', status: '已上架', cardCount: 2 },
  { id: 8, volumeId: 3, volumeName: '第三章：算法与数据结构', name: '数据结构', sortOrder: 2, difficulty: '进阶', needPoints: true, pointsRequired: 200, preChapterId: 7, preChapterName: '算法入门', status: '已上架', cardCount: 1 }
]

export const knowledgeMock = {
  async getVolumes() {
    await delay(300)
    return success(volumes)
  },

  async getChapters(volumeId?: number) {
    await delay(300)
    const list = volumeId ? chapters.filter((c) => c.volumeId === volumeId) : chapters
    return success(list)
  },

  async createVolume(data: { name: string; sortOrder: number; status: string }) {
    await delay(400)
    const vol = { id: randomId(), name: data.name, sortOrder: data.sortOrder, status: data.status, chapterCount: 0 }
    volumes.push(vol)
    return success(vol)
  },

  async updateVolume(id: number, data: { name: string; sortOrder: number; status: string }) {
    await delay(400)
    const vol = volumes.find((v) => v.id === id)
    if (!vol) return { code: -1, data: null, message: '篇章不存在' }
    Object.assign(vol, data)
    return success(vol)
  },

  async deleteVolume(id: number) {
    await delay(400)
    const idx = volumes.findIndex((v) => v.id === id)
    if (idx === -1) return { code: -1, data: null, message: '篇章不存在' }
    volumes.splice(idx, 1)
    return success(null, '删除成功')
  },

  async createChapter(data: Record<string, unknown>) {
    await delay(400)
    const ch = {
      id: randomId(),
      volumeId: data.volumeId as number,
      volumeName: (data.volumeName as string) || '',
      name: data.name as string,
      sortOrder: data.sortOrder as number,
      difficulty: data.difficulty as string,
      needPoints: !!data.needPoints,
      pointsRequired: (data.pointsRequired as number) || 0,
      preChapterId: 0,
      preChapterName: '',
      status: data.status as string,
      cardCount: 0
    }
    chapters.push(ch)
    const vol = volumes.find((v) => v.id === ch.volumeId)
    if (vol) vol.chapterCount++
    return success(ch)
  },

  async updateChapter(id: number, data: Record<string, unknown>) {
    await delay(400)
    const ch = chapters.find((c) => c.id === id)
    if (!ch) return { code: -1, data: null, message: '章节不存在' }
    Object.assign(ch, data)
    return success(ch)
  },

  async deleteChapter(id: number) {
    await delay(400)
    const idx = chapters.findIndex((c) => c.id === id)
    if (idx === -1) return { code: -1, data: null, message: '章节不存在' }
    const ch = chapters[idx]
    chapters.splice(idx, 1)
    const vol = volumes.find((v) => v.id === ch.volumeId)
    if (vol) vol.chapterCount--
    return success(null, '删除成功')
  }
}
