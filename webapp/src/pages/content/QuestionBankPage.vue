<script setup lang="ts">
import { ref, computed, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, MagicStick, Edit, Delete, ArrowLeft } from '@element-plus/icons-vue'
import { knowledgeApi, questionApi } from '@/api/modules/content'
import type { ICategory, ISubject, IChapter, ISection } from '@/mock/knowledge'
import type { IQuestion, IQuestionOption } from '@/mock/question'
import IconDisplay from '@/components/IconDisplay.vue'
import type { IAiLogEntry } from '@/utils/aiLog'
import { formatElapsed } from '@/utils/aiLog'

// ==================== Types ====================

interface ILessonQuestionStats {
  lessonId: number | string
  total: number
  published: number
}

interface IQuestionFormData {
  type: string
  content: string
  options: IQuestionOption[]
  correctAnswer: string[]
  explanation: string
  difficulty: string
}

// ==================== Navigation State ====================

const pageLevel = ref(0)
const selectedCategory = ref<ICategory | null>(null)
const selectedSubject = ref<ISubject | null>(null)
const selectedChapter = ref<IChapter | null>(null)
const selectedLesson = ref<ISection | null>(null)

// ==================== Data Lists ====================

const categories = ref<ICategory[]>([])
const subjects = ref<ISubject[]>([])
const chapters = ref<IChapter[]>([])
const lessons = ref<ISection[]>([])
const questions = ref<IQuestion[]>([])

const loading = ref(false)
const questionLoading = ref(false)
const questionTotal = ref(0)
const questionPage = ref(1)
const questionPageSize = ref(20)
const lessonStats = ref<ILessonQuestionStats[]>([])

// ==================== Breadcrumb ====================

const breadcrumbItems = computed(() => {
  const items: { label: string; level: number }[] = [
    { label: '题库管理', level: 0 }
  ]
  if (pageLevel.value >= 1 && selectedCategory.value) {
    items.push({ label: selectedCategory.value.name, level: 1 })
  }
  if (pageLevel.value >= 2 && selectedSubject.value) {
    items.push({ label: selectedSubject.value.name, level: 2 })
  }
  if (pageLevel.value >= 3 && selectedChapter.value) {
    items.push({ label: selectedChapter.value.name, level: 3 })
  }
  if (pageLevel.value >= 4 && selectedLesson.value) {
    items.push({ label: selectedLesson.value.title, level: 4 })
  }
  return items
})

// ==================== Type & Difficulty Maps ====================

const typeMap: Record<string, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题'
}

const difficultyOptions = [
  { label: '入门', value: '入门' },
  { label: '基础', value: '基础' },
  { label: '进阶', value: '进阶' }
]

const questionTypeOptions = [
  { label: '单选题', value: 'single_choice' },
  { label: '多选题', value: 'multiple_choice' },
  { label: '判断题', value: 'true_false' }
]

function getTypeBadgeClass(type: string): string {
  switch (type) {
    case 'single_choice': return 'question-bank-page__type-badge--single'
    case 'multiple_choice': return 'question-bank-page__type-badge--multiple'
    case 'true_false': return 'question-bank-page__type-badge--bool'
    default: return ''
  }
}

// ==================== Navigation Handlers ====================

function navigateToLevel(level: number) {
  if (level === 0) {
    clearBelowLevel(0)
    pageLevel.value = 0
    loadCategories()
  } else if (level === 1 && selectedCategory.value) {
    clearBelowLevel(1)
    pageLevel.value = 1
    loadSubjects()
  } else if (level === 2 && selectedSubject.value) {
    clearBelowLevel(2)
    pageLevel.value = 2
    loadChapters()
  } else if (level === 3 && selectedChapter.value) {
    clearBelowLevel(3)
    pageLevel.value = 3
    loadLessons()
  } else if (level === 4 && selectedLesson.value) {
    pageLevel.value = 4
    questionPage.value = 1
    loadQuestions()
  }
}

