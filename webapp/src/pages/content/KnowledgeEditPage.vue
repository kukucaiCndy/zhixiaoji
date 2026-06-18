<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/modules/content'
import { sdk } from '@/api/sdk-client'
import EmojiPicker from '@/components/EmojiPicker.vue'
import type { IKnowledgeSystem, IChapter, ISection } from '@/mock/knowledge'
import type { IAiLogEntry } from '@/utils/aiLog'
import { extractAiLogMessage, formatElapsed } from '@/utils/aiLog'

interface ISectionLocal {
  tempId: number
  id: number | null
  title: string
  knowledgePoint: string
  sortOrder: number
}

interface IChapterLocal {
  tempId: number
  id: number | null
  name: string
  goal: string
  description: string
  sortOrder: number
  difficulty: string
  expanded: boolean
  editingDetail: boolean
  sections: ISectionLocal[]
}

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => route.name === 'KnowledgeEdit')
const isCreate = computed(() => route.name === 'KnowledgeCreate')
const knowledgeId = computed(() => (isEdit.value ? (route.params.id as string) : null))

const knowledgeName = computed(() => formData.name || '未命名')

const pageTitle = computed(() => {
  if (isEdit.value) return '编辑：' + knowledgeName.value
  return '新增分类'
})

const formLoading = ref(false)
const formRef = ref()

let tempIdCounter = 1
function genTempId() {
  return tempIdCounter++
}

const formData = reactive({
  name: '',
  difficulty: '入门',
  icon: '📚'
})

const chapters = ref<IChapterLocal[]>([])

const previewDialogVisible = ref(false)
const previewSection = ref<ISection | null>(null)
const previewLoading = ref(false)

const difficultyOptions = [
  { label: '入门', value: '入门' },
  { label: '基础', value: '基础' },
  { label: '进阶', value: '进阶' }
]

function addChapter() {
  const sortOrder = chapters.value.length + 1
  chapters.value.push({
    tempId: genTempId(),
    id: null,
    name: '',
    goal: '',
    description: '',
    sortOrder,
    difficulty: formData.difficulty,
    expanded: true,
    editingDetail: false,
    sections: []
  })
}

function removeChapter(index: number) {
  const ch = chapters.value[index]
  const label = ch.name || '类目 ' + (index + 1)
  ElMessageBox.confirm(`确定要删除「${label}」吗？删除后不可恢复。`, '确认删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    if (ch.id !== null) {
      try {
        const res = await knowledgeApi.deleteChapter(ch.id)
        if (res.code !== 0) {
          ElMessage.error(res.message || '删除失败')
          return
        }
      } catch {
        ElMessage.error('删除类目失败，请稍后重试')
        return
      }
    }
    chapters.value.splice(index, 1)
    reorderChapters()
    ElMessage.success('类目已删除')
  }).catch(() => {})
}

function toggleChapterExpand(chapter: IChapterLocal) {
  chapter.expanded = !chapter.expanded
}

function toggleEditingDetail(chapter: IChapterLocal) {
  chapter.editingDetail = !chapter.editingDetail
}

async function handlePreviewSection(sectionId: number) {
  previewLoading.value = true
  previewDialogVisible.value = true
  try {
    const res = await knowledgeApi.getSection(sectionId)
    if (res.code === 0) {
      previewSection.value = res.data as ISection
    } else {
      ElMessage.error(res.message || '获取章节内容失败')
    }
  } catch {
    ElMessage.error('获取章节内容失败')
  } finally {
    previewLoading.value = false
  }
}

function moveChapterUp(index: number) {
  if (index <= 0) return
  const temp = chapters.value[index]
  chapters.value[index] = chapters.value[index - 1]
  chapters.value[index - 1] = temp
  reorderChapters()
}

function moveChapterDown(index: number) {
  if (index >= chapters.value.length - 1) return
  const temp = chapters.value[index]
  chapters.value[index] = chapters.value[index + 1]
  chapters.value[index + 1] = temp
  reorderChapters()
}

function reorderChapters() {
  chapters.value.forEach((ch, i) => {
    ch.sortOrder = i + 1
  })
}

function addSection(chapterIndex: number) {
  const chapter = chapters.value[chapterIndex]
  const sortOrder = chapter.sections.length + 1
  chapter.sections.push({
    tempId: genTempId(),
    id: null,
    title: '',
    knowledgePoint: '',
    sortOrder
  })
}

