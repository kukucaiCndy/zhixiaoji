<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Edit, Reading, Plus, View, MagicStick
} from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/modules/content'
import { sdk } from '@/api/sdk-client'
import IconDisplay from '@/components/IconDisplay.vue'
import type { ISubject, IChapter, ISection } from '@/mock/knowledge'
import type { IAiLogEntry } from '@/utils/aiLog'
import { extractAiLogMessage, formatElapsed } from '@/utils/aiLog'

// ==================== Types ====================

interface ISectionLocal {
  tempId: number
  id: number | null
  title: string
  knowledgePoint: string
  sortOrder: number
  htmlContent: string
}

interface IChapterLocal {
  tempId: number
  id: string | number | null
  name: string
  goal: string
  description: string
  sortOrder: number
  difficulty: string
  expanded: boolean
  sections: ISectionLocal[]
}

// ==================== Route & State ====================

const route = useRoute()
const router = useRouter()
const categoryId = computed(() => route.params.categoryId as string)
const subjectId = computed(() => route.params.subjectId as string)
const categoryName = computed(() => (route.query.categoryName as string) || '分类详情')

const subject = ref<ISubject | null>(null)
const chapters = ref<IChapterLocal[]>([])
const pageLoading = ref(false)
const isSaving = ref(false)

let tempIdCounter = 1
function genTempId() {
  return tempIdCounter++
}

// ==================== Difficulty ====================

const difficultyOptions = [
  { label: '入门', value: '入门' },
  { label: '基础', value: '基础' },
  { label: '进阶', value: '进阶' }
]

function getDifficultyTagType(difficulty: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (difficulty) {
    case '入门': return 'success'
    case '基础': return 'warning'
    case '进阶': return 'danger'
    default: return 'info'
  }
}

// ==================== Data Fetching ====================

async function fetchData() {
  pageLoading.value = true
  try {
    const [subRes, chRes] = await Promise.all([
      knowledgeApi.getSubject(subjectId.value),
      knowledgeApi.getChapters(subjectId.value),
    ])

    if (subRes.code === 0) {
      subject.value = subRes.data as ISubject
    }

    const chList = (chRes.code === 0 ? chRes.data : []) as IChapter[]
    if (chList.length > 0) {
      await loadChaptersWithSections(chList)
    }
  } catch {
    ElMessage.error('获取数据失败')
  } finally {
    pageLoading.value = false
  }
}

async function loadChaptersWithSections(chList: IChapter[]) {
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
      goal: ch.goal || '',
      description: ch.description || '',
      sortOrder: ch.sortOrder,
      difficulty: subject.value?.difficulty || '入门',
      expanded: false,
      sections: secList.map((sec) => ({
        tempId: genTempId(),
        id: sec.id,
        title: sec.title,
        knowledgePoint: sec.knowledgePoint,
        sortOrder: sec.sortOrder,
        htmlContent: sec.htmlContent || ''
      }))
    })
  })
  chapters.value = chaptersData
}

// ==================== Chapter CRUD ====================

function addChapter() {
  const sortOrder = chapters.value.length + 1
  chapters.value.push({
    tempId: genTempId(),
    id: null,
    name: '',
    goal: '',
    description: '',
    sortOrder,
    difficulty: subject.value?.difficulty || '入门',
    expanded: true,
    sections: []
  })
}

function removeChapter(index: number) {
  const ch = chapters.value[index]
  const label = ch.name || '章节 ' + (index + 1)
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
        ElMessage.error('删除章节失败，请稍后重试')
        return
      }
    }
    chapters.value.splice(index, 1)
    reorderChapters()
    ElMessage.success('章节已删除')
  }).catch(() => {})
}

function toggleChapterExpand(chapter: IChapterLocal) {
  chapter.expanded = !chapter.expanded
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

// ==================== Section CRUD ====================

function addSection(chapterIndex: number) {
  const chapter = chapters.value[chapterIndex]
  const sortOrder = chapter.sections.length + 1
  chapter.sections.push({
    tempId: genTempId(),
    id: null,
    title: '',
    knowledgePoint: '',
    sortOrder,
    htmlContent: ''
  })
}

function removeSection(chapterIndex: number, sectionIndex: number) {
  const chapter = chapters.value[chapterIndex]
  const section = chapter.sections[sectionIndex]
  const label = section.title || '小节 ' + (sectionIndex + 1)
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
        ElMessage.error('删除小节失败，请稍后重试')
        return
      }
    }
    chapter.sections.splice(sectionIndex, 1)
    reorderSections(chapter)
    ElMessage.success('小节已删除')
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

