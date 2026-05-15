<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, MagicStick, View } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/modules/content'
import type { ICategory, IChapter, ISection } from '@/mock/knowledge'

// ==================== Data State ====================

const categories = ref<ICategory[]>([])
const chaptersMap = ref<Record<number, IChapter[]>>({})
const sectionsMap = ref<Record<number, ISection[]>>({})
const pageLoading = ref(false)
const chaptersLoading = ref(false)
const sectionsLoading = ref(false)

const allChapters = computed(() => Object.values(chaptersMap.value).flat() as IChapter[])

// ==================== UI State ====================

const expandedCategoryId = ref<number | null>(null)
const expandedChapterIds = ref<Set<number>>(new Set())

// Category dialog
const categoryDialogVisible = ref(false)
const categoryDialogTitle = ref('新增大类')
const categoryFormRef = ref()
const categoryForm = reactive({
  name: '',
  icon: '📁',
  description: '',
  sortOrder: 1,
  status: '草稿'
})
let editingCategoryId: number | null = null

// Chapter dialog
const chapterDialogVisible = ref(false)
const chapterDialogTitle = ref('新增章节')
const chapterFormRef = ref()
const chapterForm = reactive({
  name: '',
  categoryId: undefined as number | undefined,
  sortOrder: 1,
  difficulty: '入门'
})
let editingChapterId: number | null = null

// Section dialog
const sectionDialogVisible = ref(false)
const sectionDialogTitle = ref('新增小节')
const sectionFormRef = ref()
const sectionForm = reactive({
  title: '',
  chapterId: undefined as number | undefined,
  sortOrder: 1,
  content: '',
  coverImage: '',
  summary: ''
})
let editingSectionId: number | null = null

// Section preview
const previewDialogVisible = ref(false)
const previewSection = ref<ISection | null>(null)

// AI generate dialog
const aiDialogVisible = ref(false)
const aiStep = ref<'input' | 'generating' | 'result'>('input')
const aiCategoryName = ref('')
const aiCategoryDesc = ref('')
const aiProgressText = ref('')
const aiProgressPercent = ref(0)
const aiResult = ref<{
  category: ICategory
  chapters: IChapter[]
  sections: ISection[]
} | null>(null)
const aiExpandedChapterIds = ref<Set<number>>(new Set())

// ==================== Constants ====================

const difficultyOptions = [
  { label: '入门', value: '入门' },
  { label: '基础', value: '基础' },
  { label: '进阶', value: '进阶' }
]

const emojiOptions = [
  '📁', '💻', '🔧', '🚀', '🌐', '📊', '🎨', '📚',
  '⚡', '🔬', '🎯', '💡', '🌟', '🔥', '🎵', '🏆',
  '📱', '🤖', '🎮', '📷', '🗂️', '🧠', '📈', '🛠️'
]

const categoryDialogRules = {
  name: [{ required: true, message: '请输入大类名称', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序序号', trigger: 'blur' }]
}

const chapterDialogRules = {
  name: [{ required: true, message: '请输入章节名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择所属大类', trigger: 'change' }],
  sortOrder: [{ required: true, message: '请输入排序序号', trigger: 'blur' }]
}

const sectionDialogRules = {
  title: [{ required: true, message: '请输入小节标题', trigger: 'blur' }],
  chapterId: [{ required: true, message: '请选择所属章节', trigger: 'change' }],
  sortOrder: [{ required: true, message: '请输入排序序号', trigger: 'blur' }]
}

// ==================== Computed ====================

const selectedCategory = computed(() => {
  if (expandedCategoryId.value === null) return null
  return categories.value.find((c) => c.id === expandedCategoryId.value) || null
})

const selectedCategoryChapters = computed(() => {
  if (expandedCategoryId.value === null) return []
  return chaptersMap.value[expandedCategoryId.value] || []
})

function getSectionsForChapter(chapterId: number): ISection[] {
  return sectionsMap.value[chapterId] || []
}

// ==================== Helper Functions ====================

function getStatusTagType(status: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (status) {
    case '已上架': return 'success'
    case '草稿': return 'warning'
    default: return 'info'
  }
}

function handleCoverUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) sectionForm.coverImage = window.URL.createObjectURL(file)
}