function removeSection(chapterIndex: number, sectionIndex: number) {
  const chapter = chapters.value[chapterIndex]
  const section = chapter.sections[sectionIndex]
  const label = section.title || '章节 ' + (sectionIndex + 1)
  ElMessageBox.confirm(`确定要删除「${label}」吗？删除后不可恢复。`, '确认删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    if (section.id !== null) {
      try {
        const res = await knowledgeApi.deleteSection(section.id)
        if (res.code !== 0) {
          ElMessage.error(res.message || '删除失败')
          return
        }
      } catch {
        ElMessage.error('删除章节失败，请稍后重试')
        return
      }
    }
    chapter.sections.splice(sectionIndex, 1)
    reorderSections(chapter)
    ElMessage.success('章节已删除')
  }).catch(() => {})
}

function moveSectionUp(chapterIndex: number, sectionIndex: number) {
  const chapter = chapters.value[chapterIndex]
  if (sectionIndex <= 0) return
  const temp = chapter.sections[sectionIndex]
  chapter.sections[sectionIndex] = chapter.sections[sectionIndex - 1]
  chapter.sections[sectionIndex - 1] = temp
  reorderSections(chapter)
}

function moveSectionDown(chapterIndex: number, sectionIndex: number) {
  const chapter = chapters.value[chapterIndex]
  if (sectionIndex >= chapter.sections.length - 1) return
  const temp = chapter.sections[sectionIndex]
  chapter.sections[sectionIndex] = chapter.sections[sectionIndex + 1]
  chapter.sections[sectionIndex + 1] = temp
  reorderSections(chapter)
}

function reorderSections(chapter: IChapterLocal) {
  chapter.sections.forEach((sec, i) => {
    sec.sortOrder = i + 1
  })
}

function navigateToSectionEdit(knowledgeId: string | number, chapterId: number | string, sectionId: number | string) {
  router.push(`/content/knowledge/${knowledgeId}/chapters/${chapterId}/sections/${sectionId}/edit`)
}

function navigateToSectionQuestions(chapterId: number | string, sectionId: number | string, chapterName: string, sectionTitle: string) {
  router.push({
    path: `/content/knowledge/questions/${sectionId}`,
    query: {
      sectionTitle,
      chapterName,
      backRoute: `/content/knowledge/${knowledgeId.value}`
    }
  })
}

function goBack() {
  router.push('/content/knowledge')
}

function validatePublish(): boolean {
  if (!formData.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return false
  }
  if (chapters.value.length === 0) {
    ElMessage.warning('请至少添加一个类目')
      return false
    }
    for (const ch of chapters.value) {
      if (!ch.name.trim()) {
        ElMessage.warning('请填写所有类目名称')
        return false
      }
      if (ch.sections.length === 0) {
        ElMessage.warning('每个类目至少需要包含一个章节')
        return false
      }
      for (const sec of ch.sections) {
        if (!sec.title.trim()) {
          ElMessage.warning('请填写所有章节的标题')
        return false
      }
    }
  }
  return true
}

async function saveChaptersAndSections(knowledgeSysId: string | number) {
  for (const ch of chapters.value) {
    const chData: Record<string, unknown> = {
      categoryId: knowledgeSysId,
      knowledgeSystemName: formData.name,
      name: ch.name,
      goal: ch.goal,
      description: ch.description,
      sortOrder: ch.sortOrder,
      difficulty: ch.difficulty
    }

    let chapterId: number

    if (ch.id !== null) {
      const res = await knowledgeApi.updateChapter(ch.id, chData)
      if (res.code !== 0) throw new Error(res.message || '更新类目失败')
      chapterId = ch.id
    } else {
      const res = await knowledgeApi.createChapter(chData)
      if (res.code !== 0) throw new Error(res.message || '创建类目失败')
      const created = (res.data as IChapter)
      chapterId = created.id
      ch.id = chapterId
    }

    for (const sec of ch.sections) {
      const secData = {
        chapterId,
        chapterName: ch.name,
        title: sec.title,
        knowledgePoint: sec.knowledgePoint,
        sortOrder: sec.sortOrder
      }

      if (sec.id !== null) {
        const res = await knowledgeApi.updateSection(sec.id, secData as Record<string, unknown>)
        if (res.code !== 0) throw new Error(res.message || '更新章节失败')
      } else {
        const res = await knowledgeApi.createSection(secData)
        if (res.code !== 0) throw new Error(res.message || '创建章节失败')
        const created = (res.data as ISection)
        sec.id = created.id
      }
    }
  }
}