// ==================== Navigation ====================

function navigateToSectionEdit(chapterId: string | number | null, sectionId: number | null) {
  if (!chapterId || !sectionId) return
  const chapter = chapters.value.find((c) => String(c.id) === String(chapterId))
  router.push({
    path: `/content/knowledge/${categoryId.value}/subjects/${subjectId.value}/chapters/${chapterId}/sections/${sectionId}/edit`,
    query: {
      categoryName: categoryName.value,
      chapterName: chapter?.name || ''
    }
  })
}

function navigateToSectionQuestions(chapterId: string | number, sectionId: number | string, chapterName: string, sectionTitle: string) {
  router.push({
    path: `/content/knowledge/questions/${sectionId}`,
    query: {
      sectionTitle,
      chapterName,
      backRoute: `/content/knowledge/${categoryId.value}/subjects/${subjectId.value}/detail`
    }
  })
}

function handleGoBack() {
  router.push(`/content/knowledge/${categoryId.value}/detail`)
}

function handleEditSubject() {
  router.push({
    path: `/content/knowledge/${categoryId.value}/subjects/${subjectId.value}/edit`,
    query: { categoryName: categoryName.value }
  })
}

// ==================== Save ====================

function validate(): boolean {
  for (const ch of chapters.value) {
    if (!ch.name.trim()) {
      ElMessage.warning('请填写所有章节名称')
      return false
    }
    for (const sec of ch.sections) {
      if (!sec.title.trim()) {
        ElMessage.warning('请填写所有小节标题')
        return false
      }
    }
  }
  return true
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function saveChaptersAndSections() {
  for (const ch of chapters.value) {
    const chData: Record<string, unknown> = {
      knowledgeSystemId: subjectId.value,
      knowledgeSystemName: subject.value?.name || '',
      name: ch.name,
      goal: ch.goal,
      description: ch.description,
      sortOrder: ch.sortOrder,
      difficulty: ch.difficulty
    }

    let currentChapterId: string | number

    if (ch.id !== null) {
      const res = await knowledgeApi.updateChapter(ch.id, chData)
      if (res.code !== 0) throw new Error(res.message || '更新章节失败')
      currentChapterId = ch.id
    } else {
      const res = await knowledgeApi.createChapter(chData)
      if (res.code !== 0) throw new Error(res.message || '创建章节失败')
      const created = res.data as IChapter
      currentChapterId = created.id
      ch.id = currentChapterId
    }

    // Rate limit: pause before processing sections
    await delay(300)

    for (const sec of ch.sections) {
      const secData = {
        chapterId: currentChapterId,
        chapterName: ch.name,
        title: sec.title,
        knowledgePoint: sec.knowledgePoint,
        sortOrder: sec.sortOrder
      }

      if (sec.id !== null) {
        const res = await knowledgeApi.updateSection(sec.id, secData as Record<string, unknown>)
        if (res.code !== 0) throw new Error(res.message || '更新小节失败')
      } else {
        const res = await knowledgeApi.createSection(secData)
        if (res.code !== 0) throw new Error(res.message || '创建小节失败')
        const created = res.data as ISection
        sec.id = created.id
      }

      // Rate limit: pause between each section
      await delay(300)
    }
  }
}

async function handleSave() {
  if (!validate()) return
  isSaving.value = true
  try {
    await saveChaptersAndSections()
    ElMessage.success('保存成功')
  } catch (error) {
    const msg = error instanceof Error ? error.message : '保存失败，请稍后重试'
    ElMessage.error(msg)
  } finally {
    isSaving.value = false
  }
}

// ==================== AI Generate ====================

const aiGenerating = ref(false)
const aiElapsed = ref(0)
const aiStep = ref('')
const aiLogs = ref<IAiLogEntry[]>([])

async function handleAiGenerate() {
  if (!subject.value?.name.trim()) {
    ElMessage.warning('学科信息不完整')
    return
  }

  const name = subject.value.name.trim()
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
      inputParams: { topic: name, level: subject.value.difficulty || '入门' }
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
              sortOrder: si + 1,
              htmlContent: ''
            }))
          }))
          hasCompleted = true
          ElMessage.success(`大纲生成成功，共 ${chaptersArray.length} 个章节`)
          break
        }
      } else if (event.type === 'error') {
        throw new Error(event.error || '工作流执行失败')
      }
      next = await stream.next()
    }
  } catch (err) {
    console.error('[AI生成大纲] 异常:', err)
    aiLogs.value.push({ type: 'error', time: formatElapsed(aiElapsed.value), message: `异常：${String(err)}` })
  }

  if (!hasCompleted) {
    ElMessage.error('AI 生成大纲失败')
  }

  clearInterval(elapsedTimer)
  aiGenerating.value = false
  aiElapsed.value = 0
  aiStep.value = ''
}

