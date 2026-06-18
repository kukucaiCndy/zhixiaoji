<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Reading, Files, Clock, TrendCharts, MagicStick, Plus, Delete } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/modules/content'
import { sdk } from '@/api/sdk-client'
import type { ICategory, ISubject } from '@/mock/knowledge'
import IconDisplay from '@/components/IconDisplay.vue'
import type { IAiLogEntry } from '@/utils/aiLog'
import { extractAiLogMessage, formatElapsed } from '@/utils/aiLog'

const route = useRoute()
const router = useRouter()
const categoryId = computed(() => route.params.id as string)

const category = ref<ICategory | null>(null)
const subjects = ref<ISubject[]>([])
const pageLoading = ref(false)
const aiGenerating = ref(false)
const aiElapsed = ref(0)
const aiStep = ref('')
const aiLogs = ref<IAiLogEntry[]>([])

const gradientColors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
]

function getCardGradient(index: number) {
  return gradientColors[index % gradientColors.length]
}

function getDifficultyTagType(difficulty: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (difficulty) {
    case '入门': return 'success'
    case '基础': return 'warning'
    case '进阶': return 'danger'
    default: return 'info'
  }
}

function getStatusTagType(status: string): 'success' | 'info' | 'warning' | 'danger' {
  switch (status) {
    case '展示': return 'success'
    case '隐藏': return 'info'
    case '草稿': return 'warning'
    default: return 'info'
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function fetchData() {
  pageLoading.value = true
  try {
    // Try to read category info from query params (passed from KnowledgePage)
    const queryName = route.query.name as string
    if (queryName) {
      category.value = {
        id: categoryId.value as unknown as number,
        name: queryName,
        icon: (route.query.icon as string) || '📚',
        description: (route.query.description as string) || '',
        sortOrder: 0,
        subjectCount: 0,
        status: (route.query.status as string) || '展示',
        createdAt: (route.query.createdAt as string) || '',
        updatedAt: '',
      } as ICategory
    } else {
      // Fallback: fetch from API when navigating directly
      const catRes = await knowledgeApi.getCategory(categoryId.value)
      if (catRes.code === 0) {
        category.value = catRes.data as ICategory
      } else {
        ElMessage.error(catRes.message || '获取分类信息失败')
        return
      }
    }
    // Load subjects with counts (chapterCount, lessonCount)
    const subRes = await knowledgeApi.getSubjects({ categoryId: categoryId.value as unknown as number })
    if (subRes.code === 0) {
      subjects.value = subRes.data as ISubject[]
    } else {
      ElMessage.error(subRes.message || '获取学科列表失败')
    }
  } catch {
    ElMessage.error('获取数据失败')
  } finally {
    pageLoading.value = false
  }
}

function handleGoBack() {
  router.push('/content/knowledge')
}

function handleCardClick(subject: ISubject) {
  router.push({
    path: `/content/knowledge/${categoryId.value}/subjects/${subject.id}/detail`,
    query: { categoryName: category.value?.name || '' }
  })
}

async function handleAiCreateSubject() {
  if (!category.value?.name.trim()) {
    ElMessage.warning('分类信息不完整')
    return
  }

  const categoryName = category.value.name.trim()
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
      type: 'subject_generation' as any,
      inputParams: { category: categoryName }
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
        const subjectsArray = raw?.output as { name: string; icon: string; description: string; difficulty: string }[] | undefined
        if (subjectsArray && Array.isArray(subjectsArray)) {
          for (const sub of subjectsArray) {
            const res = await knowledgeApi.createSubject({
              name: sub.name,
              categoryId: categoryId.value,
              icon: sub.icon || '📚',
              description: sub.description || '',
              difficulty: sub.difficulty || '入门',
              sortOrder: subjects.value.length + 1,
              status: '展示',
            })
            if (res.code === 0) {
              subjects.value.push(res.data as ISubject)
            }
          }
          hasCompleted = true
          ElMessage.success(`学科生成成功，共 ${subjectsArray.length} 个`)
          break
        }
      } else if (event.type === 'error') {
        throw new Error(event.error || '工作流执行失败')
      }
      next = await stream.next()
    }
  } catch (err) {
    console.error('[AI生成学科] 异常:', err)
    aiLogs.value.push({ type: 'error', time: formatElapsed(aiElapsed.value), message: `异常：${String(err)}` })
  }

  if (!hasCompleted) {
    ElMessage.error('AI 生成学科失败')
  }

  clearInterval(elapsedTimer)
  aiGenerating.value = false
  aiElapsed.value = 0
  aiStep.value = ''
}