async function handleSave(status: string) {
  if (!formData.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  if (status === '展示') {
    if (!validatePublish()) return
  }

  const baseData = {
    name: formData.name,
    icon: formData.icon,
    difficulty: formData.difficulty,
    status
  }

  formLoading.value = true
  try {
    let currentKnowledgeId: string | number

    if (isEdit.value && knowledgeId.value) {
      const updateData: Record<string, unknown> = { ...baseData }
      const res = await knowledgeApi.updateCategory(knowledgeId.value, updateData)
      if (res.code !== 0) {
        ElMessage.error(res.message || '更新失败')
        return
      }
      currentKnowledgeId = knowledgeId.value
    } else {
      const res = await knowledgeApi.createCategory(baseData)
      if (res.code !== 0) {
        ElMessage.error(res.message || '创建失败')
        return
      }
      const created = (res.data as unknown as IKnowledgeSystem)
      currentKnowledgeId = created.id
    }

    await saveChaptersAndSections(currentKnowledgeId)

    if (status === '展示') {
      const pubRes = await knowledgeApi.showCategory(currentKnowledgeId)
      if (pubRes.code !== 0) {
        ElMessage.error(pubRes.message || '发布失败')
        return
      }
      ElMessage.success('分类已发布展示')
      router.push('/content/knowledge')
    } else {
      ElMessage.success('草稿已保存')
      if (isCreate.value) {
        router.replace(`/content/knowledge/${currentKnowledgeId}/edit`)
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : '操作失败，请稍后重试'
    ElMessage.error(msg)
  } finally {
    formLoading.value = false
  }
}

async function fetchKnowledgeData() {
  if (!knowledgeId.value) return
  formLoading.value = true
  try {
    const ksRes = await knowledgeApi.getCategory(knowledgeId.value)
    if (ksRes.code !== 0) {
      ElMessage.error(ksRes.message || '获取分类详情失败')
      return
    }
    const ks = ksRes.data as unknown as IKnowledgeSystem
    formData.name = ks.name
    formData.difficulty = ks.difficulty
    formData.icon = ks.icon

    const chRes = await knowledgeApi.getChapters(knowledgeId.value)
    if (chRes.code !== 0) {
      ElMessage.error(chRes.message || '获取类目列表失败')
      return
    }
    const chList = (chRes.data as IChapter[]) || []

    const chaptersData: IChapterLocal[] = []
    const sectionResults = await Promise.all(
      chList.map((ch) => knowledgeApi.getSections(ch.id))
    )
    chList.forEach((ch, i) => {
      const secRes = sectionResults[i]
      const secList = secRes.code === 0 ? (secRes.data as ISection[]) || [] : []

      chaptersData.push({
        tempId: genTempId(),
        id: ch.id,
        name: ch.name,
        goal: ch.goal,
        description: ch.description,
        sortOrder: ch.sortOrder,
        difficulty: ch.difficulty,
        expanded: true,
        editingDetail: false,
        sections: secList.map((sec) => ({
          tempId: genTempId(),
          id: sec.id,
          title: sec.title,
          knowledgePoint: sec.knowledgePoint,
          sortOrder: sec.sortOrder
        }))
      })
    })
    chapters.value = chaptersData
  } catch {
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    formLoading.value = false
  }
}

const aiGenerating = ref(false)
const aiElapsed = ref(0)
const aiStep = ref('')
const aiLogs = ref<IAiLogEntry[]>([])

async function handleAiGenerate() {
  if (!formData.name.trim()) {
    ElMessage.warning('请先输入分类名称')
    return
  }

  const name = formData.name.trim()
  aiGenerating.value = true
  aiElapsed.value = 0
  aiLogs.value = []
  aiStep.value = '正在连接 AI 服务...'
  const startTime = Date.now()
  const elapsedTimer = setInterval(() => {
    aiElapsed.value = Math.floor((Date.now() - startTime) / 1000)
  }, 1000)

  let hasCompleted = false
  let eventIndex = 0

  try {
    const stream = sdk.workflow.executeWorkflow({
      type: 'chapter_generation',
      inputParams: { topic: name, level: formData.difficulty }
    })

    let next = await stream.next()
    while (!next.done) {
      const event = next.value
      eventIndex++
      const logMsg = extractAiLogMessage(event.type, event.data, eventIndex)
      aiLogs.value.push({ type: event.type as IAiLogEntry['type'], time: formatElapsed(aiElapsed.value), message: logMsg })
      aiStep.value = event.type === 'completed' ? '生成完成' : event.type === 'error' ? '生成失败' : '正在生成...'

      if (event.type === 'completed') {
        const raw = event.data as Record<string, unknown> | undefined
        const chaptersArray = raw?.output as { chapter: string; goal: string; description: string; sections: { section: string; knowledge_point: string }[] }[] | undefined
        if (chaptersArray && Array.isArray(chaptersArray)) {
          chapters.value = chaptersArray.map((ch, i) => ({
            tempId: genTempId(),
            id: null,
            name: ch.chapter,
            goal: ch.goal || '',
            description: ch.description || '',
            sortOrder: i + 1,
            difficulty: '入门',
            expanded: false,
            editingDetail: false,
            sections: (ch.sections || []).map((sec, si) => ({
              tempId: genTempId(),
              id: null,
              title: sec.section,
              knowledgePoint: sec.knowledge_point || '',
              sortOrder: si + 1
            }))
          }))
          formData.name = (raw?.topic as string) || formData.name
          hasCompleted = true
          ElMessage.success(`大纲生成成功，耗时 ${event.executionTimeMs ? (event.executionTimeMs / 1000).toFixed(1) + 's' : aiElapsed.value + 's'}`)
          break
        }
        // invalid data format, fall through to mock
      } else if (event.type === 'error') {
        console.error('[AI生成大纲] 工作流错误事件:', event)
        throw new Error(event.error || '工作流执行失败')
      }
      next = await stream.next()
    }
  } catch (err) {
    console.error('[AI生成大纲] SDK workflow 异常:', err)
    aiLogs.value.push({ type: 'error', time: formatElapsed(aiElapsed.value), message: `异常：${String(err)}` })
  }

  // workflow did not complete, show error
  if (!hasCompleted) {
    console.error('[AI生成大纲] 工作流未返回 completed 事件')
    ElMessage.error('AI 生成大纲失败，工作流未完成')
  }

  clearInterval(elapsedTimer)
  aiGenerating.value = false
  aiElapsed.value = 0
  aiStep.value = ''
}

onMounted(() => {
  if (isEdit.value) {
    fetchKnowledgeData()
  }
})
</script>

<template>
  <div v-loading="formLoading" class="knowledge-edit-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="knowledge-edit-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/content/knowledge' }">内容管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Top Bar -->
    <div class="knowledge-edit-page__top-bar">
      <h2 class="knowledge-edit-page__title">{{ pageTitle }}</h2>
      <div class="knowledge-edit-page__top-actions">
        <el-button :icon="ArrowLeft" @click="goBack">← 返回列表</el-button>
        <el-button @click="handleSave('草稿')">保存草稿</el-button>
        <el-button type="primary" @click="handleSave('展示')">展示发布</el-button>
      </div>
    </div>

    <!-- Basic Info Section -->
    <div class="knowledge-edit-page__section">
      <div class="knowledge-edit-page__section-title">基本信息</div>
      <el-form ref="formRef" :model="formData" label-width="110px" label-position="right">
        <el-form-item label="分类名称" required>
          <el-input
            v-model="formData.name"
            placeholder="请输入分类名称"
            maxlength="30"
            show-word-limit
            style="max-width: 400px"
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

        <el-form-item label="显示图标">
            <EmojiPicker v-model="formData.icon" />
          </el-form-item>
      </el-form>
    </div>

    <!-- Chapter Management Section -->
    <div class="knowledge-edit-page__section">
      <div class="knowledge-edit-page__chapter-header">
        <span class="knowledge-edit-page__section-title">类目管理</span>
        <div class="knowledge-edit-page__chapter-header-actions">
          <el-button text type="primary" @click="addChapter">+ 添加类目</el-button>
          <el-button @click="handleAiGenerate" :loading="aiGenerating">AI 生成大纲</el-button>
        </div>
      </div>

      <div v-if="chapters.length === 0 && !aiGenerating" class="knowledge-edit-page__empty">
        <p>暂无类目，请手动添加或使用 AI 生成大纲</p>
      </div>

      <div v-if="aiGenerating" class="knowledge-edit-page__ai-inline">
        <div class="knowledge-edit-page__ai-inline-header">
          <div class="knowledge-edit-page__ai-inline-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" style="animation: spin 1.5s linear infinite;">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"/>
            </svg>
          </div>
          <div class="knowledge-edit-page__ai-inline-info">
            <div class="knowledge-edit-page__ai-inline-text">{{ aiStep }}</div>
            <div class="knowledge-edit-page__ai-inline-time">已用时 {{ aiElapsed }}s</div>
          </div>
        </div>
        <div class="knowledge-edit-page__ai-log">
          <div
            v-for="(log, i) in aiLogs"
            :key="i"
            class="knowledge-edit-page__ai-log-item"
            :class="`knowledge-edit-page__ai-log-item--${log.type}`"
          >
            <span class="knowledge-edit-page__ai-log-time">[{{ log.time }}]</span>
            <span class="knowledge-edit-page__ai-log-msg">{{ log.message }}</span>
          </div>
        </div>
      </div>

      <div v-for="(chapter, chIndex) in chapters" :key="chapter.tempId" class="knowledge-edit-page__chapter">
        <!-- Chapter Header -->
        <div class="knowledge-edit-page__chapter-bar">
          <div class="knowledge-edit-page__chapter-bar-left">
            <span class="knowledge-edit-page__drag-handle" title="拖拽排序">≡</span>
            <el-input
              v-model="chapter.name"
              placeholder="请输入类目名称"
              class="knowledge-edit-page__chapter-name-input"
            />
          </div>
          <div class="knowledge-edit-page__chapter-bar-right">
            <el-button size="small" :disabled="chIndex === 0" @click="moveChapterUp(chIndex)" title="上移">▲</el-button>
            <el-button size="small" :disabled="chIndex === chapters.length - 1" @click="moveChapterDown(chIndex)" title="下移">▼</el-button>
            <el-button size="small" type="danger" plain @click="removeChapter(chIndex)">删除类目</el-button>
            <el-button
              size="small"
              text
              @click="toggleChapterExpand(chapter)"
            >
              {{ chapter.expanded ? '▼' : '▶' }}
            </el-button>
          </div>
        </div>

        <!-- Chapter Expanded Content -->
        <div v-show="chapter.expanded" class="knowledge-edit-page__chapter-body">
          <!-- Preview Mode -->
          <template v-if="!chapter.editingDetail">
            <div class="knowledge-edit-page__chapter-preview">
              <div v-if="chapter.goal" class="knowledge-edit-page__chapter-preview-row">
                <span class="knowledge-edit-page__chapter-preview-label">目标：</span>
                <span class="knowledge-edit-page__chapter-preview-text">{{ chapter.goal }}</span>
              </div>
              <div v-if="chapter.description" class="knowledge-edit-page__chapter-preview-row">
                <span class="knowledge-edit-page__chapter-preview-label">概述：</span>
                <span class="knowledge-edit-page__chapter-preview-text">{{ chapter.description }}</span>
              </div>
              <div v-if="!chapter.goal && !chapter.description" class="knowledge-edit-page__chapter-preview-empty">
                暂未填写目标与概述
              </div>
              <el-button size="small" text type="primary" @click="toggleEditingDetail(chapter)">编辑基本信息</el-button>
            </div>
          </template>

          <!-- Edit Mode -->
          <div v-if="chapter.editingDetail" class="knowledge-edit-page__chapter-fields">
            <div class="knowledge-edit-page__field">
              <label class="knowledge-edit-page__field-label">学习目标</label>
              <el-input
                v-model="chapter.goal"
                placeholder="请输入本章学习目标（选填）"
              />
            </div>
            <div class="knowledge-edit-page__field">
              <label class="knowledge-edit-page__field-label">类目概述</label>
              <el-input
                v-model="chapter.description"
                type="textarea"
                :rows="3"
                placeholder="请输入类目概述（选填）"
              />
            </div>
            <el-button size="small" text type="primary" @click="toggleEditingDetail(chapter)">完成编辑</el-button>
          </div>

          <!-- Sections List -->
          <div class="knowledge-edit-page__sections">
            <div class="knowledge-edit-page__sections-header">
              <span class="knowledge-edit-page__sections-label">章节列表</span>
              <el-button text type="primary" @click="addSection(chIndex)">+ 添加章节</el-button>
            </div>

            <div
              v-for="(section, secIndex) in chapter.sections"
              :key="section.tempId"
              class="knowledge-edit-page__section-row"
            >
              <span class="knowledge-edit-page__drag-handle" title="拖拽排序">≡</span>
              <el-input
                v-model="section.title"
                placeholder="章节标题"
                class="knowledge-edit-page__section-title-input"
              />
              <el-input
                v-model="section.knowledgePoint"
                placeholder="知识点"
                class="knowledge-edit-page__section-kp-input"
              />
              <el-button
                v-if="section.id !== null && knowledgeId"
                size="small"
                text
                type="primary"
                @click="navigateToSectionEdit(knowledgeId!, chapter.id!, section.id!)"
              >
                编辑内容
              </el-button>
              <el-button
                v-if="section.id !== null"
                size="small"
                text
                type="primary"
                @click="navigateToSectionQuestions(chapter.id!, section.id!, chapter.name, section.title)"
              >
                题目
              </el-button>
              <el-button
                v-if="section.id !== null"
                size="small"
                text
                @click="handlePreviewSection(section.id!)"
              >
                预览
              </el-button>
              <el-button size="small" :disabled="secIndex === 0" text @click="moveSectionUp(chIndex, secIndex)" title="上移">▲</el-button>
              <el-button size="small" :disabled="secIndex === chapter.sections.length - 1" text @click="moveSectionDown(chIndex, secIndex)" title="下移">▼</el-button>
              <el-button size="small" type="danger" plain @click="removeSection(chIndex, secIndex)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="knowledge-edit-page__bottom-bar">
      <el-button @click="goBack">← 返回列表</el-button>
      <div class="knowledge-edit-page__bottom-actions">
        <el-button @click="handleSave('草稿')">保存草稿</el-button>
        <el-button type="primary" @click="handleSave('展示')">展示发布</el-button>
      </div>
    </div>

    <!-- Section Preview Dialog -->
    <el-dialog
      v-model="previewDialogVisible"
      title="章节预览"
      width="800px"
      :close-on-click-modal="true"
    >
      <div v-loading="previewLoading" class="knowledge-edit-page__preview-body">
        <div class="knowledge-edit-page__preview-phone">
          <div class="knowledge-edit-page__preview-statusbar">
            <span>9:41</span>
          </div>
          <div class="knowledge-edit-page__preview-urlbar">
            <span>{{ previewSection?.title || '章节详情' }}</span>
          </div>
          <div class="knowledge-edit-page__preview-content">
            <div
              v-if="previewSection?.htmlContent"
              v-html="previewSection.htmlContent"
            />
            <div v-else class="knowledge-edit-page__preview-empty">
              该章节暂无内容
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<style scoped lang="scss">
.knowledge-edit-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 100px;

  &__breadcrumb {
    :deep(.el-breadcrumb__inner) {
      color: var(--app-text-secondary);
      font-size: 13px;

      &.is-link {
        color: var(--app-text-secondary);

        &:hover {
          color: var(--app-primary-color);
        }
      }
    }

    :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
      color: var(--app-text-primary);
      font-weight: 500;
    }
  }

  &__top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-family: var(--app-font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__top-actions {
    display: flex;
    gap: 12px;
  }

  // Section Card
  &__section {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 24px;
  }

  &__section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin-bottom: 20px;
  }

  // Chapter Header
  &__chapter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;

    .knowledge-edit-page__section-title {
      margin-bottom: 0;
    }
  }

  &__chapter-header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__empty {
    text-align: center;
    padding: 40px 0;
    color: var(--app-text-secondary);
    font-size: 14px;
  }

  &__ai-inline {
    display: flex;
    flex-direction: column;
    padding: 32px;
    gap: 16px;
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
  }

  &__ai-inline-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__ai-inline-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__ai-inline-icon {
    color: var(--app-primary-color);
    flex-shrink: 0;
  }

  &__ai-inline-text {
    font-size: 15px;
    font-weight: 500;
    color: var(--app-text-primary);
  }

  &__ai-inline-time {
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__ai-log {
    max-height: 300px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    background: var(--app-bg-color);
    border-radius: 8px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--app-border-color);
      border-radius: 2px;
    }
  }

  &__ai-log-item {
    display: flex;
    gap: 8px;
    padding: 2px 0;

    &--started .knowledge-edit-page__ai-log-msg { color: var(--app-primary-color); }
    &--progress .knowledge-edit-page__ai-log-msg { color: var(--app-text-regular); }
    &--completed .knowledge-edit-page__ai-log-msg { color: var(--app-success-color); font-weight: 500; }
    &--error .knowledge-edit-page__ai-log-msg { color: var(--app-danger-color); }
  }

  &__ai-log-time {
    color: var(--app-text-secondary);
    flex-shrink: 0;
    white-space: nowrap;
  }

  &__ai-log-msg {
    color: var(--app-text-regular);
    word-break: break-all;
  }

  // Chapter Item
  &__chapter {
    margin-top: 16px;
    border: 1px solid var(--app-border-color);
    border-radius: 10px;
    overflow: hidden;
  }

  &__chapter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--app-bg-color);
    gap: 12px;
  }

  &__chapter-bar-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  &__chapter-bar-right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  &__drag-handle {
    font-size: 18px;
    color: var(--app-text-secondary);
    cursor: grab;
    user-select: none;
    flex-shrink: 0;

    &:active {
      cursor: grabbing;
    }
  }

  &__chapter-name-input {
    flex: 1;

    :deep(.el-input__inner) {
      font-weight: 500;
      font-size: 15px;
    }
  }

  // Chapter Body
  &__chapter-body {
    padding: 16px 16px 16px 40px;
    border-top: 1px solid var(--app-border-color);
  }

  &__chapter-fields {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 20px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__field-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--app-text-regular);
  }

  // Sections
  &__sections-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__sections-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  // Chapter preview (read-only mode)
  &__chapter-preview {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }

  &__chapter-preview-row {
    display: flex;
    gap: 8px;
    font-size: 13px;
    line-height: 1.6;
  }

  &__chapter-preview-label {
    color: var(--app-text-secondary);
    flex-shrink: 0;
    font-weight: 500;
  }

  &__chapter-preview-text {
    color: var(--app-text-regular);
  }

  &__chapter-preview-empty {
    font-size: 13px;
    color: var(--app-text-secondary);
    font-style: italic;
  }

  // Section preview dialog
  &__preview-body {
    display: flex;
    justify-content: center;
    padding: 8px 0;
  }

  &__preview-phone {
    width: 375px;
    border: 1px solid var(--app-border-color);
    border-radius: 20px;
    overflow: hidden;
    background: #FFFBEB;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  &__preview-statusbar {
    display: flex;
    justify-content: center;
    padding: 8px 0;
    font-size: 11px;
    color: #292524;
    background: #FFFFFF;
  }

  &__preview-urlbar {
    display: flex;
    justify-content: center;
    padding: 6px 16px;
    font-size: 11px;
    color: var(--app-text-secondary);
    background: #FEF3C7;
    border-bottom: 1px solid #FDE68A;
  }

  &__preview-content {
    padding: 16px;
    min-height: 200px;
    max-height: 500px;
    overflow-y: auto;
  }

  &__preview-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    font-size: 14px;
    color: var(--app-text-secondary);
  }

  &__section-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid var(--app-border-color-light);

    &:last-child {
      border-bottom: none;
    }
  }

  &__section-title-input {
    flex: 1;
    min-width: 120px;
  }

  &__section-kp-input {
    flex: 1.5;
    min-width: 150px;
  }

  // Bottom Bar
  &__bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    background: var(--app-bg-card);
    border-top: 1px solid var(--app-border-color);
    z-index: 100;
  }

  &__bottom-actions {
    display: flex;
    gap: 12px;
  }

  // AI Dialog
  &__ai-dialog {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__ai-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__ai-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--app-text-regular);
  }

  &__ai-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    gap: 16px;
    color: var(--app-text-secondary);
    font-size: 14px;
  }

  &__ai-result {
    border: 1px solid var(--app-border-color);
    border-radius: 8px;
    padding: 16px;
    max-height: 360px;
    overflow-y: auto;
  }

  &__ai-result-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--app-border-color);
  }

  &__ai-chapter-item {
    margin-bottom: 12px;
    padding: 10px 12px;
    background: var(--app-bg-color);
    border-radius: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__ai-chapter-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin-bottom: 4px;
  }

  &__ai-chapter-meta {
    font-size: 12px;
    color: var(--app-text-secondary);
    margin-bottom: 8px;
  }

  &__ai-section-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__ai-section-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 8px;
    font-size: 13px;
  }

  &__ai-section-title {
    color: var(--app-text-regular);
    font-weight: 500;
    white-space: nowrap;
  }

  &__ai-section-kp {
    color: var(--app-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__ai-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
