<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MagicStick, Refresh, DocumentCopy } from '@element-plus/icons-vue'
import { cardApi } from '@/api/modules/content'

interface IGenerateForm {
  contentType: string
  topic: string
  difficulty: string
  wordLimit: number
  requirements: string
}

interface IHistoryItem {
  id: number
  contentType: string
  topic: string
  createdAt: string
  status: string
}

const router = useRouter()

const generating = ref(false)
const hasResult = ref(false)

const generateForm = reactive<IGenerateForm>({
  contentType: '知识卡片',
  topic: '',
  difficulty: '入门',
  wordLimit: 500,
  requirements: ''
})

const generatedContent = ref({
  title: '',
  conceptExplanation: '',
  lifeAnalogy: '',
  codeExample: '',
  diagramExplanation: '',
  summary: '',
  interactiveQuestion: ''
})

const contentTypeOptions = [
  { label: '知识卡片', value: '知识卡片' },
  { label: '代码示例', value: '代码示例' },
  { label: '练习题', value: '练习题' },
  { label: '图解说明', value: '图解说明' }
]

const difficultyOptions = [
  { label: '入门', value: '入门' },
  { label: '基础', value: '基础' },
  { label: '进阶', value: '进阶' }
]

const historyList = ref<IHistoryItem[]>([
  { id: 1, contentType: '知识卡片', topic: 'Python变量作用域', createdAt: '2026-05-12 14:30', status: '已保存' },
  { id: 2, contentType: '代码示例', topic: '二分查找算法实现', createdAt: '2026-05-12 10:15', status: '已发布' },
  { id: 3, contentType: '练习题', topic: 'JavaScript闭包习题', createdAt: '2026-05-11 16:00', status: '已保存' },
  { id: 4, contentType: '图解说明', topic: 'HTTP请求响应流程', createdAt: '2026-05-11 09:30', status: '已保存' },
  { id: 5, contentType: '知识卡片', topic: 'CSS盒模型概念', createdAt: '2026-05-10 11:00', status: '草稿' },
  { id: 6, contentType: '代码示例', topic: '递归函数案例', createdAt: '2026-05-09 15:00', status: '已发布' },
  { id: 7, contentType: '知识卡片', topic: '数据结构-链表', createdAt: '2026-05-09 08:30', status: '草稿' },
  { id: 8, contentType: '练习题', topic: 'HTML表单验证', createdAt: '2026-05-08 14:00', status: '已保存' },
  { id: 9, contentType: '代码示例', topic: 'Python列表推导式', createdAt: '2026-05-08 09:00', status: '已发布' },
  { id: 10, contentType: '图解说明', topic: 'DNS解析过程', createdAt: '2026-05-07 16:30', status: '已保存' }
])

const canGenerate = computed(() => generateForm.topic.trim().length > 0)

function getContentTypeTagType(type: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (type) {
    case '知识卡片': return 'primary'
    case '代码示例': return 'success'
    case '练习题': return 'warning'
    case '图解说明': return 'info'
    default: return 'info'
  }
}

function getHistoryStatusTagType(status: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (status) {
    case '已发布': return 'success'
    case '已保存': return 'primary'
    case '草稿': return 'info'
    default: return 'info'
  }
}

