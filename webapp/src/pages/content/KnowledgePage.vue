<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, FolderOpened, Edit } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/modules/content'
import type { ICategory } from '@/mock/knowledge'
import IconDisplay from '@/components/IconDisplay.vue'
import EmojiPicker from '@/components/EmojiPicker.vue'

const router = useRouter()

const categoryList = ref<ICategory[]>([])
const pageLoading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('全部')

const statusOptions = [
  { label: '全部', value: '全部' },
  { label: '展示', value: '展示' },
  { label: '隐藏', value: '隐藏' },
  { label: '草稿', value: '草稿' },
]

// Edit / Create dialog
const dialogMode = ref<'create' | 'edit'>('create')
const dialogVisible = ref(false)
const editingCategory = ref<ICategory | null>(null)
const dialogForm = reactive({ name: '', icon: '' })

function getStatusTagType(status: string): 'success' | 'info' | 'warning' | 'danger' {
  switch (status) {
    case '展示': return 'success'
    case '隐藏': return 'info'
    case '草稿': return 'warning'
    case '删除等待中': return 'danger'
    default: return 'info'
  }
}

function getCardGradient(index: number) {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ]
  return colors[index % colors.length]
}

async function fetchCategories() {
  pageLoading.value = true
  try {
    const res = await knowledgeApi.getCategories({
      status: statusFilter.value,
      keyword: searchKeyword.value,
    })
    if (res.code === 0) {
      categoryList.value = res.data as ICategory[]
    } else {
      ElMessage.error(res.message || '获取分类列表失败')
    }
  } catch {
    ElMessage.error('获取分类列表失败')
  } finally {
    pageLoading.value = false
  }
}

function handleCardClick(category: ICategory) {
  router.push({
    path: `/content/knowledge/${category.id}/detail`,
    query: {
      name: category.name,
      icon: category.icon || '',
      description: category.description || '',
      status: category.status || '',
      createdAt: category.createdAt || '',
    }
  })
}

function handleCreateCategory() {
  dialogMode.value = 'create'
  dialogForm.name = ''
  dialogForm.icon = '📚'
  dialogVisible.value = true
}

function handleOpenEdit(e: MouseEvent, category: ICategory) {
  e.stopPropagation()
  dialogMode.value = 'edit'
  editingCategory.value = category
  dialogForm.name = category.name || ''
  dialogForm.icon = category.icon || ''
  dialogVisible.value = true
}