async function handleManualCreateSubject() {
  const res = await knowledgeApi.createSubject({
    name: '新学科',
    categoryId: categoryId.value,
    icon: '📚',
    difficulty: '入门',
    sortOrder: subjects.value.length + 1,
    status: '草稿',
  })
  if (res.code === 0) {
    subjects.value.push(res.data as ISubject)
    ElMessage.success('学科创建成功')
  } else {
    ElMessage.error(res.message || '创建失败')
  }
}

async function handleToggleSubjectStatus(_val: string | number | boolean, subject: ISubject) {
  try {
    const isPublished = subject.status === '展示'
    const res = isPublished
      ? await knowledgeApi.unpublishSubject(subject.id)
      : await knowledgeApi.publishSubject(subject.id)
    if (res.code === 0) {
      subject.status = isPublished ? '隐藏' : '展示'
      ElMessage.success(isPublished ? '已下架' : '已上架')
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  }
}

async function handleDeleteSubject(e: MouseEvent, subject: ISubject) {
  e.stopPropagation()
  try {
    await ElMessageBox.confirm(
      `确定要删除学科「${subject.name}」吗？删除后不可恢复。`,
      '确认删除',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await knowledgeApi.deleteSubject(subject.id)
    if (res.code === 0) {
      const idx = subjects.value.findIndex((s) => s.id === subject.id)
      if (idx !== -1) subjects.value.splice(idx, 1)
      ElMessage.success('学科已删除')
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // cancelled or error
  }
}

onMounted(fetchData)
</script>

<template>
  <div v-loading="pageLoading" class="knowledge-detail-page">
    <template v-if="!pageLoading && category">
      <!-- Breadcrumb -->
      <el-breadcrumb class="knowledge-detail-page__breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/content/knowledge' }">内容管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{ category.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- Top Bar -->
      <div class="knowledge-detail-page__top-bar">
        <el-button
          text
          :icon="ArrowLeft"
          class="knowledge-detail-page__back-btn"
          @click="handleGoBack"
        >
          返回分类列表
        </el-button>
        <div class="knowledge-detail-page__top-actions">
          <el-button type="primary" :icon="Plus" @click="handleManualCreateSubject">
            新建学科
          </el-button>
        </div>
      </div>

      <!-- Category Info Header -->
      <div class="knowledge-detail-page__category-header">
        <div class="knowledge-detail-page__category-icon"><IconDisplay :icon="category.icon" /></div>
        <div class="knowledge-detail-page__category-info">
          <h1 class="knowledge-detail-page__category-name">{{ category.name }}</h1>
          <div class="knowledge-detail-page__category-meta">
            <el-tag :type="getStatusTagType(category.status)" size="small" effect="plain">
              {{ category.status }}
            </el-tag>
            <span class="knowledge-detail-page__meta-item">
              <el-icon><Reading /></el-icon>
              {{ subjects.length }} 个学科
            </span>
            <span class="knowledge-detail-page__meta-item">
              <el-icon><Clock /></el-icon>
              {{ formatDate(category.createdAt) }}
            </span>
          </div>
          <p class="knowledge-detail-page__category-desc">{{ category.description }}</p>
        </div>
      </div>

      <!-- AI Generating State -->
      <div v-if="aiGenerating" class="knowledge-detail-page__ai-state">
        <div class="knowledge-detail-page__ai-state-header">
          <el-icon class="knowledge-detail-page__ai-state-icon" :size="36">
            <svg viewBox="0 0 24 24" width="36" height="36"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="31.4 31.4"/></svg>
          </el-icon>
          <div class="knowledge-detail-page__ai-state-info">
            <p class="knowledge-detail-page__ai-state-text">{{ aiStep }}</p>
            <p class="knowledge-detail-page__ai-state-time">已用时 {{ aiElapsed }}s</p>
          </div>
        </div>
        <div class="knowledge-detail-page__ai-log">
          <div
            v-for="(log, i) in aiLogs"
            :key="i"
            class="knowledge-detail-page__ai-log-item"
            :class="`knowledge-detail-page__ai-log-item--${log.type}`"
          >
            <span class="knowledge-detail-page__ai-log-time">[{{ log.time }}]</span>
            <span class="knowledge-detail-page__ai-log-msg">{{ log.message }}</span>
          </div>
        </div>
      </div>

      <!-- Subject Cards Grid -->
      <div class="knowledge-detail-page__section-title">
        <h2>学科列表</h2>
        <span class="knowledge-detail-page__section-count">共 {{ subjects.length }} 个</span>
      </div>

      <div v-if="subjects.length === 0 && !aiGenerating" class="knowledge-detail-page__empty">
        <el-empty description="暂无学科内容，请使用 AI 生成或手动创建" />
      </div>

      <div v-else class="knowledge-detail-page__card-grid">
        <div
          v-for="(subject, index) in subjects"
          :key="subject.id"
          class="knowledge-detail-page__card"
          @click="handleCardClick(subject)"
        >
          <!-- Card Top Gradient Bar -->
          <div
            class="knowledge-detail-page__card-gradient"
            :style="{ background: getCardGradient(index) }"
          />

          <!-- Card Content -->
          <div class="knowledge-detail-page__card-content">
            <div class="knowledge-detail-page__card-header">
              <span class="knowledge-detail-page__card-number">
                {{ String(index + 1).padStart(2, '0') }}
              </span>
              <div class="knowledge-detail-page__card-tags">
                <el-tag
                  :type="getDifficultyTagType(subject.difficulty)"
                  size="small"
                  effect="light"
                >
                  {{ subject.difficulty }}
                </el-tag>
                <div class="knowledge-detail-page__card-actions">
                  <el-switch
                    :model-value="subject.status === '展示'"
                    size="small"
                    @click.stop
                    @change="(val) => handleToggleSubjectStatus(val, subject)"
                  />
                  <el-button
                    text
                    size="small"
                    :icon="Delete"
                    type="danger"
                    class="knowledge-detail-page__card-del-btn"
                    @click="handleDeleteSubject($event, subject)"
                  />
                </div>
              </div>
            </div>

            <div class="knowledge-detail-page__card-main">
              <span class="knowledge-detail-page__card-icon"><IconDisplay :icon="subject.icon" /></span>
              <h3 class="knowledge-detail-page__card-title">{{ subject.name }}</h3>
            </div>

            <div class="knowledge-detail-page__card-footer">
              <div class="knowledge-detail-page__card-stat">
                <el-icon><Files /></el-icon>
                <span>{{ subject.chapterCount }} 章节</span>
              </div>
              <div class="knowledge-detail-page__card-stat">
                <el-icon><Reading /></el-icon>
                <span>{{ subject.lessonCount }} 课时</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.knowledge-detail-page {
  display: flex;
  flex-direction: column;
  gap: 20px;

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

  &__category-header {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 28px 32px;
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  &__category-icon {
    font-size: 48px;
    line-height: 1;
    flex-shrink: 0;
  }

  &__category-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__category-name {
    font-family: var(--app-font-heading);
    font-size: 22px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__category-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--app-text-secondary);

    .el-icon {
      font-size: 14px;
    }
  }

  &__category-desc {
    font-size: 14px;
    color: var(--app-text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  &__section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;

    h2 {
      font-family: var(--app-font-heading);
      font-size: 18px;
      font-weight: 600;
      color: var(--app-text-primary);
      margin: 0;
    }
  }

  &__section-count {
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__empty {
    padding: 60px 20px;
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
  }

  &__card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  &__card {
    position: relative;
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.25s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);

      .knowledge-detail-page__card-hover {
        opacity: 1;
      }
    }
  }

  &__card-gradient {
    height: 6px;
    width: 100%;
    transition: height 0.3s ease;

    .knowledge-detail-page__card:hover & {
      height: 8px;
    }
  }

  &__card-content {
    padding: 20px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__card-number {
    font-size: 28px;
    font-weight: 800;
    color: var(--app-border-color);
    line-height: 1;
    font-family: var(--app-font-heading);
  }

  &__card-tags {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  &__card-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;

    .knowledge-detail-page__card:hover & {
      opacity: 1;
    }
  }

  &__card-del-btn {
    font-size: 14px;
  }

  &__card-main {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__card-icon {
    font-size: 32px;
    line-height: 1;
  }

  &__card-title {
    font-family: var(--app-font-heading);
    font-size: 16px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin: 0;
    line-height: 1.5;
  }

  &__card-footer {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--app-border-color);
  }

  &__card-stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--app-text-secondary);

    .el-icon {
      font-size: 14px;
    }
  }

  &__ai-state {
    display: flex;
    flex-direction: column;
    padding: 32px;
    gap: 16px;
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
  }

  &__ai-state-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__ai-state-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__ai-state-icon {
    color: var(--app-primary-color);
    animation: spin 1.5s linear infinite;
    flex-shrink: 0;

    :deep(svg) circle {
      stroke: var(--app-primary-color);
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }
  }

  &__ai-state-text {
    font-size: 15px;
    font-weight: 500;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__ai-state-time {
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

    &--started .knowledge-detail-page__ai-log-msg { color: var(--app-primary-color); }
    &--progress .knowledge-detail-page__ai-log-msg { color: var(--app-text-regular); }
    &--completed .knowledge-detail-page__ai-log-msg { color: var(--app-success-color); font-weight: 500; }
    &--error .knowledge-detail-page__ai-log-msg { color: var(--app-danger-color); }
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
