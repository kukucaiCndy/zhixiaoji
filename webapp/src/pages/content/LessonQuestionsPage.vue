<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, MagicStick, Edit, Delete } from '@element-plus/icons-vue'
import { questionApi, knowledgeApi } from '@/api/modules/content'
import { sdk } from '@/api/sdk-client'
import type { IQuestion, IQuestionOption } from '@/mock/question'
import type { IAiLogEntry } from '@/utils/aiLog'
import { extractAiLogMessage, formatElapsed } from '@/utils/aiLog'

// ==================== Route ====================

const route = useRoute()
const router = useRouter()
const sectionId = computed(() => route.params.sectionId as string)
const sectionTitle = computed(() => (route.query.sectionTitle as string) || '未命名小节')
const chapterName = computed(() => (route.query.chapterName as string) || '')
const backRoute = computed(() => (route.query.backRoute as string) || '/content/knowledge')

// ==================== Data ====================

const questions = ref<IQuestion[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

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
    case 'single_choice': return 'lesson-questions-page__type-badge--single'
    case 'multiple_choice': return 'lesson-questions-page__type-badge--multiple'
    case 'true_false': return 'lesson-questions-page__type-badge--bool'
    default: return ''
  }
}

// ==================== Data Loading ====================

async function loadQuestions() {
  loading.value = true
  try {
    const res = await questionApi.getQuestions({
      lessonId: sectionId.value,
      page: page.value,
      pageSize: pageSize.value
    })
    if (res.code === 0) {
      const data = res.data as { list: IQuestion[]; total: number }
      questions.value = data.list || []
      total.value = data.total || 0
    } else {
      ElMessage.error(res.message || '获取题目列表失败')
    }
  } catch {
    ElMessage.error('获取题目列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage
  loadQuestions()
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  loadQuestions()
}

// ==================== Question Dialog ====================

const dialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogTitle = computed(() => editingQuestion.value ? '编辑题目' : '创建题目')
const editingQuestion = ref<IQuestion | null>(null)
const editingDraftIndex = ref<number | null>(null)
const formRef = ref()

interface IQuestionFormData {
  type: string
  content: string
  options: IQuestionOption[]
  correctAnswer: string[]
  explanation: string
  difficulty: string
}

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
  editingDraftIndex.value = null
  formData.type = 'single_choice'
  formData.content = ''
  formData.options = defaultOptions()
  formData.correctAnswer = []
  formData.explanation = ''
  formData.difficulty = '入门'
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
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
  nextTick(() => formRef.value?.clearValidate())
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
    const payload = {
      type: formData.type,
      content: formData.content,
      options: formData.options,
      correctAnswer: formData.correctAnswer.join(','),
      explanation: formData.explanation,
      difficulty: formData.difficulty,
      answer: formData.correctAnswer.join(',').split(','),
    }

    // Editing a draft item
    if (editingDraftIndex.value !== null) {
      const idx = editingDraftIndex.value
      const draft = draftQuestions.value[idx]
      if (draft) {
        draft.question = formData.content
        draft.type = formData.type
        draft.options = formData.options.map((o) => `${o.key}. ${o.text}`)
        draft.answer = formData.correctAnswer.join(',').split(',')
        draft.explanation = formData.explanation
      }
      dialogVisible.value = false
      editingDraftIndex.value = null
    }
    // Editing existing saved question
    else if (editingQuestion.value) {
      const res = await questionApi.updateQuestion(editingQuestion.value.id, payload)
      if (res.code === 0) {
        ElMessage.success('题目更新成功')
        dialogVisible.value = false
        loadQuestions()
      } else {
        ElMessage.error(res.message || '更新失败')
      }
    }
    // Creating new → add to draft
    else {
      draftQuestions.value.push({
        question: formData.content,
        type: formData.type,
        options: formData.options.map((o) => `${o.key}. ${o.text}`),
        answer: formData.correctAnswer,
        explanation: formData.explanation,
        selected: true,
      })
      ElMessage.success('题目已添加到编辑区，请确认后保存')
      dialogVisible.value = false
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    dialogLoading.value = false
  }
}

// ==================== Draft Operations ====================

function openEditDraftDialog(item: IDraftQuestion) {
  editingQuestion.value = null
  editingDraftIndex.value = draftQuestions.value.indexOf(item)
  formData.type = item.type
  formData.content = item.question
  // Parse options back from "A. text" format
  formData.options = parseWorkflowOptions(item.options || [])
  formData.correctAnswer = item.answer || []
  formData.explanation = item.explanation || ''
  formData.difficulty = '入门'
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function removeDraftItem(idx: number) {
  draftQuestions.value.splice(idx, 1)
}

// ==================== Delete ====================

function truncateContent(content: string, maxLen = 50): string {
  if (!content) return ''
  return content.length > maxLen ? content.slice(0, maxLen) + '...' : content
}

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

// ==================== AI Import ====================

const aiGenerating = ref(false)
const aiElapsed = ref(0)
const aiStep = ref('')
const aiLogs = ref<IAiLogEntry[]>([])
const draftQuestions = ref<IDraftQuestion[]>([])
const savingQuestions = ref(false)
let elapsedTimer: ReturnType<typeof setInterval> | null = null

function parseWorkflowOptions(rawOptions: string[]): IQuestionOption[] {
  return rawOptions.map((opt) => {
    const match = opt.match(/^([A-Z])[.、]\s*/)
    const key = match ? match[1] : ''
    const text = match ? opt.slice(match[0].length) : opt
    return { key, text }
  })
}

function mapWorkflowType(wfType: string): IQuestion['type'] {
  if (wfType === 'multi_choice') return 'multiple_choice'
  if (wfType === 'single_choice' || wfType === 'true_false') return wfType
  return 'single_choice'
}

async function handleAiImport() {
  aiGenerating.value = true
  aiElapsed.value = 0
  aiLogs.value = []
  draftQuestions.value = []
  aiStep.value = '正在连接 AI 服务...'
  const startTime = Date.now()
  elapsedTimer = setInterval(() => {
    aiElapsed.value = Math.floor((Date.now() - startTime) / 1000)
  }, 1000)

  try {
    // Fetch section content for workflow input
    aiStep.value = '正在获取小节内容...'
    let inputParams: Record<string, string> = { section: sectionTitle.value, knowledgePoint: '', latestHtmlContent: '' }
    try {
      const secRes = await knowledgeApi.getSection(sectionId.value)
      if (secRes.code === 0 && secRes.data) {
        const sec = secRes.data as { title?: string; knowledgePoint?: string; htmlContent?: string; latestHtmlContent?: string }
        inputParams = {
          section: sec.title || sectionTitle.value,
          knowledgePoint: sec.knowledgePoint || '',
          latestHtmlContent: sec.latestHtmlContent || sec.htmlContent || '',
        }
      }
    } catch { /* ignore */ }

    // Execute questions_generation workflow
    aiStep.value = '正在调用 AI 工作流...'
    const stream = sdk.workflow.executeWorkflow({ type: 'questions_generation', inputParams })

    let hasCompleted = false
    let eventIndex = 0
    let next = await stream.next()
    while (!next.done) {
      const event = next.value
      eventIndex++
      const logMsg = extractAiLogMessage(event.type, event.data, eventIndex)
      aiLogs.value.push({
        type: event.type as IAiLogEntry['type'],
        time: formatElapsed(Math.floor((Date.now() - startTime) / 1000)),
        message: logMsg
      })
      aiStep.value = event.type === 'completed' ? '题目生成完成' : event.type === 'error' ? '生成失败' : '正在生成...'

      if (event.type === 'completed') {
        const raw = event.data as Record<string, unknown> | undefined
        // output may be a parsed array or a JSON string (depending on workflow)
        let items: WorkflowQuestionItem[] = []
        const outputVal = raw?.output
        if (Array.isArray(outputVal)) {
          items = outputVal as WorkflowQuestionItem[]
        } else if (typeof outputVal === 'string') {
          try { const parsed = JSON.parse(outputVal); items = Array.isArray(parsed) ? parsed : (parsed.output || []) } catch { /* ignore */ }
        }

        if (items.length > 0) {
          draftQuestions.value = items.map((item) => ({ ...item, selected: true }))
          aiLogs.value.push({
            type: 'completed',
            time: formatElapsed(Math.floor((Date.now() - startTime) / 1000)),
            message: `AI 生成完成，共 ${items.length} 道题目，请确认后保存`
          })
          hasCompleted = true
        }
      } else if (event.type === 'error') {
        throw new Error(event.error || '工作流执行失败')
      }
      next = await stream.next()
    }

    if (hasCompleted) {
      ElMessage.success('AI 题目生成完成，请确认后保存')
    } else if (!aiLogs.value.some((l) => l.type === 'error')) {
      ElMessage.warning('AI 工作流完成但未生成题目')
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误'
    aiLogs.value.push({
      type: 'error',
      time: formatElapsed(Math.floor((Date.now() - startTime) / 1000)),
      message: `异常：${msg}`
    })
    aiStep.value = '生成失败'
    ElMessage.error('AI 生成失败')
  } finally {
    if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null }
    aiGenerating.value = false
    setTimeout(() => { aiElapsed.value = 0; aiStep.value = '' }, 3000)
  }
}

// ==================== Draft Questions Management ====================

interface IDraftQuestion {
  id?: string
  type: string
  question: string
  options: string[]
  answer: string[]
  explanation: string
  selected: boolean
  isNew?: boolean
}

const allDraftSelected = computed({
  get: () => draftQuestions.value.length > 0 && draftQuestions.value.every((q) => q.selected),
  set: (val: boolean) => {
    draftQuestions.value.forEach((q) => { q.selected = val })
  }
})

function buildCreateParams(item: IDraftQuestion, sortIndex: number) {
  const qType = mapWorkflowType(item.type)
  return {
    type: qType,
    content: item.question,
    options: qType === 'true_false'
      ? [{ key: 'A', text: '正确' }, { key: 'B', text: '错误' }]
      : parseWorkflowOptions(item.options || []),
    correctAnswer: qType === 'true_false'
      ? (item.answer?.[0] === 'true' ? 'A' : 'B')
      : (item.answer || []).join(','),
    explanation: item.explanation || '',
    difficulty: '入门',
    lessonId: sectionId.value,
    sortOrder: questions.value.length + sortIndex + 1,
  }
}

async function saveOneQuestion(item: IDraftQuestion) {
  try {
    const createRes = await questionApi.createQuestion(buildCreateParams(item, 0) as Record<string, unknown>)
    if (createRes.code === 0) {
      draftQuestions.value = draftQuestions.value.filter((q) => q !== item)
      ElMessage.success('题目已保存')
      loadQuestions()
    } else {
      ElMessage.error('保存失败')
    }
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  }
}

async function handleSaveSelected() {
  const selected = draftQuestions.value.filter((q) => q.selected)
  if (selected.length === 0) {
    ElMessage.warning('请先勾选要保存的题目')
    return
  }
  savingQuestions.value = true
  let savedCount = 0
  let failedCount = 0
  for (const item of selected) {
    try {
      const createRes = await questionApi.createQuestion(buildCreateParams(item, savedCount) as Record<string, unknown>)
      if (createRes.code === 0) {
        savedCount++
      } else {
        console.warn('[AI题目] createQuestion failed:', createRes)
        failedCount++
      }
    } catch (err) {
      console.warn('[AI题目] createQuestion error:', err)
      failedCount++
    }
  }
  if (savedCount > 0) {
    draftQuestions.value = draftQuestions.value.filter((q) => !q.selected)
    ElMessage.success(`成功保存 ${savedCount} 道题目${failedCount > 0 ? `，${failedCount} 道失败` : ''}`)
    loadQuestions()
  } else {
    ElMessage.error('题目保存失败，请稍后重试')
  }
  savingQuestions.value = false
}

function clearDraftQuestions() {
  draftQuestions.value = []
}

interface WorkflowQuestionItem {
  id?: string
  type: string
  question: string
  options: string[]
  answer: string[]
  explanation: string
}

function goBack() {
  router.push(backRoute.value)
}

// ==================== Lifecycle ====================

onMounted(() => {
  loadQuestions()
})
</script>

<template>
  <div class="lesson-questions-page">
    <div class="lesson-questions-page__header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <div class="lesson-questions-page__header-info">
        <span v-if="chapterName" class="lesson-questions-page__chapter">{{ chapterName }} / </span>
        <span class="lesson-questions-page__title">{{ sectionTitle }}</span>
        <span class="lesson-questions-page__subtitle">— 题目管理</span>
      </div>
      <div class="lesson-questions-page__header-actions">
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">创建题目</el-button>
        <el-button :icon="MagicStick" :loading="aiGenerating" @click="handleAiImport">AI 导入题目</el-button>
        <el-button
          v-if="draftQuestions.length > 0"
          type="primary"
          :loading="savingQuestions"
          @click="handleSaveSelected"
        >
          保存已选
        </el-button>
      </div>
    </div>

    <!-- AI Import Progress -->
    <div v-if="aiGenerating" class="lesson-questions-page__ai-section">
      <div class="lesson-questions-page__ai-header">
        <svg class="lesson-questions-page__ai-spinner" viewBox="0 0 24 24" width="28" height="28">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="31.4 31.4" />
        </svg>
        <div class="lesson-questions-page__ai-info">
          <p class="lesson-questions-page__ai-step">{{ aiStep }}</p>
          <p class="lesson-questions-page__ai-time">已用时 {{ aiElapsed }}s</p>
        </div>
      </div>
      <div class="lesson-questions-page__ai-log">
        <div
          v-for="(log, i) in aiLogs"
          :key="i"
          class="lesson-questions-page__ai-log-item"
          :class="`lesson-questions-page__ai-log-item--${log.type}`"
        >
          <span class="lesson-questions-page__ai-log-time">[{{ log.time }}]</span>
          <span class="lesson-questions-page__ai-log-msg">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <!-- AI Completed Logs (shown when generation done but logs exist) -->
    <div v-if="!aiGenerating && aiLogs.length > 0" class="lesson-questions-page__ai-section">
      <div class="lesson-questions-page__ai-log">
        <div
          v-for="(log, i) in aiLogs"
          :key="i"
          class="lesson-questions-page__ai-log-item"
          :class="`lesson-questions-page__ai-log-item--${log.type}`"
        >
          <span class="lesson-questions-page__ai-log-time">[{{ log.time }}]</span>
          <span class="lesson-questions-page__ai-log-msg">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <!-- Draft Questions Preview -->
    <div v-if="draftQuestions.length > 0" class="lesson-questions-page__generated-section">
      <div class="lesson-questions-page__generated-header">
        <el-checkbox v-model="allDraftSelected" :indeterminate="draftQuestions.some((q) => q.selected) && !allDraftSelected">
          全选
        </el-checkbox>
        <span class="lesson-questions-page__generated-title">编辑中的题目（{{ draftQuestions.length }} 道）</span>
        <span class="lesson-questions-page__generated-selected-count" v-if="draftQuestions.filter((q) => q.selected).length > 0">
          已选 {{ draftQuestions.filter((q) => q.selected).length }} 道
        </span>
        <el-button text type="danger" @click="clearDraftQuestions">舍弃全部</el-button>
      </div>
      <div class="lesson-questions-page__generated-list">
        <div
          v-for="(item, idx) in draftQuestions"
          :key="idx"
          class="lesson-questions-page__generated-item"
        >
          <el-checkbox v-model="item.selected" class="lesson-questions-page__generated-checkbox" />
          <span class="lesson-questions-page__generated-index">{{ idx + 1 }}</span>
          <span class="lesson-questions-page__generated-content">{{ item.question }}</span>
          <span class="lesson-questions-page__type-badge" :class="getTypeBadgeClass(mapWorkflowType(item.type))">
            {{ typeMap[mapWorkflowType(item.type)] || item.type }}
          </span>
          <el-button size="small" text type="primary" @click="openEditDraftDialog(item)">编辑</el-button>
          <el-button size="small" text type="danger" @click="removeDraftItem(idx)">删除</el-button>
          <el-button size="small" type="primary" plain @click="saveOneQuestion(item)">保存</el-button>
        </div>
      </div>
    </div>

    <!-- Question Table -->
    <div v-loading="loading" class="lesson-questions-page__table-card">
      <template v-if="questions.length > 0">
        <table class="lesson-questions-page__table">
          <thead>
            <tr>
              <th class="lesson-questions-page__th-index">序号</th>
              <th class="lesson-questions-page__th-content">题目内容</th>
              <th class="lesson-questions-page__th-type">题型</th>
              <th class="lesson-questions-page__th-difficulty">难度</th>
              <th class="lesson-questions-page__th-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(q, idx) in questions" :key="q.id" class="lesson-questions-page__table-row">
              <td class="lesson-questions-page__td-index">
                {{ (page - 1) * pageSize + idx + 1 }}
              </td>
              <td class="lesson-questions-page__td-content">
                <el-tooltip :content="q.content" placement="top" :show-after="500">
                  <span class="lesson-questions-page__content-text">{{ truncateContent(q.content) }}</span>
                </el-tooltip>
              </td>
              <td class="lesson-questions-page__td-type">
                <span class="lesson-questions-page__type-badge" :class="getTypeBadgeClass(q.type)">
                  {{ typeMap[q.type] || q.type }}
                </span>
              </td>
              <td class="lesson-questions-page__td-difficulty">
                <span class="lesson-questions-page__difficulty-text">{{ q.difficulty }}</span>
              </td>
              <td class="lesson-questions-page__td-actions">
                <el-button link type="primary" size="small" :icon="Edit" @click="openEditDialog(q)">编辑</el-button>
                <el-button link type="danger" size="small" :icon="Delete" @click="handleDeleteQuestion(q)">删除</el-button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="total > pageSize" class="lesson-questions-page__pagination">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            background
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </template>

      <el-empty v-else-if="!loading" description="该小节暂无题目，请创建题目或使用 AI 导入" />
    </div>

    <!-- Question Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="720px"
      :close-on-click-modal="false"
      destroy-on-close
      class="lesson-questions-page__dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
        class="lesson-questions-page__form"
      >
        <el-form-item label="题目类型">
          <el-radio-group v-model="formData.type" @change="handleTypeChange">
            <el-radio-button v-for="opt in questionTypeOptions" :key="opt.value" :value="opt.value">
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
            />
          </el-form-item>
        </template>

        <template v-if="isTrueFalse">
          <el-form-item label="选项A">
            <el-input model-value="正确" disabled />
          </el-form-item>
          <el-form-item label="选项B">
            <el-input model-value="错误" disabled />
          </el-form-item>
        </template>

        <el-form-item label="正确答案" prop="correctAnswer">
          <el-radio-group v-if="isSingleChoice || isTrueFalse" v-model="singleCorrectAnswer">
            <el-radio v-for="opt in formData.options" :key="opt.key" :value="opt.key">
              {{ opt.key }}. {{ opt.text }}
            </el-radio>
          </el-radio-group>

          <el-checkbox-group v-if="isMultipleChoice" v-model="formData.correctAnswer">
            <el-checkbox v-for="opt in formData.options" :key="opt.key" :value="opt.key">
              {{ opt.key }}. {{ opt.text }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="答案解析">
          <el-input
            v-model="formData.explanation"
            type="textarea"
            :rows="3"
            placeholder="请输入答案解析（可选）"
          />
        </el-form-item>

        <el-form-item label="难度">
          <el-radio-group v-model="formData.difficulty">
            <el-radio-button v-for="opt in difficultyOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="handleSaveQuestion">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.lesson-questions-page {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__header-info {
    flex: 1;
    font-size: 15px;
    color: var(--app-text-primary);
  }

  &__chapter {
    color: var(--app-text-secondary);
    font-size: 14px;
  }

  &__title {
    font-weight: 600;
  }

  &__subtitle {
    color: var(--app-text-secondary);
    font-size: 13px;
    margin-left: 4px;
  }

  &__header-actions {
    display: flex;
    gap: 8px;
  }

  &__ai-section {
    background: #FDFBF7;
    border: 1px solid #EBE5D9;
    border-radius: 12px;
    padding: 20px 24px;
  }

  &__ai-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
  }

  &__ai-spinner {
    animation: spin 1s linear infinite;
    color: var(--app-primary-color);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  &__ai-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__ai-step {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__ai-time {
    font-size: 12px;
    color: var(--app-text-secondary);
    margin: 0;
  }

  &__ai-log {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 160px;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }

  &__ai-log-item {
    padding: 4px 8px;
    border-radius: 4px;

    &--started { background: #E8F4FD; }
    &--progress { background: #FFF8E1; }
    &--completed { background: #E8F5E9; }
    &--error { background: #FFEBEE; color: #C62828; }
  }

  &__ai-log-time {
    color: var(--app-text-secondary);
    margin-right: 8px;
  }

  &__generated-section {
    background: #F8F5EE;
    border: 1px solid #EBE5D9;
    border-radius: 12px;
    overflow: hidden;
  }

  &__generated-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid #EBE5D9;
  }

  &__generated-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__generated-selected-count {
    font-size: 12px;
    color: var(--app-primary-color);
    margin-left: auto;
  }

  &__generated-actions {
    display: flex;
    gap: 8px;
  }

  &__generated-list {
    padding: 8px 0;
    max-height: 400px;
    overflow-y: auto;
  }

  &__generated-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 20px;
    border-bottom: 1px solid #F0EDE3;
    font-size: 14px;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #F5F2EA;
    }
  }

  &__generated-checkbox {
    flex-shrink: 0;
  }

  &__generated-index {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #EBE5D9;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    color: var(--app-text-secondary);
    flex-shrink: 0;
  }

  &__generated-content {
    flex: 1;
    color: var(--app-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__table-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    th {
      background: #FDFBF7;
      color: var(--app-text-secondary);
      font-weight: 500;
      font-size: 13px;
      text-align: left;
      padding: 12px 16px;
      border-bottom: 1px solid var(--app-border-color);
    }

    td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--app-border-light);
      font-size: 14px;
    }
  }

  &__th-index { width: 60px; text-align: center; }
  &__th-content { }
  &__th-type { width: 100px; text-align: center; }
  &__th-difficulty { width: 80px; text-align: center; }
  &__th-actions { width: 150px; text-align: center; }

  &__td-index { text-align: center; color: var(--app-text-secondary); }
  &__td-content { }
  &__td-type { text-align: center; }
  &__td-difficulty { text-align: center; }
  &__td-actions { text-align: center; }

  &__content-text {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 400px;
  }

  &__type-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;

    &--single { background: #E8F5E9; color: #2E7D32; }
    &--multiple { background: #E3F2FD; color: #1565C0; }
    &--bool { background: #F3E5F5; color: #7B1FA2; }
  }

  &__difficulty-text {
    font-size: 13px;
    color: var(--app-text-regular);
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;
    padding: 16px;
  }

  &__table-row:hover {
    background: #FDFBF7;
  }

  &__form {
    padding-top: 8px;

    :deep(.el-form-item__label) {
      font-size: 13px;
      color: var(--app-text-secondary);
      font-weight: 500;
    }
  }
}
</style>