// ==================== Preview Dialog ====================

const previewDialogVisible = ref(false)
const previewSection = ref<ISection | null>(null)
const previewLoading = ref(false)

function handlePreviewSection(sectionId: number) {
  previewLoading.value = true
  previewDialogVisible.value = true
  try {
    // Find section data from already-loaded chapters
    for (const ch of chapters.value) {
      const sec = ch.sections.find((s) => s.id === sectionId)
      if (sec) {
        previewSection.value = {
          id: sectionId,
          title: sec.title,
          htmlContent: sec.htmlContent,
          chapterId: 0,
          chapterName: '',
          knowledgePoint: sec.knowledgePoint,
          sortOrder: sec.sortOrder
        } as ISection
        return
      }
    }
    ElMessage.error('未找到小节数据')
  } catch {
    ElMessage.error('获取小节内容失败')
  } finally {
    previewLoading.value = false
  }
}

// ==================== Lifecycle ====================

onMounted(fetchData)
</script>

<template>
  <div v-loading="pageLoading" class="subject-detail-page">
    <template v-if="!pageLoading && subject">
      <!-- Breadcrumb -->
      <el-breadcrumb class="subject-detail-page__breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/content/knowledge' }">内容管理</el-breadcrumb-item>
        <el-breadcrumb-item
          :to="{ path: `/content/knowledge/${categoryId}/detail` }"
        >
          {{ categoryName }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ subject.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- Top Bar -->
      <div class="subject-detail-page__top-bar">
        <el-button
          text
          :icon="ArrowLeft"
          class="subject-detail-page__back-btn"
          @click="handleGoBack"
        >
          返回学科列表
        </el-button>
        <div class="subject-detail-page__top-actions">
          <el-button :icon="Edit" @click="handleEditSubject">
            编辑学科信息
          </el-button>
          <el-button type="primary" :loading="isSaving" @click="handleSave">
            保存
          </el-button>
        </div>
      </div>

      <!-- Subject Info Card -->
      <div class="subject-detail-page__info-card">
        <div class="subject-detail-page__info-main">
          <div class="subject-detail-page__info-header">
            <span class="subject-detail-page__info-icon"><IconDisplay :icon="subject.icon" /></span>
            <h1 class="subject-detail-page__info-title">{{ subject.name }}</h1>
            <el-tag
              :type="getDifficultyTagType(subject.difficulty)"
              size="small"
              effect="plain"
            >
              {{ subject.difficulty }}
            </el-tag>
          </div>
        </div>
        <div class="subject-detail-page__info-stats">
          <div class="subject-detail-page__stat-item">
            <span class="subject-detail-page__stat-value">{{ chapters.length }}</span>
            <span class="subject-detail-page__stat-label">章节</span>
          </div>
          <div class="subject-detail-page__stat-divider" />
          <div class="subject-detail-page__stat-item">
            <span class="subject-detail-page__stat-value">{{ subject.lessonCount }}</span>
            <span class="subject-detail-page__stat-label">课时</span>
          </div>
        </div>
      </div>

      <!-- Chapter Management Section -->
      <div class="subject-detail-page__chapter-area">
        <div class="subject-detail-page__chapter-header">
          <h2 class="subject-detail-page__chapter-title">
            <el-icon><Reading /></el-icon>
            章节管理
          </h2>
          <div class="subject-detail-page__chapter-actions">
            <el-button :icon="MagicStick" @click="handleAiGenerate" :loading="aiGenerating">
              AI 生成章节
            </el-button>
            <el-button type="primary" :icon="Plus" @click="addChapter">
              添加章节
            </el-button>
          </div>
        </div>

        <!-- AI Generating State -->
        <div v-if="aiGenerating" class="subject-detail-page__ai-inline">
          <div class="subject-detail-page__ai-inline-header">
            <el-icon class="subject-detail-page__ai-inline-icon" :size="36">
              <svg viewBox="0 0 24 24" width="36" height="36"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="31.4 31.4"/></svg>
            </el-icon>
            <div class="subject-detail-page__ai-inline-info">
              <p class="subject-detail-page__ai-inline-text">{{ aiStep }}</p>
              <p class="subject-detail-page__ai-inline-time">已用时 {{ aiElapsed }}s</p>
            </div>
          </div>
          <div class="subject-detail-page__ai-log">
            <div
              v-for="(log, i) in aiLogs"
              :key="i"
              class="subject-detail-page__ai-log-item"
              :class="`subject-detail-page__ai-log-item--${log.type}`"
            >
              <span class="subject-detail-page__ai-log-time">[{{ log.time }}]</span>
              <span class="subject-detail-page__ai-log-msg">{{ log.message }}</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="chapters.length === 0 && !aiGenerating" class="subject-detail-page__empty">
          <el-empty description="暂无章节数据，请手动添加或使用 AI 生成" />
        </div>

        <!-- Chapter List -->
        <div v-else class="subject-detail-page__chapter-list">
          <div
            v-for="(chapter, chIndex) in chapters"
            :key="chapter.tempId"
            class="subject-detail-page__chapter-card"
          >
            <!-- Chapter Header Bar -->
            <div class="subject-detail-page__chapter-bar">
              <div class="subject-detail-page__chapter-bar-left">
                <span class="subject-detail-page__drag-handle" title="拖拽排序">≡</span>
                <el-input
                  v-model="chapter.name"
                  placeholder="请输入章节名称"
                  class="subject-detail-page__chapter-name-input"
                />
              </div>
              <div class="subject-detail-page__chapter-bar-right">
                <el-select v-model="chapter.difficulty" size="small" style="width: 90px">
                  <el-option
                    v-for="opt in difficultyOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <el-button size="small" :disabled="chIndex === 0" @click="moveChapterUp(chIndex)" title="上移">▲</el-button>
                <el-button size="small" :disabled="chIndex === chapters.length - 1" @click="moveChapterDown(chIndex)" title="下移">▼</el-button>
                <el-button size="small" type="danger" plain @click="removeChapter(chIndex)">删除</el-button>
                <el-button
                  size="small"
                  text
                  @click="toggleChapterExpand(chapter)"
                >
                  {{ chapter.expanded ? '收起' : '展开' }}
                </el-button>
              </div>
            </div>

            <!-- Chapter Expanded Content -->
            <div v-show="chapter.expanded" class="subject-detail-page__chapter-body">
              <!-- Chapter Detail Edit -->
              <div class="subject-detail-page__chapter-fields">
                <div class="subject-detail-page__field">
                  <label class="subject-detail-page__field-label">学习目标</label>
                  <el-input
                    v-model="chapter.goal"
                    placeholder="请输入本章学习目标（选填）"
                  />
                </div>
                <div class="subject-detail-page__field">
                  <label class="subject-detail-page__field-label">章节概述</label>
                  <el-input
                    v-model="chapter.description"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入章节概述（选填）"
                  />
                </div>
              </div>

              <!-- Sections List -->
              <div class="subject-detail-page__sections">
                <div class="subject-detail-page__sections-header">
                  <span class="subject-detail-page__sections-label">小节列表</span>
                  <el-button text type="primary" :icon="Plus" @click="addSection(chIndex)">
                    添加小节
                  </el-button>
                </div>

                <div v-if="chapter.sections.length === 0" class="subject-detail-page__section-empty">
                  暂无小节，请点击上方按钮添加
                </div>

                <div
                  v-for="(section, secIndex) in chapter.sections"
                  :key="section.tempId"
                  class="subject-detail-page__section-row"
                >
                  <span class="subject-detail-page__drag-handle" title="拖拽排序">≡</span>
                  <div class="subject-detail-page__section-main">
                    <el-input
                      v-model="section.title"
                      placeholder="小节标题"
                      class="subject-detail-page__section-title-input"
                    />
                    <el-input
                      v-model="section.knowledgePoint"
                      placeholder="知识点"
                      class="subject-detail-page__section-kp-input"
                    />
                  </div>
                  <div class="subject-detail-page__section-actions">
                    <el-button
                      v-if="section.id !== null"
                      size="small"
                      text
                      type="primary"
                      :icon="Edit"
                      @click="navigateToSectionEdit(chapter.id, section.id)"
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
                      :icon="View"
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
        </div>
      </div>
    </template>

    <!-- Section Preview Dialog -->
    <el-dialog
      v-model="previewDialogVisible"
      title="小节预览"
      width="800px"
      :close-on-click-modal="true"
    >
      <div v-loading="previewLoading" class="subject-detail-page__preview-body">
        <div class="subject-detail-page__preview-phone">
          <div class="subject-detail-page__preview-statusbar">
            <span>9:41</span>
          </div>
          <div class="subject-detail-page__preview-urlbar">
            <span>{{ previewSection?.title || '小节详情' }}</span>
          </div>
          <div class="subject-detail-page__preview-content">
            <div
              v-if="previewSection?.htmlContent"
              v-html="previewSection.htmlContent"
            />
            <div v-else class="subject-detail-page__preview-empty">
              该小节暂无内容
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
.subject-detail-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 40px;

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

  &__top-actions {
    display: flex;
    gap: 12px;
  }

  &__back-btn {
    font-size: 14px;
    color: var(--app-text-secondary);

    &:hover {
      color: var(--app-primary-color);
    }
  }

  &__info-card {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    padding: 28px 32px;
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  &__info-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__info-header {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__info-icon {
    font-size: 36px;
    line-height: 1;
  }

  &__info-title {
    font-family: var(--app-font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__info-stats {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-shrink: 0;
    padding-left: 24px;
    border-left: 1px solid var(--app-border-color);
  }

  &__stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  &__stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--app-primary-color);
    line-height: 1;
    font-family: var(--app-font-heading);
  }

  &__stat-label {
    font-size: 12px;
    color: var(--app-text-secondary);
  }

  &__stat-divider {
    width: 1px;
    height: 40px;
    background: var(--app-border-color);
  }

  &__chapter-area {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__chapter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__chapter-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--app-font-heading);
    font-size: 18px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin: 0;

    .el-icon {
      font-size: 20px;
      color: var(--app-primary-color);
    }
  }

  &__chapter-actions {
    display: flex;
    gap: 12px;
  }

  &__empty {
    padding: 60px 20px;
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
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
    animation: spin 1.5s linear infinite;
    flex-shrink: 0;

    :deep(svg) circle {
      stroke: var(--app-primary-color);
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }
  }

  &__ai-inline-text {
    font-size: 15px;
    font-weight: 500;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__ai-inline-time {
    font-size: 13px;
    color: var(--app-text-secondary);
    margin: 0;
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

    &--started .subject-detail-page__ai-log-msg { color: var(--app-primary-color); }
    &--progress .subject-detail-page__ai-log-msg { color: var(--app-text-regular); }
    &--completed .subject-detail-page__ai-log-msg { color: var(--app-success-color); font-weight: 500; }
    &--error .subject-detail-page__ai-log-msg { color: var(--app-danger-color); }
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

  &__chapter-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__chapter-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    }
  }

  &__chapter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--app-bg-color);
    gap: 12px;
    flex-wrap: wrap;
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
    flex-wrap: wrap;
    justify-content: flex-end;
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

  &__sections {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__sections-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__sections-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__section-empty {
    padding: 20px;
    text-align: center;
    font-size: 13px;
    color: var(--app-text-secondary);
    background: #F8FAFC;
    border-radius: 8px;
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

  &__section-main {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  &__section-title-input {
    flex: 1;
    min-width: 120px;
  }

  &__section-kp-input {
    flex: 1.5;
    min-width: 150px;
  }

  &__section-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  // Preview Dialog
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
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}
</style>