function getDifficultyTagType(difficulty: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (difficulty) {
    case '入门': return 'success'
    case '基础': return 'warning'
    case '进阶': return 'danger'
    default: return 'info'
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

// ==================== Data Fetching ====================

async function fetchCategories() {
  try {
    pageLoading.value = true
    const res = await knowledgeApi.getCategories()
    if (res.code === 0) {
      categories.value = (res.data as ICategory[]).sort((a, b) => a.sortOrder - b.sortOrder)
    }
  } catch {
    ElMessage.error('获取大类列表失败，请稍后重试')
  } finally {
    pageLoading.value = false
  }
}

async function fetchChapters(categoryId: number) {
  try {
    chaptersLoading.value = true
    const res = await knowledgeApi.getChapters(categoryId)
    if (res.code === 0) {
      chaptersMap.value[categoryId] = (res.data as IChapter[]).sort((a, b) => a.sortOrder - b.sortOrder)
    }
  } catch {
    ElMessage.error('获取章节列表失败，请稍后重试')
  } finally {
    chaptersLoading.value = false
  }
}

async function fetchSections(chapterId: number) {
  try {
    sectionsLoading.value = true
    const res = await knowledgeApi.getSections(chapterId)
    if (res.code === 0) {
      sectionsMap.value[chapterId] = (res.data as ISection[]).sort((a, b) => a.sortOrder - b.sortOrder)
    }
  } catch {
    ElMessage.error('获取小节列表失败，请稍后重试')
  } finally {
    sectionsLoading.value = false
  }
}

// ==================== Category Actions ====================

function handleToggleCategory(categoryId: number) {
  if (expandedCategoryId.value === categoryId) {
    expandedCategoryId.value = null
    expandedChapterIds.value.clear()
    return
  }
  expandedCategoryId.value = categoryId
  expandedChapterIds.value.clear()
  if (!chaptersMap.value[categoryId]) {
    fetchChapters(categoryId)
  }
}

function handleAddCategory() {
  editingCategoryId = null
  categoryDialogTitle.value = '新增大类'
  categoryForm.name = ''
  categoryForm.icon = '📁'
  categoryForm.description = ''
  categoryForm.sortOrder = categories.value.length + 1
  categoryForm.status = '草稿'
  categoryDialogVisible.value = true
}

function handleEditCategory(cat: ICategory) {
  editingCategoryId = cat.id
  categoryDialogTitle.value = '编辑大类'
  categoryForm.name = cat.name
  categoryForm.icon = cat.icon
  categoryForm.description = cat.description
  categoryForm.sortOrder = cat.sortOrder
  categoryForm.status = cat.status
  categoryDialogVisible.value = true
}

async function handleDeleteCategory(cat: ICategory) {
  try {
    await ElMessageBox.confirm(
      `确定要删除大类「${cat.name}」吗？删除后该大类下的所有章节和小节也将被删除，此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await knowledgeApi.deleteCategory(cat.id)
    if (res.code === 0) {
      ElMessage.success('大类删除成功')
      if (expandedCategoryId.value === cat.id) {
        expandedCategoryId.value = null
        expandedChapterIds.value.clear()
      }
      await fetchCategories()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleCategorySubmit() {
  const valid = await categoryFormRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    const data = { ...categoryForm }
    if (editingCategoryId !== null) {
      const res = await knowledgeApi.updateCategory(editingCategoryId, data)
      if (res.code === 0) {
        ElMessage.success('大类更新成功')
        categoryDialogVisible.value = false
        await fetchCategories()
      } else {
        ElMessage.error(res.message || '更新失败')
      }
    } else {
      const res = await knowledgeApi.createCategory(data)
      if (res.code === 0) {
        ElMessage.success('大类新增成功')
        categoryDialogVisible.value = false
        await fetchCategories()
      } else {
        ElMessage.error(res.message || '新增失败')
      }
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  }
}

// ==================== Chapter Actions ====================

function handleToggleChapter(chapterId: number) {
  if (expandedChapterIds.value.has(chapterId)) {
    expandedChapterIds.value.delete(chapterId)
  } else {
    expandedChapterIds.value.add(chapterId)
    if (!sectionsMap.value[chapterId]) {
      fetchSections(chapterId)
    }
  }
  // trigger reactivity
  expandedChapterIds.value = new Set(expandedChapterIds.value)
}

function handleAddChapter(cat?: ICategory) {
  editingChapterId = null
  chapterDialogTitle.value = '新增章节'
  chapterForm.name = ''
  chapterForm.categoryId = cat ? cat.id : undefined
  chapterForm.sortOrder = 1
  chapterForm.difficulty = '入门'
  chapterDialogVisible.value = true
}

function handleEditChapter(ch: IChapter) {
  editingChapterId = ch.id
  chapterDialogTitle.value = '编辑章节'
  chapterForm.name = ch.name
  chapterForm.categoryId = ch.categoryId
  chapterForm.sortOrder = ch.sortOrder
  chapterForm.difficulty = ch.difficulty
  chapterDialogVisible.value = true
}

async function handleDeleteChapter(ch: IChapter) {
  try {
    await ElMessageBox.confirm(
      `确定要删除章节「${ch.name}」吗？删除后该章节下的所有小节也将被删除，此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await knowledgeApi.deleteChapter(ch.id)
    if (res.code === 0) {
      ElMessage.success('章节删除成功')
      if (expandedCategoryId.value === ch.categoryId) {
        delete chaptersMap.value[ch.categoryId]
        await fetchChapters(ch.categoryId)
      }
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleChapterSubmit() {
  const valid = await chapterFormRef.value?.validate().catch(() => false)
  if (!valid) return

  const cat = categories.value.find((c) => c.id === chapterForm.categoryId)

  try {
    const data = {
      categoryId: chapterForm.categoryId!,
      categoryName: cat ? cat.name : '',
      name: chapterForm.name,
      sortOrder: chapterForm.sortOrder,
      difficulty: chapterForm.difficulty,
      status: '草稿'
    }
    if (editingChapterId !== null) {
      const res = await knowledgeApi.updateChapter(editingChapterId, data)
      if (res.code === 0) {
        ElMessage.success('章节更新成功')
        chapterDialogVisible.value = false
        if (expandedCategoryId.value === chapterForm.categoryId) {
          await fetchChapters(chapterForm.categoryId!)
        }
      } else {
        ElMessage.error(res.message || '更新失败')
      }
    } else {
      const res = await knowledgeApi.createChapter(data)
      if (res.code === 0) {
        ElMessage.success('章节新增成功')
        chapterDialogVisible.value = false
        if (expandedCategoryId.value === chapterForm.categoryId) {
          await fetchChapters(chapterForm.categoryId!)
        }
      } else {
        ElMessage.error(res.message || '新增失败')
      }
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  }
}

// ==================== Section Actions ====================

function handleAddSection(ch?: IChapter) {
  editingSectionId = null
  sectionDialogTitle.value = '新增小节'
  sectionForm.title = ''
  sectionForm.chapterId = ch ? ch.id : undefined
  sectionForm.sortOrder = 1
  sectionForm.content = ''
  sectionForm.coverImage = ''
  sectionForm.summary = ''
  sectionDialogVisible.value = true
}

function handleEditSection(sec: ISection) {
  editingSectionId = sec.id
  sectionDialogTitle.value = '编辑小节'
  sectionForm.title = sec.title
  sectionForm.chapterId = sec.chapterId
  sectionForm.sortOrder = sec.sortOrder
  sectionForm.content = sec.content
  sectionForm.coverImage = sec.coverImage
  sectionForm.summary = sec.summary
  sectionDialogVisible.value = true
}

function handlePreviewSection(sec: ISection) {
  previewSection.value = sec
  previewDialogVisible.value = true
}

async function handleDeleteSection(sec: ISection) {
  try {
    await ElMessageBox.confirm(
      `确定要删除小节「${sec.title}」吗？此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await knowledgeApi.deleteSection(sec.id)
    if (res.code === 0) {
      ElMessage.success('小节删除成功')
      if (expandedChapterIds.value.has(sec.chapterId)) {
        delete sectionsMap.value[sec.chapterId]
        await fetchSections(sec.chapterId)
      }
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleSectionSubmit() {
  const valid = await sectionFormRef.value?.validate().catch(() => false)
  if (!valid) return

  const ch = chaptersMap.value[sectionForm.chapterId!]?.find((c) => c.id === sectionForm.chapterId)
    || allChapters.value.find((c) => c.id === sectionForm.chapterId)

  try {
    const data = {
      chapterId: sectionForm.chapterId!,
      chapterName: ch ? ch.name : '',
      title: sectionForm.title,
      sortOrder: sectionForm.sortOrder,
      content: sectionForm.content,
      coverImage: sectionForm.coverImage,
      summary: sectionForm.summary,
      status: '草稿'
    }
    if (editingSectionId !== null) {
      const res = await knowledgeApi.updateSection(editingSectionId, data)
      if (res.code === 0) {
        ElMessage.success('小节更新成功')
        sectionDialogVisible.value = false
        if (expandedChapterIds.value.has(sectionForm.chapterId!)) {
          await fetchSections(sectionForm.chapterId!)
        }
      } else {
        ElMessage.error(res.message || '更新失败')
      }
    } else {
      const res = await knowledgeApi.createSection(data)
      if (res.code === 0) {
        ElMessage.success('小节新增成功')
        sectionDialogVisible.value = false
        if (expandedChapterIds.value.has(sectionForm.chapterId!)) {
          await fetchSections(sectionForm.chapterId!)
        }
      } else {
        ElMessage.error(res.message || '新增失败')
      }
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  }
}

// ==================== AI Generate ====================

function handleOpenAIDialog() {
  aiStep.value = 'input'
  aiCategoryName.value = ''
  aiCategoryDesc.value = ''
  aiProgressText.value = ''
  aiProgressPercent.value = 0
  aiResult.value = null
  aiExpandedChapterIds.value.clear()
  aiDialogVisible.value = true
}

async function handleAIGenerate() {
  if (!aiCategoryName.value.trim()) {
    ElMessage.warning('请输入大类名称')
    return
  }

  aiStep.value = 'generating'
  aiProgressPercent.value = 0

  const stages = [
    { text: '正在分析知识领域...', percent: 25, delay: 2000 },
    { text: '正在规划章节结构...', percent: 50, delay: 2000 },
    { text: '正在生成章节内容...', percent: 75, delay: 3000 },
    { text: '内容生成完毕！', percent: 100, delay: 1000 }
  ]

  try {
    for (const stage of stages) {
      aiProgressText.value = stage.text
      aiProgressPercent.value = stage.percent
      await new Promise((resolve) => setTimeout(resolve, stage.delay))
    }

    const res = await knowledgeApi.generateCategoryContent(aiCategoryName.value.trim())
    if (res.code === 0) {
      aiResult.value = res.data as { category: ICategory; chapters: IChapter[]; sections: ISection[] }
      aiStep.value = 'result'
    } else {
      ElMessage.error(res.message || 'AI 生成失败')
      aiStep.value = 'input'
    }
  } catch {
    ElMessage.error('AI 生成失败，请稍后重试')
    aiStep.value = 'input'
  }
}

function handleAIToggleChapter(chapterId: number) {
  if (aiExpandedChapterIds.value.has(chapterId)) {
    aiExpandedChapterIds.value.delete(chapterId)
  } else {
    aiExpandedChapterIds.value.add(chapterId)
  }
  aiExpandedChapterIds.value = new Set(aiExpandedChapterIds.value)
}

async function handleAISaveAsDraft() {
  if (!aiResult.value) return
  try {
    const { category, chapters, sections } = aiResult.value
    const catRes = await knowledgeApi.createCategory({
      name: category.name,
      icon: category.icon,
      description: category.description,
      sortOrder: category.sortOrder,
      status: '草稿'
    })
    if (catRes.code !== 0) {
      ElMessage.error(catRes.message || '保存大类失败')
      return
    }
    const savedCat = catRes.data as ICategory
    for (const ch of chapters) {
      const chRes = await knowledgeApi.createChapter({
        categoryId: savedCat.id,
        categoryName: savedCat.name,
        name: ch.name,
        sortOrder: ch.sortOrder,
        difficulty: ch.difficulty,
        status: '草稿'
      })
      if (chRes.code === 0) {
        const savedCh = chRes.data as IChapter
        const chSections = sections.filter((s) => s.chapterId === ch.id)
        for (const sec of chSections) {
          await knowledgeApi.createSection({
            chapterId: savedCh.id,
            chapterName: savedCh.name,
            title: sec.title,
            sortOrder: sec.sortOrder,
            content: sec.content,
            coverImage: sec.coverImage || '',
            summary: sec.summary || '',
            status: '草稿'
          })
        }
      }
    }
    ElMessage.success('AI 生成内容已保存为草稿')
    aiDialogVisible.value = false
    await fetchCategories()
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  }
}

async function handleAIPublish() {
  if (!aiResult.value) return

  try {
    await ElMessageBox.confirm(
      '确定要直接发布 AI 生成的内容吗？发布后用户将立即可见。',
      '发布确认',
      { confirmButtonText: '确定发布', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }

  try {
    const { category, chapters, sections } = aiResult.value
    const catRes = await knowledgeApi.createCategory({
      name: category.name,
      icon: category.icon,
      description: category.description,
      sortOrder: category.sortOrder,
      status: '已上架'
    })
    if (catRes.code !== 0) {
      ElMessage.error(catRes.message || '发布大类失败')
      return
    }
    const savedCat = catRes.data as ICategory
    for (const ch of chapters) {
      const chRes = await knowledgeApi.createChapter({
        categoryId: savedCat.id,
        categoryName: savedCat.name,
        name: ch.name,
        sortOrder: ch.sortOrder,
        difficulty: ch.difficulty,
        status: '已上架'
      })
      if (chRes.code === 0) {
        const savedCh = chRes.data as IChapter
        const chSections = sections.filter((s) => s.chapterId === ch.id)
        for (const sec of chSections) {
          await knowledgeApi.createSection({
            chapterId: savedCh.id,
            chapterName: savedCh.name,
            title: sec.title,
            sortOrder: sec.sortOrder,
            content: sec.content,
            coverImage: sec.coverImage || '',
            summary: sec.summary || '',
            status: '已上架'
          })
        }
      }
    }
    ElMessage.success('AI 生成内容已发布')
    aiDialogVisible.value = false
    await fetchCategories()
  } catch {
    ElMessage.error('发布失败，请稍后重试')
  }
}

function handleAIRegenerate() {
  aiStep.value = 'input'
  aiResult.value = null
  aiExpandedChapterIds.value.clear()
}

// ==================== Lifecycle ====================

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="knowledge">
    <!-- Breadcrumb -->
    <el-breadcrumb class="knowledge__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>内容管理</el-breadcrumb-item>
      <el-breadcrumb-item>知识体系</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Top Bar -->
    <div class="knowledge__top-bar">
      <h2 class="knowledge__title">知识体系管理</h2>
      <div class="knowledge__top-actions">
        <el-button type="primary" :icon="MagicStick" class="knowledge__btn-ai" @click="handleOpenAIDialog">
          AI 生成大类
        </el-button>
        <el-button :icon="Plus" @click="handleAddCategory">
          + 新增大类
        </el-button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!pageLoading && categories.length === 0" class="knowledge__empty">
      <div class="knowledge__empty-icon">📚</div>
      <p class="knowledge__empty-text">暂无知识体系数据，点击「+ 新增大类」开始创建</p>
    </div>

    <!-- Category Grid -->
    <div v-else v-loading="pageLoading" class="knowledge__grid">
      <template v-for="cat in categories" :key="cat.id">
        <div
          class="knowledge__card"
          :class="{ 'knowledge__card--expanded': expandedCategoryId === cat.id }"
          @click="handleToggleCategory(cat.id)"
        >
          <div class="knowledge__card-body">
            <div class="knowledge__card-icon">{{ cat.icon }}</div>
            <div class="knowledge__card-info">
              <div class="knowledge__card-name">{{ cat.name }}</div>
              <div class="knowledge__card-desc">{{ cat.description }}</div>
              <div class="knowledge__card-meta">
                <span class="knowledge__card-badge">{{ cat.chapterCount }} 个章节</span>
                <el-tag
                  :type="getStatusTagType(cat.status)"
                  size="small"
                  class="knowledge__card-tag"
                >
                  {{ cat.status }}
                </el-tag>
              </div>
            </div>
          </div>
          <div class="knowledge__card-actions" @click.stop>
            <el-button link type="primary" size="small" :icon="Edit" @click="handleEditCategory(cat)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" :icon="Delete" @click="handleDeleteCategory(cat)">
              删除
            </el-button>
          </div>
        </div>

        <!-- Expanded Category View -->
        <div
          v-if="expandedCategoryId === cat.id"
          class="knowledge__expanded"
        >
          <div class="knowledge__expanded-header">
            <span class="knowledge__expanded-title">{{ cat.name }} - 章节列表</span>
            <el-button size="small" :icon="Plus" @click.stop="handleAddChapter(cat)">
              新增章节
            </el-button>
          </div>

          <div v-loading="chaptersLoading" class="knowledge__chapters">
            <div v-if="selectedCategoryChapters.length === 0 && !chaptersLoading" class="knowledge__chapters-empty">
              暂无章节，点击「新增章节」开始创建
            </div>

            <div
              v-for="ch in selectedCategoryChapters"
              :key="ch.id"
              class="knowledge__chapter"
            >
              <div
                class="knowledge__chapter-header"
                @click="handleToggleChapter(ch.id)"
              >
                <div class="knowledge__chapter-main">
                  <span class="knowledge__chapter-arrow">
                    {{ expandedChapterIds.has(ch.id) ? '&#9660;' : '&#9654;' }}
                  </span>
                  <span class="knowledge__chapter-name">{{ ch.name }}</span>
                  <el-tag :type="getDifficultyTagType(ch.difficulty)" size="small" class="knowledge__chapter-diff">
                    {{ ch.difficulty }}
                  </el-tag>
                  <span class="knowledge__chapter-count">{{ ch.sectionCount }} 个小节</span>
                </div>
                <div class="knowledge__chapter-actions" @click.stop>
                  <el-button size="small" :icon="Plus" @click="handleAddSection(ch)">
                    新增小节
                  </el-button>
                  <el-button link type="primary" size="small" :icon="Edit" @click="handleEditChapter(ch)">
                    编辑
                  </el-button>
                  <el-button link type="danger" size="small" :icon="Delete" @click="handleDeleteChapter(ch)">
                    删除
                  </el-button>
                </div>
              </div>

              <!-- Section Cards -->
              <div v-if="expandedChapterIds.has(ch.id)" class="knowledge__sections">
                <div v-if="sectionsLoading" class="knowledge__sections-loading">
                  加载小节中...
                </div>
                <div v-else-if="getSectionsForChapter(ch.id).length === 0" class="knowledge__sections-empty">
                  暂无小节，点击「新增小节」开始创建
                </div>
                <div v-else class="knowledge__sections-list">
                  <div
                    v-for="sec in getSectionsForChapter(ch.id)"
                    :key="sec.id"
                    class="knowledge__section-card"
                  >
                    <div class="knowledge__section-cover">
                      <img v-if="sec.coverImage" :src="sec.coverImage" :alt="sec.title" class="knowledge__section-img" />
                      <div v-else class="knowledge__section-cover-placeholder">
                        <span>📄</span>
                      </div>
                    </div>
                    <div class="knowledge__section-body">
                      <div class="knowledge__section-title">{{ sec.title }}</div>
                      <div class="knowledge__section-summary">{{ sec.summary || '暂无摘要' }}</div>
                      <div class="knowledge__section-meta">
                        <el-tag
                          :type="getStatusTagType(sec.status)"
                          size="small"
                        >
                          {{ sec.status }}
                        </el-tag>
                        <span class="knowledge__section-date">{{ formatDate(sec.createdAt) }}</span>
                      </div>
                    </div>
                    <div class="knowledge__section-actions">
                      <el-button link type="primary" size="small" :icon="Edit" @click="handleEditSection(sec)">
                        编辑
                      </el-button>
                      <el-button link type="primary" size="small" :icon="View" @click="handlePreviewSection(sec)">
                        预览
                      </el-button>
                      <el-button link type="danger" size="small" :icon="Delete" @click="handleDeleteSection(sec)">
                        删除
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ==================== Category Dialog ==================== -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="categoryDialogTitle"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryDialogRules"
        label-width="90px"
        label-position="right"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入大类名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="图标">
          <div class="knowledge__emoji-grid">
            <span
              v-for="emoji in emojiOptions"
              :key="emoji"
              class="knowledge__emoji-item"
              :class="{ 'knowledge__emoji-item--active': categoryForm.icon === emoji }"
              @click="categoryForm.icon = emoji"
            >
              {{ emoji }}
            </span>
          </div>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入大类描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="categoryForm.sortOrder"
            :min="1"
            :max="999"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="categoryForm.status"
            active-value="已上架"
            inactive-value="草稿"
            active-text="已上架"
            inactive-text="草稿"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCategorySubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- ==================== Chapter Dialog ==================== -->
    <el-dialog
      v-model="chapterDialogVisible"
      :title="chapterDialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="chapterFormRef"
        :model="chapterForm"
        :rules="chapterDialogRules"
        label-width="90px"
        label-position="right"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="chapterForm.name" placeholder="请输入章节名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="所属大类" prop="categoryId">
          <el-select v-model="chapterForm.categoryId" placeholder="请选择所属大类" style="width: 100%">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="chapterForm.sortOrder"
            :min="1"
            :max="999"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="难度">
          <el-radio-group v-model="chapterForm.difficulty">
            <el-radio-button
              v-for="opt in difficultyOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="chapterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChapterSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- ==================== Section Dialog ==================== -->
    <el-dialog
      v-model="sectionDialogVisible"
      :title="sectionDialogTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="sectionFormRef"
        :model="sectionForm"
        :rules="sectionDialogRules"
        label-width="90px"
        label-position="right"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="sectionForm.title" placeholder="请输入小节标题" maxlength="100" />
        </el-form-item>
        <el-form-item label="所属章节" prop="chapterId">
          <el-select v-model="sectionForm.chapterId" placeholder="请选择所属章节" style="width: 100%">
            <el-option
              v-for="ch in allChapters"
              :key="ch.id"
              :label="`${ch.categoryName} / ${ch.name}`"
              :value="ch.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="封面图">
          <div class="knowledge__cover-upload">
            <div v-if="sectionForm.coverImage" class="knowledge__cover-preview">
              <img :src="sectionForm.coverImage" alt="封面图" class="knowledge__cover-img" />
              <el-button
                type="danger"
                size="small"
                circle
                class="knowledge__cover-remove"
                @click="sectionForm.coverImage = ''"
              >
                ✕
              </el-button>
            </div>
            <div v-else class="knowledge__cover-placeholder">
              <el-icon size="32"><Plus /></el-icon>
              <span>点击上传封面图</span>
              <input
                type="file"
                accept="image/*"
                class="knowledge__cover-input"
                @change="handleCoverUpload"
              />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="正文内容">
          <el-input
            v-model="sectionForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入正文内容，支持 Markdown 格式"
          />
          <div class="knowledge__form-tip">支持 Markdown 格式</div>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="sectionForm.sortOrder"
            :min="1"
            :max="999"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sectionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSectionSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.knowledge {
  display: flex; flex-direction: column; gap: 20px;
  &__breadcrumb { :deep(.el-breadcrumb__inner) { color: var(--app-text-secondary); font-size: 13px;
      &.is-link { color: var(--app-text-secondary); &:hover { color: var(--app-primary-color) } } }
    :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) { color: var(--app-text-primary); font-weight: 500 } }
  &__top-bar { display: flex; align-items: center; justify-content: space-between }
  &__title { font-family: var(--app-font-heading); font-size: 20px; font-weight: 700; color: var(--app-text-primary); margin: 0 }
  &__top-actions { display: flex; gap: 12px }
  &__btn-ai { --el-button-bg-color: var(--app-primary-color); --el-button-border-color: var(--app-primary-color) }
  &__grid { display: flex; flex-direction: column; gap: 20px }
  &__grid-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px }
  &__card { display: flex; gap: 20px; background: var(--app-bg-card); border: 1px solid var(--app-border-color); border-radius: 12px; padding: 24px; cursor: pointer; transition: box-shadow .2s;
    &:hover { box-shadow: 0 2px 12px rgba(0,0,0,.08) }
    &--expanded { border-color: var(--app-primary-color); box-shadow: 0 2px 12px rgba(212,145,110,.15) } }
  &__card-icon { font-size: 36px }
  &__card-info { flex: 1 }
  &__card-name { font-family: var(--app-font-heading); font-size: 16px; font-weight: 600; color: var(--app-text-primary); margin-bottom: 6px }
  &__card-desc { font-family: var(--app-font-body); font-size: 13px; color: #A89880; margin-bottom: 10px }
  &__card-meta { display: flex; align-items: center; gap: 10px }
  &__card-badge { font-family: var(--app-font-body); font-size: 12px; font-weight: 500; color: var(--app-text-regular) }
  &__card-tag { font-size: 11px }
  &__card-actions { display: flex; flex-direction: column; gap: 8px }
  &__expanded { margin-top: 20px; background: var(--app-bg-card); border: 1px solid var(--app-border-color); border-radius: 12px; padding: 24px }
  &__expanded-title { font-family: var(--app-font-heading); font-size: 15px; font-weight: 600; color: var(--app-text-primary); margin-bottom: 16px }
  &__chapter-panel { background: #FDFBF7; border-radius: 8px; padding: 16px; margin-bottom: 12px; &:last-child { margin-bottom: 0 } }
  &__chapter-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px }
  &__chapter-name { font-family: var(--app-font-heading); font-size: 14px; font-weight: 600; color: var(--app-text-primary); flex: 1 }
  &__chapter-count { font-family: var(--app-font-body); font-size: 12px; font-weight: 500; color: #A89880 }
  &__chapter-actions { display: flex; gap: 8px }
  &__section-row { display: flex; gap: 16px }
  &__section-card { background: #FFF; border: 1px solid var(--app-border-color); border-radius: 8px; padding: 12px; width: 260px; flex-shrink: 0 }
  &__section-cover { height: 100px; background: #F5F0EB; border-radius: 6px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center }
  &__section-cover-text { font-family: var(--app-font-body); font-size: 12px; color: #A89880 }
  &__section-title { font-family: var(--app-font-heading); font-size: 14px; font-weight: 600; color: var(--app-text-primary); margin-bottom: 4px }
  &__section-summary { font-family: var(--app-font-body); font-size: 12px; color: #A89880; margin-bottom: 8px }
  &__section-meta { display: flex; justify-content: space-between; align-items: center }
  &__section-actions { display: flex; gap: 6px }
  &__empty { text-align: center; padding: 60px 0; color: #A89880; &--hint { font-size: 13px } }
  &__cover-preview { position: relative; display: inline-block }
  &__cover-img { width: 200px; height: 120px; object-fit: cover; border-radius: 8px }
  &__cover-remove { position: absolute; top: -6px; right: -6px }
  &__cover-placeholder { width: 200px; height: 120px; background: #F5F0EB; border: 1px dashed var(--app-border-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative }
  &__cover-icon { font-size: 24px; color: #A89880 }
  &__cover-input { position: absolute; inset: 0; opacity: 0; cursor: pointer }
  &__generate-result { margin-top: 16px; border: 1px solid var(--app-border-color); border-radius: 8px; max-height: 300px; overflow: auto }
  &__generate-tree { padding: 12px 16px }
  &__gen-category { font-family: var(--app-font-heading); font-size: 14px; font-weight: 600; color: var(--app-text-primary); padding: 8px 0 }
  &__gen-chapter { padding: 6px 0 6px 24px; font-family: var(--app-font-heading); font-size: 13px; font-weight: 500; color: var(--app-text-regular) }
  &__gen-section { padding: 4px 0 4px 48px; font-family: var(--app-font-body); font-size: 12px; color: #A89880 }
}
</style>