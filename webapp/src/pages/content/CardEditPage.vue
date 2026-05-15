<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { cardApi, knowledgeApi } from '@/api/modules/content'

interface ICategory {
  id: number
  name: string
}

interface IChapter {
  id: number
  categoryId: number
  name: string
}

interface ICascaderOption {
  value: number
  label: string
  children?: ICascaderOption[]
}

interface IFormData {
  title: string
  chapterIds: number[]
  difficulty: string
  estimatedMinutes: number
}

interface IEditorPanel {
  key: string
  label: string
  icon: string
  content: string
  collapsed: boolean
}

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => route.name === 'CardEdit')
const pageTitle = computed(() => isEdit.value ? '编辑卡片' : '新增卡片')
const cardId = computed(() => (isEdit.value ? Number(route.params.id) : null))

const formLoading = ref(false)
const formRef = ref()

const formData = reactive<IFormData>({
  title: '',
  chapterIds: [],
  difficulty: '入门',
  estimatedMinutes: 10
})

const cascaderOptions = ref<ICascaderOption[]>([])

const panels = reactive<IEditorPanel[]>([
  { key: 'conceptExplanation', label: '概念解释', icon: '📖', content: '', collapsed: false },
  { key: 'lifeAnalogy', label: '生活类比', icon: '💡', content: '', collapsed: false },
  { key: 'codeExample', label: '代码示例', icon: '💻', content: '', collapsed: false },
  { key: 'diagramExplanation', label: '图解说明', icon: '📊', content: '', collapsed: false },
  { key: 'summary', label: '要点总结', icon: '✅', content: '', collapsed: false },
  { key: 'interactiveQuestion', label: '互动提问', icon: '❓', content: '', collapsed: false }
])

const formRules = {
  title: [{ required: true, message: '请输入卡片标题', trigger: 'blur' }],
  chapterIds: [{ required: true, message: '请选择所属章节', trigger: 'change' }],
  estimatedMinutes: [
    { required: true, message: '请输入预计学习时长', trigger: 'blur' },
    { type: 'number', min: 1, max: 60, message: '时长范围为 1-60 分钟', trigger: 'blur' }
  ]
}

const difficultyOptions = [
  { label: '入门', value: '入门' },
  { label: '基础', value: '基础' },
  { label: '进阶', value: '进阶' }
]

function togglePanel(panel: IEditorPanel) {
  panel.collapsed = !panel.collapsed
}

async function buildCascaderOptions() {
  try {
    const catRes = await knowledgeApi.getCategories()
    if (catRes.code !== 0) return

    const categories = catRes.data as ICategory[]
    const chRes = await knowledgeApi.getChapters()
    if (chRes.code !== 0) return

    const chapters = chRes.data as IChapter[]

    cascaderOptions.value = categories.map((cat) => {
      const catChapters = chapters.filter((ch) => ch.categoryId === cat.id)
      return {
        value: cat.id,
        label: cat.name,
        children: catChapters.map((ch) => ({
          value: ch.id,
          label: ch.name
        }))
      }
    })
  } catch {
    ElMessage.error('加载章节数据失败')
  }
}

async function fetchCardDetail() {
  if (!cardId.value) return
  formLoading.value = true
  try {
    const res = await cardApi.getCard(cardId.value)
    if (res.code === 0) {
      const card = res.data as Record<string, unknown>
      formData.title = card.title as string || ''
      formData.chapterIds = card.chapterIds as number[] || []
      formData.difficulty = card.difficulty as string || '入门'
      formData.estimatedMinutes = card.estimatedMinutes as number || 10

      // Load editor content
      const panelMap: Record<string, string> = {
        conceptExplanation: 'conceptExplanation',
        lifeAnalogy: 'lifeAnalogy',
        codeExample: 'codeExample',
        diagramExplanation: 'diagramExplanation',
        summary: 'summary',
        interactiveQuestion: 'interactiveQuestion'
      }

      panels.forEach((panel) => {
        const field = panelMap[panel.key]
        if (field && card[field]) {
          panel.content = card[field] as string
        }
      })
    } else {
      ElMessage.error(res.message || '获取卡片详情失败')
    }
  } catch {
    ElMessage.error('获取卡片详情失败，请稍后重试')
  } finally {
    formLoading.value = false
  }
}

function goBack() {
  router.push('/content/cards')
}