async function handleGenerate() {
  if (!generateForm.topic.trim()) {
    ElMessage.warning('请输入知识点主题')
    return
  }

  generating.value = true
  hasResult.value = false

  // Simulate AI generation delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  generatedContent.value = {
    title: generateForm.topic,
    conceptExplanation: `## 概念解释\n\n${generateForm.topic} 是编程中一个重要的核心概念。在学习过程中，理解其本质含义对于后续深入学习至关重要。\n\n这个概念的核心在于：通过特定的语法或结构，实现对程序逻辑的控制和对数据的操作。`,
    lifeAnalogy: `## 生活类比\n\n可以把「${generateForm.topic}」理解成一个日常生活中的场景：\n\n想象你在整理书架，每个书架都有特定的编号，你需要按照一定规则将书放到正确的位置。这个查找和放置的过程就可以类比为程序中的相应操作。`,
    codeExample: '```python\n# ' + generateForm.topic + ' 的示例代码\n\nprint("Hello from ' + generateForm.topic + '!")\n\n# 简单示例\ndef demo_function():\n    return "This is a demo for ' + generateForm.topic + '"\n\nresult = demo_function()\nprint(result)\n```',
    diagramExplanation: `## 图解说明\n\n\`\`\`\n[概念输入] -> [处理逻辑] -> [输出结果]\n     |              |\n     v              v\n[数据准备]    [结果验证]\n\`\`\`\n\n流程图说明了 ${generateForm.topic} 的处理流程，从输入到输出的完整路径。`,
    summary: `## 要点总结\n\n- 核心概念：${generateForm.topic} 的基本定义和用途\n- 关键语法：需要掌握的基础语法结构\n- 常见误区：初学者容易犯的错误\n- 最佳实践：推荐的编码规范和使用方式\n- 进阶方向：该概念的深入学习和相关技术`,
    interactiveQuestion: `## 互动提问\n\n1. ${generateForm.topic} 的核心思想是什么？\n2. 在什么场景下最适合使用 ${generateForm.topic}？\n3. ${generateForm.topic} 有哪些常见的替代方案？\n4. 请尝试用自己的话向他人解释 ${generateForm.topic}。`
  }

  hasResult.value = true
  generating.value = false

  // Add to history
  historyList.value.unshift({
    id: Date.now(),
    contentType: generateForm.contentType,
    topic: generateForm.topic,
    createdAt: new Date().toLocaleString('zh-CN'),
    status: '草稿'
  })

  ElMessage.success('内容生成完成')
}

function handleRegenerate() {
  handleGenerate()
}