async function handleSaveDialog() {
  if (!dialogForm.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  try {
    if (dialogMode.value === 'create') {
      const res = await knowledgeApi.createCategory({
        name: dialogForm.name,
        icon: dialogForm.icon,
      })
      if (res.code !== 0) {
        ElMessage.error(res.message || '创建失败')
        return
      }
      ElMessage.success('创建成功')
    } else {
      if (!editingCategory.value) return
      const res = await knowledgeApi.updateCategory(editingCategory.value.id, {
        name: dialogForm.name,
        icon: dialogForm.icon,
      })
      if (res.code !== 0) {
        ElMessage.error(res.message || '保存失败')
        return
      }
      ElMessage.success('保存成功')
    }
    dialogVisible.value = false
    editingCategory.value = null
    await fetchCategories()
  } catch {
    ElMessage.error(dialogMode.value === 'create' ? '创建失败，请稍后重试' : '保存失败，请稍后重试')
  }
}

function handleCloseDialog() {
  dialogVisible.value = false
  editingCategory.value = null
}

async function handleToggleStatus(category: ICategory) {
  try {
    const isVisible = category.status === '展示'
    const res = isVisible
      ? await knowledgeApi.hideCategory(category.id)
      : await knowledgeApi.showCategory(category.id)
    if (res.code === 0) {
      category.status = isVisible ? '隐藏' : '展示'
      ElMessage.success(isVisible ? '已隐藏' : '已展示')
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  }
}

function handleSearch() {
  fetchCategories()
}

function handleStatusChange() {
  fetchCategories()
}

onMounted(fetchCategories)
</script>

<template>
  <div v-loading="pageLoading" class="knowledge-page">
    <!-- Page Header -->
    <div class="knowledge-page__header">
      <div class="knowledge-page__header-left">
        <h1 class="knowledge-page__title">知识体系分类</h1>
        <p class="knowledge-page__subtitle">管理所有知识分类，点击分类查看下属学科</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="handleCreateCategory">
        新建分类
      </el-button>
    </div>

    <!-- Filters -->
    <div class="knowledge-page__filters">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索分类名称"
        :prefix-icon="Search"
        clearable
        class="knowledge-page__search"
        @keyup.enter="handleSearch"
      />
      <el-select
        v-model="statusFilter"
        placeholder="状态筛选"
        class="knowledge-page__status-filter"
        @change="handleStatusChange"
      >
        <el-option
          v-for="opt in statusOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>

    <!-- Category Cards Grid -->
    <div v-if="categoryList.length === 0" class="knowledge-page__empty">
      <el-empty description="暂无分类数据" />
    </div>

    <div v-else class="knowledge-page__card-grid">
      <div
        v-for="(category, index) in categoryList"
        :key="category.id"
        class="knowledge-page__card"
        @click="handleCardClick(category)"
      >
        <div
          class="knowledge-page__card-gradient"
          :style="{ background: getCardGradient(index) }"
        />
        <div class="knowledge-page__card-content">
          <div class="knowledge-page__card-header">
            <IconDisplay :icon="category.icon" class="knowledge-page__card-icon" />
            <div class="knowledge-page__card-header-right">
              <el-switch
                :model-value="category.status === '展示'"
                size="small"
                active-text=""
                inactive-text=""
                @click.stop
                @change="handleToggleStatus(category)"
              />
              <el-button
                text
                size="small"
                :icon="Edit"
                class="knowledge-page__card-edit-btn"
                @click="handleOpenEdit($event, category)"
              />
            </div>
          </div>
          <h3 class="knowledge-page__card-title">{{ category.name }}</h3>
          <p class="knowledge-page__card-desc">{{ category.description }}</p>
          <div class="knowledge-page__card-footer">
            <div class="knowledge-page__card-stat">
              <el-icon><FolderOpened /></el-icon>
              <span>{{ category.subjectCount }} 个学科</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create / Edit Dialog -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogMode === 'create' ? '新建分类' : '编辑分类'"
    width="420px"
    :close-on-click-modal="false"
    @close="handleCloseDialog"
  >
    <el-form label-position="top">
      <el-form-item label="图标">
        <EmojiPicker v-model="dialogForm.icon" />
      </el-form-item>
      <el-form-item label="名称">
        <el-input v-model="dialogForm.name" placeholder="请输入分类名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCloseDialog">取消</el-button>
      <el-button type="primary" @click="handleSaveDialog">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.knowledge-page {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  &__header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-family: var(--app-font-heading);
    font-size: 22px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__subtitle {
    font-size: 13px;
    color: var(--app-text-secondary);
    margin: 0;
  }

  &__filters {
    display: flex;
    gap: 12px;
  }

  &__search {
    width: 280px;
  }

  &__status-filter {
    width: 140px;
  }

  &__empty {
    padding: 60px 20px;
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
  }

  &__card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
    }
  }

  &__card-gradient {
    height: 6px;
    width: 100%;
    transition: height 0.3s ease;

    .knowledge-page__card:hover & {
      height: 8px;
    }
  }

  &__card-content {
    padding: 20px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__card-header-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__card-edit-btn {
    font-size: 15px;
    opacity: 0;
    transition: opacity 0.2s;

    .knowledge-page__card:hover & {
      opacity: 1;
    }
  }

  &__card-icon {
    font-size: 36px;
    line-height: 1;
  }

  &__card-title {
    font-family: var(--app-font-heading);
    font-size: 18px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__card-desc {
    font-size: 13px;
    color: var(--app-text-secondary);
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 42px;
  }

  &__card-footer {
    display: flex;
    align-items: center;
    padding-top: 12px;
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
}
</style>