async function handleSave(status: string) {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const chapterIds = formData.chapterIds
  const chapterId = chapterIds.length > 0 ? chapterIds[chapterIds.length - 1] : 0

  // Find the chapter name based on chapterIds
  let chapterName = '未分类'
  if (chapterIds.length >= 2) {
    for (const vol of cascaderOptions.value) {
      if (vol.value === chapterIds[0] && vol.children) {
        const ch = vol.children.find((c) => c.value === chapterIds[1])
        if (ch) {
          chapterName = ch.label
        }
      }
    }
  }

  const data: Record<string, unknown> = {
    title: formData.title,
    chapterId,
    chapterName,
    chapterIds: formData.chapterIds,
    difficulty: formData.difficulty,
    estimatedMinutes: formData.estimatedMinutes,
    status
  }

  panels.forEach((panel) => {
    if (panel.content) {
      data[panel.key] = panel.content
    }
  })

  try {
    if (isEdit.value && cardId.value) {
      const res = await cardApi.updateCard(cardId.value, data)
      if (res.code === 0) {
        ElMessage.success('卡片更新成功')
        goBack()
      } else {
        ElMessage.error(res.message || '更新失败')
      }
    } else {
      const res = await cardApi.createCard(data)
      if (res.code === 0) {
        ElMessage.success('卡片创建成功')
        goBack()
      } else {
        ElMessage.error(res.message || '创建失败')
      }
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  }
}

onMounted(async () => {
  await buildCascaderOptions()
  if (isEdit.value) {
    await fetchCardDetail()
  }
})
</script>

<template>
  <div class="card-edit-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="card-edit-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/content/cards' }">内容管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/content/cards' }">知识卡片</el-breadcrumb-item>
      <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Top Bar -->
    <div class="card-edit-page__top-bar">
      <h2 class="card-edit-page__title">{{ pageTitle }}</h2>
      <div class="card-edit-page__top-actions">
        <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
        <el-button @click="handleSave('草稿')">保存为草稿</el-button>
        <el-button type="primary" @click="handleSave('已上架')">保存并上架</el-button>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div v-loading="formLoading" class="card-edit-page__layout">
      <!-- Left Form Panel -->
      <div class="card-edit-page__left">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="90px"
          label-position="top"
        >
          <el-form-item label="卡片标题" prop="title">
            <el-input
              v-model="formData.title"
              placeholder="请输入卡片标题"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="所属章节" prop="chapterIds">
            <el-cascader
              v-model="formData.chapterIds"
              :options="cascaderOptions"
              placeholder="请选择所属篇章和章节"
              style="width: 100%"
              :props="{ checkStrictly: false }"
              clearable
            />
          </el-form-item>

          <el-form-item label="难度标签">
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

          <el-form-item label="预计时长（分钟）" prop="estimatedMinutes">
            <el-input-number
              v-model="formData.estimatedMinutes"
              :min="1"
              :max="60"
              controls-position="right"
              style="width: 100%"
              placeholder="1-60 分钟"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- Right Editor Area -->
      <div class="card-edit-page__right">
        <div class="card-edit-page__editor-placeholder">
          <div class="card-edit-page__editor-header">
            <span class="card-edit-page__editor-title">内容编辑</span>
            <span class="card-edit-page__editor-hint">编写卡片各部分内容，支持 Markdown 格式</span>
          </div>

          <!-- Editor Panels -->
          <div class="card-edit-page__panels">
            <div
              v-for="panel in panels"
              :key="panel.key"
              class="card-edit-page__panel"
              :class="{ 'card-edit-page__panel--collapsed': panel.collapsed }"
            >
              <div class="card-edit-page__panel-header" @click="togglePanel(panel)">
                <div class="card-edit-page__panel-title">
                  <span class="card-edit-page__panel-icon">{{ panel.icon }}</span>
                  <span class="card-edit-page__panel-label">{{ panel.label }}</span>
                </div>
                <el-icon :class="{ 'card-edit-page__panel-arrow--rotated': !panel.collapsed }">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                </el-icon>
              </div>
              <div v-show="!panel.collapsed" class="card-edit-page__panel-body">
                <el-input
                  v-model="panel.content"
                  type="textarea"
                  :rows="5"
                  :placeholder="`请在此输入${panel.label}内容...`"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card-edit-page {
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

  &__top-actions {
    display: flex;
    gap: 12px;
  }

  // Two Column Layout
  &__layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  &__left {
    width: 340px;
    flex-shrink: 0;
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 24px;
  }

  &__right {
    flex: 1;
    min-width: 0;
  }

  // Editor Area
  &__editor-placeholder {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  &__editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background-color: #FDFBF7;
    border-bottom: 1px solid var(--app-border-color);
  }

  &__editor-title {
    font-family: var(--app-font-heading);
    font-size: 15px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__editor-hint {
    font-size: 12px;
    color: var(--app-text-secondary);
  }

  // Panels
  &__panels {
    padding: 8px;
  }

  &__panel {
    margin-bottom: 4px;
    border-radius: 8px;
    overflow: hidden;
    background: var(--app-bg-color);
    transition: all 0.2s;

    &--collapsed {
      background: transparent;
    }
  }

  &__panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;

    &:hover {
      background-color: #FDFBF7;
    }
  }

  &__panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__panel-icon {
    font-size: 16px;
    width: 24px;
    text-align: center;
  }

  &__panel-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--app-text-regular);
  }

  &__panel-arrow {
    color: var(--app-text-secondary);
    transition: transform 0.2s;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__panel-body {
    padding: 0 16px 16px 48px;
  }
}
</style>