async function handleSaveDraft() {
  try {
    const panelData: Record<string, string> = {}
    const panelKeys: (keyof typeof generatedContent.value)[] = [
      'conceptExplanation',
      'lifeAnalogy',
      'codeExample',
      'diagramExplanation',
      'summary',
      'interactiveQuestion'
    ]
    panelKeys.forEach((key) => {
      panelData[key] = generatedContent.value[key]
    })

    const res = await cardApi.createCard({
      title: generatedContent.value.title,
      difficulty: generateForm.difficulty,
      estimatedMinutes: 10,
      status: '草稿',
      ...panelData
    })

    if (res.code === 0) {
      ElMessage.success('已保存为草稿')

      // Update latest history item status
      if (historyList.value.length > 0) {
        historyList.value[0].status = '已保存'
      }
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  }
}

async function handlePublish() {
  try {
    const panelData: Record<string, string> = {}
    const panelKeys: (keyof typeof generatedContent.value)[] = [
      'conceptExplanation',
      'lifeAnalogy',
      'codeExample',
      'diagramExplanation',
      'summary',
      'interactiveQuestion'
    ]
    panelKeys.forEach((key) => {
      panelData[key] = generatedContent.value[key]
    })

    const res = await cardApi.createCard({
      title: generatedContent.value.title,
      difficulty: generateForm.difficulty,
      estimatedMinutes: 10,
      status: '已上架',
      ...panelData
    })

    if (res.code === 0) {
      ElMessage.success('内容已直接发布')

      if (historyList.value.length > 0) {
        historyList.value[0].status = '已发布'
      }
    } else {
      ElMessage.error(res.message || '发布失败')
    }
  } catch {
    ElMessage.error('发布失败，请稍后重试')
  }
}

function handleCopyContent() {
  const content = generatedContent.value
  const fullText = [
    content.conceptExplanation,
    content.lifeAnalogy,
    content.codeExample,
    content.diagramExplanation,
    content.summary,
    content.interactiveQuestion
  ].join('\n\n')

  navigator.clipboard.writeText(fullText).then(() => {
    ElMessage.success('内容已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

function handleViewHistory(item: IHistoryItem) {
  generateForm.contentType = item.contentType
  generateForm.topic = item.topic
  ElMessage.info(`已加载历史记录：${item.topic}`)
}
</script>

<template>
  <div class="ai-generate-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="ai-generate-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>内容管理</el-breadcrumb-item>
      <el-breadcrumb-item>AI内容生成</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Top Bar -->
    <div class="ai-generate-page__top-bar">
      <h2 class="ai-generate-page__title">AI 内容生成</h2>
    </div>

    <!-- Two Column Layout -->
    <div class="ai-generate-page__layout">
      <!-- Left Config Panel -->
      <div class="ai-generate-page__left">
        <div class="ai-generate-page__config-card">
          <div class="ai-generate-page__config-title">
            <el-icon :size="18"><MagicStick /></el-icon>
            <span>生成配置</span>
          </div>

          <div class="ai-generate-page__config-form">
            <div class="ai-generate-page__form-group">
              <label class="ai-generate-page__form-label">内容类型</label>
              <el-radio-group v-model="generateForm.contentType" class="ai-generate-page__radio-col">
                <el-radio
                  v-for="opt in contentTypeOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </el-radio>
              </el-radio-group>
            </div>

            <div class="ai-generate-page__form-group">
              <label class="ai-generate-page__form-label">知识点主题</label>
              <el-input
                v-model="generateForm.topic"
                placeholder="例如：Python变量作用域"
                maxlength="100"
              />
            </div>

            <div class="ai-generate-page__form-group">
              <label class="ai-generate-page__form-label">目标难度</label>
              <el-radio-group v-model="generateForm.difficulty">
                <el-radio-button
                  v-for="opt in difficultyOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </el-radio-button>
              </el-radio-group>
            </div>

            <div class="ai-generate-page__form-group">
              <label class="ai-generate-page__form-label">字数限制</label>
              <el-input-number
                v-model="generateForm.wordLimit"
                :min="100"
                :max="5000"
                :step="100"
                controls-position="right"
                style="width: 100%"
              />
            </div>

            <div class="ai-generate-page__form-group">
              <label class="ai-generate-page__form-label">特殊要求</label>
              <el-input
                v-model="generateForm.requirements"
                type="textarea"
                :rows="4"
                placeholder="例如：请使用生活化的语言解释，适合零基础学习者..."
                maxlength="500"
                show-word-limit
              />
            </div>

            <el-button
              type="primary"
              :icon="MagicStick"
              :loading="generating"
              :disabled="!canGenerate"
              class="ai-generate-page__generate-btn"
              @click="handleGenerate"
            >
              {{ generating ? '正在生成...' : '生成内容' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- Right Result Panel -->
      <div class="ai-generate-page__right">
        <!-- No Result State -->
        <div v-if="!hasResult && !generating" class="ai-generate-page__empty-state">
          <div class="ai-generate-page__empty-icon">
            <MagicStick :size="64" />
          </div>
          <div class="ai-generate-page__empty-title">AI 内容生成</div>
          <div class="ai-generate-page__empty-desc">
            在左侧配置生成参数，点击"生成内容"按钮，AI 将自动为您生成高质量的教学内容
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="generating" class="ai-generate-page__loading-state">
          <el-icon class="ai-generate-page__loading-spin" :size="48" color="#D4916E">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
            </svg>
          </el-icon>
          <div class="ai-generate-page__loading-text">AI 正在生成内容，请稍候...</div>
        </div>

        <!-- Result -->
        <div v-if="hasResult" class="ai-generate-page__result-area">
          <div class="ai-generate-page__result-card">
            <div class="ai-generate-page__result-header">
              <div class="ai-generate-page__result-title-row">
                <h3 class="ai-generate-page__result-title">{{ generatedContent.title }}</h3>
                <el-tag :type="getContentTypeTagType(generateForm.contentType)" size="small">
                  {{ generateForm.contentType }}
                </el-tag>
              </div>
              <div class="ai-generate-page__result-actions">
                <el-button
                  :icon="Refresh"
                  size="small"
                  @click="handleRegenerate"
                >
                  重新生成
                </el-button>
                <el-button
                  :icon="DocumentCopy"
                  size="small"
                  @click="handleCopyContent"
                >
                  复制内容
                </el-button>
                <el-button size="small" @click="handleSaveDraft">
                  保存为草稿
                </el-button>
                <el-button type="primary" size="small" @click="handlePublish">
                  直接发布
                </el-button>
              </div>
            </div>

            <div class="ai-generate-page__result-body">
              <div class="ai-generate-page__result-section">
                <div class="ai-generate-page__section-content" v-html="generatedContent.conceptExplanation.replace(/\n/g, '<br>')"></div>
              </div>

              <div class="ai-generate-page__result-section">
                <div class="ai-generate-page__section-content" v-html="generatedContent.lifeAnalogy.replace(/\n/g, '<br>')"></div>
              </div>

              <div class="ai-generate-page__result-section">
                <pre class="ai-generate-page__code-block">{{ generatedContent.codeExample }}</pre>
              </div>

              <div class="ai-generate-page__result-section">
                <div class="ai-generate-page__section-content" v-html="generatedContent.diagramExplanation.replace(/\n/g, '<br>')"></div>
              </div>

              <div class="ai-generate-page__result-section">
                <div class="ai-generate-page__section-content" v-html="generatedContent.summary.replace(/\n/g, '<br>')"></div>
              </div>

              <div class="ai-generate-page__result-section">
                <div class="ai-generate-page__section-content" v-html="generatedContent.interactiveQuestion.replace(/\n/g, '<br>')"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- History Panel -->
        <div class="ai-generate-page__history-card">
          <div class="ai-generate-page__history-header">
            <span class="ai-generate-page__history-title">生成历史</span>
            <span class="ai-generate-page__history-count">最近 {{ historyList.length }} 条</span>
          </div>
          <div class="ai-generate-page__history-list">
            <div
              v-for="item in historyList"
              :key="item.id"
              class="ai-generate-page__history-item"
              @click="handleViewHistory(item)"
            >
              <div class="ai-generate-page__history-item-left">
                <el-tag :type="getContentTypeTagType(item.contentType)" size="small">
                  {{ item.contentType }}
                </el-tag>
                <span class="ai-generate-page__history-topic">{{ item.topic }}</span>
              </div>
              <div class="ai-generate-page__history-item-right">
                <el-tag :type="getHistoryStatusTagType(item.status)" size="small" effect="plain">
                  {{ item.status }}
                </el-tag>
                <span class="ai-generate-page__history-time">{{ item.createdAt }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-generate-page {
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

  &__title {
    font-family: var(--app-font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0;
  }

  // Two Column Layout
  &__layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  // Left Config
  &__left {
    width: 360px;
    flex-shrink: 0;
  }

  &__config-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  &__config-title {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 24px;
    background: #FDFBF7;
    border-bottom: 1px solid var(--app-border-color);
    font-family: var(--app-font-heading);
    font-size: 15px;
    font-weight: 600;
    color: var(--app-primary-color);
  }

  &__config-form {
    padding: 20px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__form-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--app-text-regular);
  }

  &__radio-col {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__generate-btn {
    width: 100%;
    height: 40px;
    font-size: 15px;
  }

  // Right Area
  &__right {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  // Empty State
  &__empty-state {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 80px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }

  &__empty-icon {
    color: var(--app-border-color);
    opacity: 0.6;
  }

  &__empty-title {
    font-family: var(--app-font-heading);
    font-size: 18px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__empty-desc {
    font-size: 14px;
    color: var(--app-text-secondary);
    max-width: 400px;
    line-height: 1.6;
  }

  // Loading State
  &__loading-state {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 80px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  &__loading-spin {
    animation: spin 1.5s linear infinite;
  }

  &__loading-text {
    font-size: 15px;
    color: var(--app-text-secondary);
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  // Result Card
  &__result-area {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  &__result-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  &__result-header {
    padding: 16px 24px;
    background: #FDFBF7;
    border-bottom: 1px solid var(--app-border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__result-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__result-title {
    font-family: var(--app-font-heading);
    font-size: 16px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__result-actions {
    display: flex;
    gap: 8px;
  }

  &__result-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-height: 500px;
    overflow-y: auto;
  }

  &__result-section {
    padding: 16px;
    background: var(--app-bg-color);
    border-radius: 8px;
    border: 1px solid var(--app-border-light);
  }

  &__section-content {
    font-size: 14px;
    color: var(--app-text-regular);
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__code-block {
    background: #1E1E1E;
    color: #D4D4D4;
    padding: 16px;
    border-radius: 8px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
  }

  // History Card
  &__history-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  &__history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    background: #FDFBF7;
    border-bottom: 1px solid var(--app-border-color);
  }

  &__history-title {
    font-family: var(--app-font-heading);
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__history-count {
    font-size: 12px;
    color: var(--app-text-secondary);
  }

  &__history-list {
    max-height: 320px;
    overflow-y: auto;
  }

  &__history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid var(--app-border-light);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #FDFBF7;
    }
  }

  &__history-item-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  &__history-item-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  &__history-topic {
    font-size: 13px;
    color: var(--app-text-regular);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__history-time {
    font-size: 12px;
    color: var(--app-text-secondary);
    white-space: nowrap;
  }
}
</style>