function clearBelowLevel(level: number) {
  if (level < 1) selectedCategory.value = null
  if (level < 2) selectedSubject.value = null
  if (level < 3) selectedChapter.value = null
  if (level < 4) selectedLesson.value = null
  questions.value = []
  questionTotal.value = 0
}

// ==================== Data Loading ====================

async function loadCategories() {
  loading.value = true
  try {
    const res = await knowledgeApi.getCategories()
    if (res.code === 0) {
      categories.value = (res.data as ICategory[]) || []
    } else {
      ElMessage.error(res.message || '获取分类列表失败')
    }
  } catch {
    ElMessage.error('获取分类列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

async function loadSubjects() {
  if (!selectedCategory.value) return
  loading.value = true
  try {
    const res = await knowledgeApi.getSubjects({ categoryId: selectedCategory.value.id })
    if (res.code === 0) {
      subjects.value = (res.data as ISubject[]) || []
    } else {
      ElMessage.error(res.message || '获取学科列表失败')
    }
  } catch {
    ElMessage.error('获取学科列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

async function loadChapters() {
  if (!selectedSubject.value) return
  loading.value = true
  try {
    const res = await knowledgeApi.getChapters(selectedSubject.value.id)
    if (res.code === 0) {
      chapters.value = (res.data as IChapter[]) || []
    } else {
      ElMessage.error(res.message || '获取章节列表失败')
    }
  } catch {
    ElMessage.error('获取章节列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

async function loadLessons() {
  if (!selectedChapter.value) return
  loading.value = true
  try {
    const res = await knowledgeApi.getSections(selectedChapter.value.id)
    if (res.code === 0) {
      lessons.value = (res.data as ISection[]) || []
    }
    await loadLessonStats()
  } catch {
    ElMessage.error('获取课时列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

async function loadLessonStats() {
  try {
    const res = await questionApi.getLessonQuestionStats()
    if (res.code === 0) {
      lessonStats.value = (res.data as ILessonQuestionStats[]) || []
    }
  } catch {
    // non-critical
  }
}

function getLessonStats(lessonId: number | string): ILessonQuestionStats | undefined {
  return lessonStats.value.find((s) => s.lessonId == lessonId)
}

async function loadQuestions() {
  if (!selectedLesson.value) return
  questionLoading.value = true
  try {
    const res = await questionApi.getQuestions({
      lessonId: selectedLesson.value.id,
      page: questionPage.value,
      pageSize: questionPageSize.value
    })
    if (res.code === 0) {
      const data = res.data as { list: IQuestion[]; total: number }
      questions.value = data.list || []
      questionTotal.value = data.total || 0
    } else {
      ElMessage.error(res.message || '获取题目列表失败')
    }
  } catch {
    ElMessage.error('获取题目列表失败，请稍后重试')
  } finally {
    questionLoading.value = false
  }
}

function handleSelectCategory(category: ICategory) {
  selectedCategory.value = category
  clearBelowLevel(1)
  pageLevel.value = 1
  loadSubjects()
}

function handleSelectSubject(subject: ISubject) {
  selectedSubject.value = subject
  clearBelowLevel(2)
  pageLevel.value = 2
  loadChapters()
}

function handleSelectChapter(chapter: IChapter) {
  selectedChapter.value = chapter
  clearBelowLevel(3)
  pageLevel.value = 3
  loadLessons()
}

function handleSelectLesson(lesson: ISection) {
  selectedLesson.value = lesson
  pageLevel.value = 4
  questionPage.value = 1
  loadQuestions()
}

function handleBackToLevel3() {
  pageLevel.value = 3
  questions.value = []
  questionTotal.value = 0
}

// ==================== Question Dialog ====================

const dialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogTitle = computed(() => editingQuestion.value ? '编辑题目' : '创建题目')
const editingQuestion = ref<IQuestion | null>(null)
const formRef = ref()

const defaultOptions = (): IQuestionOption[] => [
  { key: 'A', text: '' },
  { key: 'B', text: '' },
  { key: 'C', text: '' },
  { key: 'D', text: '' }
]

const trueFalseOptions = (): IQuestionOption[] => [
  { key: 'A', text: '正确' },
  { key: 'B', text: '错误' }
]

const formData = reactive<IQuestionFormData>({
  type: 'single_choice',
  content: '',
  options: defaultOptions(),
  correctAnswer: [],
  explanation: '',
  difficulty: '入门'
})

const formRules = {
  content: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  correctAnswer: [
    {
      validator: (_rule: unknown, value: string[], callback: (error?: Error) => void) => {
        if (!value || value.length === 0) {
          callback(new Error('请选择正确答案'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

const isSingleChoice = computed(() => formData.type === 'single_choice')
const isMultipleChoice = computed(() => formData.type === 'multiple_choice')
const isTrueFalse = computed(() => formData.type === 'true_false')

const singleCorrectAnswer = computed({
  get: () => formData.correctAnswer[0] || '',
  set: (val: string) => {
    formData.correctAnswer = val ? [val] : []
  }
})

function handleTypeChange() {
  if (isTrueFalse.value) {
    formData.options = trueFalseOptions()
    formData.correctAnswer = []
  } else if (isMultipleChoice.value) {
    formData.options = defaultOptions()
    formData.correctAnswer = []
  } else {
    formData.options = defaultOptions()
    formData.correctAnswer = []
  }
}

function openCreateDialog() {
  editingQuestion.value = null
  formData.type = 'single_choice'
  formData.content = ''
  formData.options = defaultOptions()
  formData.correctAnswer = []
  formData.explanation = ''
  formData.difficulty = '入门'
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

function openEditDialog(question: IQuestion) {
  editingQuestion.value = question
  formData.type = question.type
  formData.content = question.content
  formData.options = question.options ? [...question.options] : []
  formData.correctAnswer = question.correctAnswer ? question.correctAnswer.split(',').filter(Boolean) : []
  formData.explanation = question.explanation || ''
  formData.difficulty = question.difficulty || '入门'
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

async function handleSaveQuestion() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (!isTrueFalse.value) {
    const emptyOptions = formData.options.filter((opt) => !opt.text.trim())
    if (emptyOptions.length > 0) {
      ElMessage.warning('请填写所有选项内容')
      return
    }
  }

  dialogLoading.value = true
  try {
    const payload: Record<string, unknown> = {
      type: formData.type,
      content: formData.content,
      options: formData.options,
      correctAnswer: formData.correctAnswer.join(','),
      explanation: formData.explanation,
      difficulty: formData.difficulty,
      lessonId: selectedLesson.value!.id,
      sortOrder: questions.value.length + 1
    }

    if (editingQuestion.value) {
      const res = await questionApi.updateQuestion(editingQuestion.value.id, payload)
      if (res.code === 0) {
        ElMessage.success('题目更新成功')
        dialogVisible.value = false
        loadQuestions()
      } else {
        ElMessage.error(res.message || '更新失败')
      }
    } else {
      const res = await questionApi.createQuestion(payload)
      if (res.code === 0) {
        ElMessage.success('题目创建成功')
        dialogVisible.value = false
        loadQuestions()
      } else {
        ElMessage.error(res.message || '创建失败')
      }
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    dialogLoading.value = false
  }
}

// ==================== Question Actions ====================

async function handleDeleteQuestion(question: IQuestion) {
  try {
    await ElMessageBox.confirm(
      `确定要删除题目「${truncateContent(question.content)}」吗？此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await questionApi.deleteQuestion(question.id)
    if (res.code === 0) {
      ElMessage.success('题目删除成功')
      loadQuestions()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // user cancelled
  }
}

function truncateContent(content: string, maxLen = 50): string {
  if (!content) return ''
  if (content.length > maxLen) {
    return content.slice(0, maxLen) + '...'
  }
  return content
}

function handleQuestionPageChange(newPage: number) {
  questionPage.value = newPage
  loadQuestions()
}

function handleQuestionSizeChange(newSize: number) {
  questionPageSize.value = newSize
  questionPage.value = 1
  loadQuestions()
}

// ==================== AI Import ====================

const aiGenerating = ref(false)
const aiElapsed = ref(0)
const aiStep = ref('')
const aiLogs = ref<IAiLogEntry[]>([])

async function handleAiImport() {
  if (!selectedLesson.value) return

  const lesson = selectedLesson.value
  aiGenerating.value = true
  aiElapsed.value = 0
  aiLogs.value = []
  aiStep.value = '正在连接 AI 服务...'
  const startTime = Date.now()
  const elapsedTimer = setInterval(() => {
    aiElapsed.value = Math.floor((Date.now() - startTime) / 1000)
  }, 1000)

  // Simulated progress logs
  aiLogs.value.push({ type: 'started', time: formatElapsed(0), message: 'AI 任务已启动，准备生成题目' })
  aiStep.value = 'AI 正在分析课时内容...'

  try {
    await new Promise((resolve) => setTimeout(resolve, 800))
    aiLogs.value.push({
      type: 'progress',
      time: formatElapsed(Math.floor((Date.now() - startTime) / 1000)),
      message: `第 1 步：正在分析课时「${lesson.title}」的知识点`
    })

    await new Promise((resolve) => setTimeout(resolve, 800))
    aiLogs.value.push({
      type: 'progress',
      time: formatElapsed(Math.floor((Date.now() - startTime) / 1000)),
      message: '第 2 步：正在生成单选题...'
    })

    await new Promise((resolve) => setTimeout(resolve, 800))
    aiLogs.value.push({
      type: 'progress',
      time: formatElapsed(Math.floor((Date.now() - startTime) / 1000)),
      message: '第 3 步：正在生成多选题和判断题...'
    })

    const res = await questionApi.aiImportQuestions(lesson.id, lesson.title)
    if (res.code === 0) {
      const generated = res.data as IQuestion[]
      aiLogs.value.push({
        type: 'completed',
        time: formatElapsed(Math.floor((Date.now() - startTime) / 1000)),
        message: `AI 生成完成，共生成 ${generated.length} 道题目`
      })
      aiStep.value = '生成完成'
      ElMessage.success(`AI 导入成功，共生成 ${generated.length} 道题目`)
      loadQuestions()
    } else {
      throw new Error(res.message || 'AI 导入失败')
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误'
    aiLogs.value.push({
      type: 'error',
      time: formatElapsed(Math.floor((Date.now() - startTime) / 1000)),
      message: `错误：${msg}`
    })
    aiStep.value = '生成失败'
    ElMessage.error('AI 导入失败')
  } finally {
    clearInterval(elapsedTimer)
    aiGenerating.value = false
    setTimeout(() => {
      aiElapsed.value = 0
      aiStep.value = ''
    }, 2000)
  }
}

// ==================== Lifecycle ====================

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <div class="question-bank-page">
    <!-- Breadcrumb -->
    <div class="question-bank-page__breadcrumb">
      <template v-for="(item, index) in breadcrumbItems" :key="item.level">
        <button
          class="question-bank-page__breadcrumb-item"
          :class="{ 'question-bank-page__breadcrumb-item--active': index === breadcrumbItems.length - 1 }"
          @click="navigateToLevel(item.level)"
        >
          {{ item.label }}
        </button>
        <span v-if="index < breadcrumbItems.length - 1" class="question-bank-page__breadcrumb-sep">/</span>
      </template>
    </div>

    <!-- Level 0: Categories -->
    <div v-if="pageLevel === 0" class="question-bank-page__level-content">
      <div v-loading="loading" class="question-bank-page__grid">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="question-bank-page__card question-bank-page__card--clickable"
          @click="handleSelectCategory(cat)"
        >
          <div class="question-bank-page__card-icon">
            <IconDisplay :icon="cat.icon" />
          </div>
          <div class="question-bank-page__card-body">
            <div class="question-bank-page__card-title">{{ cat.name }}</div>
            <div class="question-bank-page__card-desc">{{ cat.description }}</div>
          </div>
          <div class="question-bank-page__card-meta">
            <span>{{ cat.subjectCount }} 个学科</span>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && categories.length === 0" description="暂无分类数据" />
    </div>

    <!-- Level 1: Subjects -->
    <div v-else-if="pageLevel === 1" class="question-bank-page__level-content">
      <div v-loading="loading" class="question-bank-page__grid">
        <div
          v-for="sub in subjects"
          :key="sub.id"
          class="question-bank-page__card question-bank-page__card--clickable"
          @click="handleSelectSubject(sub)"
        >
          <div class="question-bank-page__card-icon">
            <IconDisplay :icon="sub.icon" />
          </div>
          <div class="question-bank-page__card-body">
            <div class="question-bank-page__card-title">{{ sub.name }}</div>
            <div class="question-bank-page__card-desc">
              难度：{{ sub.difficulty }}
            </div>
          </div>
          <div class="question-bank-page__card-meta">
            <span>{{ sub.chapterCount }} 个章节</span>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && subjects.length === 0" description="该分类下暂无学科" />
    </div>

    <!-- Level 2: Chapters -->
    <div v-else-if="pageLevel === 2" class="question-bank-page__level-content">
      <div v-loading="loading" class="question-bank-page__list">
        <div
          v-for="ch in chapters"
          :key="ch.id"
          class="question-bank-page__list-item"
          @click="handleSelectChapter(ch)"
        >
          <div class="question-bank-page__list-item-left">
            <div class="question-bank-page__list-item-title">{{ ch.name }}</div>
            <div class="question-bank-page__list-item-desc">{{ ch.goal || ch.description }}</div>
          </div>
          <div class="question-bank-page__list-item-right">
            <span class="question-bank-page__list-item-count">{{ ch.sectionCount }} 个课时</span>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && chapters.length === 0" description="该学科下暂无章节" />
    </div>

    <!-- Level 3: Lessons -->
    <div v-else-if="pageLevel === 3" class="question-bank-page__level-content">
      <div v-loading="loading" class="question-bank-page__list">
        <div
          v-for="lesson in lessons"
          :key="lesson.id"
          class="question-bank-page__list-item"
          @click="handleSelectLesson(lesson)"
        >
          <div class="question-bank-page__list-item-left">
            <div class="question-bank-page__list-item-title">{{ lesson.title }}</div>
            <div class="question-bank-page__list-item-desc">{{ lesson.knowledgePoint }}</div>
          </div>
          <div class="question-bank-page__list-item-right">
            <template v-if="getLessonStats(lesson.id)">
              <span class="question-bank-page__list-item-count">
                共 {{ getLessonStats(lesson.id)!.total }} 题
              </span>
              <span class="question-bank-page__list-item-published">
                {{ getLessonStats(lesson.id)!.published }} 已发布
              </span>
            </template>
            <span v-else class="question-bank-page__list-item-count">暂无题目</span>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && lessons.length === 0" description="该章节下暂无课时" />
    </div>

    <!-- Level 4: Questions -->
    <div v-else-if="pageLevel === 4" class="question-bank-page__question-area">
      <!-- Header -->
      <div class="question-bank-page__question-header">
        <div class="question-bank-page__question-header-left">
          <el-button :icon="ArrowLeft" size="small" @click="handleBackToLevel3">返回课时列表</el-button>
          <div class="question-bank-page__lesson-info">
            <span class="question-bank-page__lesson-info-label">当前课时：</span>
            <span class="question-bank-page__lesson-info-name">{{ selectedLesson?.title }}</span>
          </div>
        </div>
        <div class="question-bank-page__question-header-actions">
          <el-button type="primary" :icon="Plus" @click="openCreateDialog">创建题目</el-button>
          <el-button :icon="MagicStick" :loading="aiGenerating" @click="handleAiImport">AI 导入题目</el-button>
        </div>
      </div>

      <!-- AI Import Progress -->
      <div v-if="aiGenerating" class="question-bank-page__ai-section">
        <div class="question-bank-page__ai-header">
          <svg class="question-bank-page__ai-spinner" viewBox="0 0 24 24" width="28" height="28">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="31.4 31.4" />
          </svg>
          <div class="question-bank-page__ai-info">
            <p class="question-bank-page__ai-step">{{ aiStep }}</p>
            <p class="question-bank-page__ai-time">已用时 {{ aiElapsed }}s</p>
          </div>
        </div>
        <div class="question-bank-page__ai-log">
          <div
            v-for="(log, i) in aiLogs"
            :key="i"
            class="question-bank-page__ai-log-item"
            :class="`question-bank-page__ai-log-item--${log.type}`"
          >
            <span class="question-bank-page__ai-log-time">[{{ log.time }}]</span>
            <span class="question-bank-page__ai-log-msg">{{ log.message }}</span>
          </div>
        </div>
      </div>

      <!-- Question Table -->
      <div v-loading="questionLoading" class="question-bank-page__question-table-card">
        <template v-if="questions.length > 0">
          <table class="question-bank-page__table">
            <thead>
              <tr>
                <th class="question-bank-page__th-index">序号</th>
                <th class="question-bank-page__th-content">题目内容</th>
                <th class="question-bank-page__th-type">题型</th>
                <th class="question-bank-page__th-difficulty">难度</th>
                <th class="question-bank-page__th-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(q, idx) in questions" :key="q.id" class="question-bank-page__table-row">
                <td class="question-bank-page__td-index">
                  {{ (questionPage - 1) * questionPageSize + idx + 1 }}
                </td>
                <td class="question-bank-page__td-content">
                  <el-tooltip :content="q.content" placement="top" :show-after="500">
                    <span class="question-bank-page__content-text">{{ truncateContent(q.content) }}</span>
                  </el-tooltip>
                </td>
                <td class="question-bank-page__td-type">
                  <span class="question-bank-page__type-badge" :class="getTypeBadgeClass(q.type)">
                    {{ typeMap[q.type] || q.type }}
                  </span>
                </td>
                <td class="question-bank-page__td-difficulty">
                  <span class="question-bank-page__difficulty-text">{{ q.difficulty }}</span>
                </td>
                <td class="question-bank-page__td-actions">
                  <el-button link type="primary" size="small" :icon="Edit" @click="openEditDialog(q)">编辑</el-button>
                  <el-button link type="danger" size="small" :icon="Delete" @click="handleDeleteQuestion(q)">删除</el-button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div v-if="questionTotal > questionPageSize" class="question-bank-page__pagination">
            <el-pagination
              v-model:current-page="questionPage"
              v-model:page-size="questionPageSize"
              :total="questionTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              background
              @current-change="handleQuestionPageChange"
              @size-change="handleQuestionSizeChange"
            />
          </div>
        </template>

        <el-empty v-else-if="!questionLoading" description="该课时下暂无题目，请创建题目或使用 AI 导入">
          <template #image>
            <el-empty description="" />
          </template>
        </el-empty>
      </div>
    </div>

    <!-- Question Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="720px"
      :close-on-click-modal="false"
      destroy-on-close
      class="question-bank-page__dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
        class="question-bank-page__form"
      >
        <el-form-item label="题目类型">
          <el-radio-group v-model="formData.type" @change="handleTypeChange">
            <el-radio-button
              v-for="opt in questionTypeOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="题目内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="3"
            placeholder="请输入题目内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- Options for single/multi choice -->
        <template v-if="isSingleChoice || isMultipleChoice">
          <el-form-item
            v-for="(option, index) in formData.options"
            :key="option.key"
            :label="'选项 ' + option.key"
          >
            <el-input
              v-model="option.text"
              :placeholder="'请输入选项' + option.key + '的内容'"
              maxlength="200"
              :disabled="isTrueFalse"
            />
          </el-form-item>
        </template>

        <!-- Fixed true/false options display -->
        <template v-if="isTrueFalse">
          <el-form-item label="选项A">
            <el-input model-value="正确" disabled />
          </el-form-item>
          <el-form-item label="选项B">
            <el-input model-value="错误" disabled />
          </el-form-item>
        </template>

        <!-- Correct Answer -->
        <el-form-item label="正确答案" prop="correctAnswer">
          <!-- Single choice / True False: radio -->
          <el-radio-group
            v-if="isSingleChoice || isTrueFalse"
            v-model="singleCorrectAnswer"
          >
            <el-radio
              v-for="opt in formData.options"
              :key="opt.key"
              :value="opt.key"
            >
              {{ opt.key }}. {{ opt.text }}
            </el-radio>
          </el-radio-group>

          <!-- Multi choice: checkbox -->
          <el-checkbox-group
            v-if="isMultipleChoice"
            v-model="formData.correctAnswer"
          >
            <el-checkbox
              v-for="opt in formData.options"
              :key="opt.key"
              :value="opt.key"
            >
              {{ opt.key }}. {{ opt.text }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="答案解析">
          <el-input
            v-model="formData.explanation"
            type="textarea"
            :rows="2"
            placeholder="请输入答案解析（选填）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="难度">
          <el-radio-group v-model="formData.difficulty">
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
        <div class="question-bank-page__dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="dialogLoading" @click="handleSaveQuestion">
            {{ editingQuestion ? '保存修改' : '创建题目' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.question-bank-page {
  display: flex;
  flex-direction: column;
  gap: 20px;

  // ==================== Breadcrumb ====================

  &__breadcrumb {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 0;
    flex-wrap: wrap;
  }

  &__breadcrumb-item {
    background: none;
    border: none;
    font-size: 13px;
    color: var(--app-text-secondary);
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    transition: color 0.2s, background-color 0.2s;

    &:hover {
      color: var(--app-primary-color);
      background: rgba(79, 70, 229, 0.06);
    }

    &--active {
      color: var(--app-text-primary);
      font-weight: 500;
      cursor: default;

      &:hover {
        background: none;
        color: var(--app-text-primary);
      }
    }
  }

  &__breadcrumb-sep {
    font-size: 13px;
    color: var(--app-text-secondary);
    margin: 0 2px;
    user-select: none;
  }

  // ==================== Level Content ====================

  &__level-content {
    min-height: 200px;
  }

  // Grid layout for categories and subjects
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  // Card
  &__card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;

    &--clickable {
      cursor: pointer;

      &:hover {
        border-color: var(--app-primary-color);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }
    }
  }

  &__card-icon {
    font-size: 32px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    overflow: hidden;

    :deep(.icon-display) {
      font-size: 32px;
    }

    :deep(.icon-display--img) {
      width: 32px;
      height: 32px;
    }
  }

  &__card-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__card-desc {
    font-size: 13px;
    color: var(--app-text-secondary);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__card-meta {
    font-size: 12px;
    color: var(--app-text-secondary);
    padding-top: 8px;
    border-top: 1px solid var(--app-border-color);
  }

  // ==================== List Layout (Chapters, Lessons) ====================

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__list-item {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 10px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
      border-color: var(--app-primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
  }

  &__list-item-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  &__list-item-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__list-item-desc {
    font-size: 13px;
    color: var(--app-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__list-item-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    flex-shrink: 0;
    margin-left: 24px;
  }

  &__list-item-count {
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__list-item-published {
    font-size: 12px;
    color: var(--app-success-color);
  }

  // ==================== Question Area (Level 4) ====================

  &__question-area {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__question-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__question-header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__lesson-info {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__lesson-info-label {
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__lesson-info-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__question-header-actions {
    display: flex;
    gap: 12px;
  }

  // AI Section
  &__ai-section {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 10px;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__ai-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__ai-spinner {
    animation: spin 1.5s linear infinite;
    color: var(--app-primary-color);
    flex-shrink: 0;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  &__ai-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__ai-step {
    font-size: 14px;
    color: var(--app-text-primary);
    font-weight: 500;
    margin: 0;
  }

  &__ai-time {
    font-size: 12px;
    color: var(--app-text-secondary);
    margin: 0;
  }

  &__ai-log {
    max-height: 300px;
    overflow-y: auto;
    background: var(--app-bg-color);
    border-radius: 6px;
    padding: 10px 14px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    line-height: 1.8;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__ai-log-item {
    display: flex;
    gap: 8px;
    color: var(--app-text-secondary);

    &--started {
      color: var(--app-text-secondary);
    }

    &--progress {
      color: var(--app-text-regular);
    }

    &--completed {
      color: var(--app-success-color);
    }

    &--error {
      color: var(--app-danger-color);
    }
  }

  &__ai-log-time {
    flex-shrink: 0;
    opacity: 0.7;
  }

  &__ai-log-msg {
    word-break: break-all;
  }

  // Question Table Card
  &__question-table-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;
    min-height: 200px;
  }

  // Table
  &__table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    thead {
      background: #FDFBF7;

      th {
        padding: 12px 16px;
        font-size: 13px;
        font-weight: 500;
        color: var(--app-text-secondary);
        text-align: left;
        border-bottom: 1px solid var(--app-border-color);
      }
    }

    tbody {
      .question-bank-page__table-row {
        transition: background-color 0.15s;

        &:hover {
          background-color: #FDFBF7;
        }

        &:not(:last-child) td {
          border-bottom: 1px solid #f0ebe3;
        }
      }
    }

    td {
      padding: 14px 16px;
      font-size: 14px;
      color: var(--app-text-regular);
      vertical-align: middle;
    }
  }

  &__th-index {
    width: 60px;
    text-align: center !important;
  }

  &__th-content {
    width: auto;
  }

  &__th-type {
    width: 90px;
    text-align: center !important;
  }

  &__th-difficulty {
    width: 70px;
    text-align: center !important;
  }

  &__th-status {
    width: 90px;
    text-align: center !important;
  }

  &__th-actions {
    width: 140px;
    text-align: center !important;
  }

  &__td-index {
    text-align: center;
    color: var(--app-text-secondary);
    font-size: 13px;
  }

  &__content-text {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: default;
  }

  &__td-type {
    text-align: center;
  }

  &__type-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;

    &--single {
      background: rgba(64, 158, 255, 0.1);
      color: #409EFF;
    }

    &--multiple {
      background: rgba(103, 194, 58, 0.1);
      color: #67C23A;
    }

    &--bool {
      background: rgba(230, 162, 60, 0.1);
      color: #E6A23C;
    }
  }

  &__td-difficulty {
    text-align: center;
  }

  &__difficulty-text {
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__td-status {
    text-align: center;
  }

  &__td-actions {
    text-align: center;
    white-space: nowrap;
  }

  // Pagination
  &__pagination {
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid var(--app-border-color);

    :deep(.el-pagination) {
      --el-pagination-bg-color: var(--app-bg-card);
      --el-pagination-button-bg-color: var(--app-bg-card);
    }
  }

  // ==================== Dialog ====================

  &__dialog {
    :deep(.el-dialog__header) {
      border-bottom: 1px solid var(--app-border-color);
      padding: 20px 24px;
      margin-right: 0;
    }

    :deep(.el-dialog__title) {
      font-size: 17px;
      font-weight: 600;
      color: var(--app-text-primary);
    }

    :deep(.el-dialog__body) {
      padding: 24px;
    }
  }

  &__form {
    :deep(.el-form-item__label) {
      color: var(--app-text-regular);
      font-weight: 500;
    }

    :deep(.el-radio-group) {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    :deep(.el-checkbox-group) {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  }

  &__dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
