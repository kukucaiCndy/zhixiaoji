<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, View, MagicStick } from '@element-plus/icons-vue'
import { cardApi, knowledgeApi } from '@/api/modules/content'

interface ICardItem {
  id: number
  title: string
  chapterName: string
  chapterId: number
  difficulty: string
  estimatedMinutes: number
  studyCount: number
  correctRate: number
  status: string
  updatedAt: string
}

interface IChapterOption {
  id: number
  name: string
}

const router = useRouter()

const cardList = ref<ICardItem[]>([])
const tableLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const selectedIds = ref<number[]>([])

const searchKeyword = ref('')
const filterChapterId = ref<number | undefined>(undefined)
const filterDifficulty = ref('')
const filterStatus = ref<string[]>([])
const chapterOptions = ref<IChapterOption[]>([])

const previewVisible = ref(false)
const previewCard = ref<ICardItem | null>(null)

const difficultyOptions = [
  { label: '入门', value: '入门' },
  { label: '基础', value: '基础' },
  { label: '进阶', value: '进阶' }
]

const statusOptions = [
  { label: '草稿', value: '草稿' },
  { label: '已上架', value: '已上架' },
  { label: '已下架', value: '已下架' }
]

const hasSelection = computed(() => selectedIds.value.length > 0)

function getStatusTagType(status: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (status) {
    case '已上架': return 'success'
    case '已下架': return 'info'
    case '草稿': return 'warning'
    default: return 'info'
  }
}

function getDifficultyTagType(difficulty: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (difficulty) {
    case '入门': return 'success'
    case '基础': return 'warning'
    case '进阶': return 'danger'
    default: return 'info'
  }
}

function formatCorrectRate(rate: number): string {
  return rate > 0 ? `${rate}%` : '-'
}

function formatStudyCount(count: number): string {
  return count > 0 ? count.toLocaleString() : '-'
}

async function fetchChapters() {
  try {
    const res = await knowledgeApi.getChapters()
    if (res.code === 0) {
      chapterOptions.value = (res.data as IChapterOption[]).map((ch) => ({
        id: ch.id,
        name: ch.name
      }))
    }
  } catch {
    // non-critical
  }
}

async function fetchCards() {
  tableLoading.value = true
  try {
    const params: Record<string, unknown> = {
      page: page.value,
      pageSize: pageSize.value
    }
    if (searchKeyword.value) {
      params.title = searchKeyword.value
    }
    if (filterChapterId.value) {
      params.chapterId = filterChapterId.value
    }
    if (filterDifficulty.value) {
      params.difficulty = filterDifficulty.value
    }
    if (filterStatus.value.length === 1) {
      params.status = filterStatus.value[0]
    }

    const res = await cardApi.getCards(params as {
      page: number
      pageSize: number
      title?: string
      chapterId?: number
      difficulty?: string
      status?: string
    })
    if (res.code === 0) {
      const data = res.data as { list: ICardItem[]; total: number }
      cardList.value = data.list
      total.value = data.total
    } else {
      ElMessage.error(res.message || '获取卡片列表失败')
    }
  } catch {
    ElMessage.error('获取卡片列表失败，请稍后重试')
  } finally {
    tableLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchCards()
}

function handleReset() {
  searchKeyword.value = ''
  filterChapterId.value = undefined
  filterDifficulty.value = ''
  filterStatus.value = []
  page.value = 1
  fetchCards()
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchCards()
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  fetchCards()
}

function handleSelectionChange(selection: ICardItem[]) {
  selectedIds.value = selection.map((item) => item.id)
}

function handleCreate() {
  router.push('/content/cards/create')
}

function handleEdit(card: ICardItem) {
  router.push(`/content/cards/${card.id}/edit`)
}

function handleAIGenerate() {
  router.push('/content/ai-generate')
}

async function handleDelete(card: ICardItem) {
  try {
    await ElMessageBox.confirm(
      `确定要删除卡片「${card.title}」吗？此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await cardApi.deleteCard(card.id)
    if (res.code === 0) {
      ElMessage.success('卡片删除成功')
      fetchCards()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleStatusChange(card: ICardItem, newStatus: string) {
  const actionLabel = newStatus === '已上架' ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(
      `确定要${actionLabel}卡片「${card.title}」吗？`,
      `${actionLabel}确认`,
      { confirmButtonText: `确定${actionLabel}`, cancelButtonText: '取消', type: 'warning' }
    )
    const res = await cardApi.batchUpdateStatus([card.id], newStatus)
    if (res.code === 0) {
      ElMessage.success(`${actionLabel}操作成功`)
      fetchCards()
    } else {
      ElMessage.error(res.message || `${actionLabel}失败`)
    }
  } catch {
    // user cancelled
  }
}

async function handleBatchAction(action: string) {
  const label = action === '已上架' ? '批量上架' : action === '已下架' ? '批量下架' : '批量删除'
  try {
    await ElMessageBox.confirm(
      `确定要${label}选中的 ${selectedIds.value.length} 条记录吗？`,
      `${label}确认`,
      { confirmButtonText: `确定${label}`, cancelButtonText: '取消', type: 'warning' }
    )
    if (action === '已上架' || action === '已下架') {
      const res = await cardApi.batchUpdateStatus(selectedIds.value, action)
      if (res.code === 0) {
        ElMessage.success(`${label}操作成功`)
        selectedIds.value = []
        fetchCards()
      } else {
        ElMessage.error(res.message || `${label}失败`)
      }
    } else if (action === 'delete') {
      const results = await Promise.allSettled(
        selectedIds.value.map((id) => cardApi.deleteCard(id))
      )
      const failed = results.filter((r) => r.status === 'rejected').length
      if (failed === 0) {
        ElMessage.success('批量删除成功')
      } else {
        ElMessage.warning(`部分删除失败：${failed} 条记录删除失败`)
      }
      selectedIds.value = []
      fetchCards()
    }
  } catch {
    // user cancelled
  }
}

function handlePreview(card: ICardItem) {
  previewCard.value = card
  previewVisible.value = true
}

onMounted(() => {
  fetchChapters()
  fetchCards()
})
</script>

<template>
  <div class="card-list-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="card-list-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>内容管理</el-breadcrumb-item>
      <el-breadcrumb-item>知识卡片</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Top Bar -->
    <div class="card-list-page__top-bar">
      <h2 class="card-list-page__title">知识卡片管理</h2>
      <div class="card-list-page__top-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          新增卡片
        </el-button>
        <el-button :icon="MagicStick" @click="handleAIGenerate">
          AI辅助
        </el-button>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card-list-page__filter-card">
      <div class="card-list-page__filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索卡片标题..."
          :prefix-icon="Search"
          clearable
          class="card-list-page__search-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      </div>
      <div class="card-list-page__filter-row card-list-page__filter-row--second">
        <div class="card-list-page__filter-item">
          <span class="card-list-page__filter-label">所属章节</span>
          <el-select
            v-model="filterChapterId"
            placeholder="全部章节"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="ch in chapterOptions"
              :key="ch.id"
              :label="ch.name"
              :value="ch.id"
            />
          </el-select>
        </div>
        <div class="card-list-page__filter-item">
          <span class="card-list-page__filter-label">难度</span>
          <el-radio-group v-model="filterDifficulty" @change="handleSearch">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button
              v-for="opt in difficultyOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="card-list-page__filter-item">
          <span class="card-list-page__filter-label">状态</span>
          <el-select
            v-model="filterStatus"
            placeholder="全部状态"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="2"
            @change="handleSearch"
          >
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- Batch Action Bar -->
    <div v-if="hasSelection" class="card-list-page__batch-bar">
      <span class="card-list-page__batch-info">
        已选 {{ selectedIds.length }} 项
      </span>
      <el-button @click="handleBatchAction('已上架')">批量上架</el-button>
      <el-button @click="handleBatchAction('已下架')">批量下架</el-button>
      <el-button type="danger" plain @click="handleBatchAction('delete')">批量删除</el-button>
    </div>

    <!-- Table -->
    <div class="card-list-page__table-card">
      <el-table
        v-loading="tableLoading"
        :data="cardList"
        row-key="id"
        class="card-list-page__table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />

        <el-table-column prop="title" label="卡片标题" min-width="200" show-overflow-tooltip>
          <template #default="{ row }: { row: ICardItem }">
            <el-button link type="primary" @click="handlePreview(row)">
              {{ row.title }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column prop="chapterName" label="所属章节" width="160" show-overflow-tooltip />

        <el-table-column label="难度" width="80" align="center">
          <template #default="{ row }: { row: ICardItem }">
            <el-tag :type="getDifficultyTagType(row.difficulty)" size="small">
              {{ row.difficulty }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="预计时长" width="90" align="center">
          <template #default="{ row }: { row: ICardItem }">
            {{ row.estimatedMinutes }} 分钟
          </template>
        </el-table-column>

        <el-table-column label="学习人数" width="100" align="center">
          <template #default="{ row }: { row: ICardItem }">
            {{ formatStudyCount(row.studyCount) }}
          </template>
        </el-table-column>

        <el-table-column label="正确率" width="90" align="center">
          <template #default="{ row }: { row: ICardItem }">
            <span
              class="card-list-page__correct-rate"
              :class="{
                'card-list-page__correct-rate--high': row.correctRate >= 85,
                'card-list-page__correct-rate--mid': row.correctRate >= 60 && row.correctRate < 85,
                'card-list-page__correct-rate--low': row.correctRate > 0 && row.correctRate < 60
              }"
            >
              {{ formatCorrectRate(row.correctRate) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }: { row: ICardItem }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="updatedAt" label="最后更新" width="140" align="center" />

        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }: { row: ICardItem }">
            <div class="card-list-page__actions">
              <el-button link type="primary" size="small" :icon="Edit" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button link type="primary" size="small" :icon="View" @click="handlePreview(row)">
                预览
              </el-button>
              <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
                删除
              </el-button>
              <template v-if="row.status === '已上架'">
                <el-button link type="warning" size="small" @click="handleStatusChange(row, '已下架')">
                  下架
                </el-button>
              </template>
              <template v-else>
                <el-button link type="success" size="small" @click="handleStatusChange(row, '已上架')">
                  上架
                </el-button>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Pagination -->
    <div class="card-list-page__pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      title="卡片预览"
      width="420px"
      :close-on-click-modal="true"
    >
      <div v-if="previewCard" class="card-list-page__preview">
        <div class="card-list-page__preview-phone">
          <div class="card-list-page__preview-header">
            <div class="card-list-page__preview-notch"></div>
            <span class="card-list-page__preview-title">知晓记</span>
          </div>
          <div class="card-list-page__preview-body">
            <div class="card-list-page__preview-card">
              <h4 class="card-list-page__preview-card-title">{{ previewCard.title }}</h4>
              <div class="card-list-page__preview-meta">
                <el-tag :type="getDifficultyTagType(previewCard.difficulty)" size="small">
                  {{ previewCard.difficulty }}
                </el-tag>
                <span class="card-list-page__preview-duration">{{ previewCard.estimatedMinutes }} 分钟</span>
              </div>
              <p class="card-list-page__preview-content">
                此为卡片「{{ previewCard.title }}」在小程序中的预览效果。详细内容请在编辑页查看。
              </p>
              <div class="card-list-page__preview-stats">
                <div class="card-list-page__preview-stat">
                  <span class="card-list-page__preview-stat-label">学习人数</span>
                  <span class="card-list-page__preview-stat-value">{{ formatStudyCount(previewCard.studyCount) }}</span>
                </div>
                <div class="card-list-page__preview-stat">
                  <span class="card-list-page__preview-stat-label">正确率</span>
                  <span class="card-list-page__preview-stat-value">{{ formatCorrectRate(previewCard.correctRate) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.card-list-page {
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

  // Filter Card
  &__filter-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__filter-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    &--second {
      padding-top: 0;
    }
  }

  &__search-input {
    width: 320px;
  }

  &__filter-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__filter-label {
    font-size: 13px;
    color: var(--app-text-secondary);
    white-space: nowrap;
  }

  // Batch Bar
  &__batch-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    background: var(--app-primary-light);
    border: 1px solid var(--app-primary-color);
    border-radius: 10px;
  }

  &__batch-info {
    font-size: 14px;
    color: var(--app-primary-color);
    font-weight: 500;
    margin-right: 8px;
  }

  // Table
  &__table-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  &__table {
    :deep(.el-table__header-wrapper) {
      .el-table__cell {
        background-color: #FDFBF7;
        color: var(--app-text-secondary);
        font-weight: 500;
        font-size: 13px;
        border-bottom: 1px solid var(--app-border-color);
        padding: 12px 0;

        &::before {
          display: none;
        }
      }
    }

    :deep(.el-table__body-wrapper) {
      .el-table__row {
        &:hover > td {
          background-color: #FDFBF7;
        }
      }

      .el-table__cell {
        border-bottom: 1px solid var(--app-border-light);
        padding: 14px 0;
      }
    }

    :deep(.el-table__empty-text) {
      color: var(--app-text-secondary);
    }
  }

  &__correct-rate {
    font-weight: 600;

    &--high {
      color: var(--app-success-color);
    }

    &--mid {
      color: var(--app-warning-color);
    }

    &--low {
      color: var(--app-danger-color);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: center;
    flex-wrap: wrap;
  }

  // Pagination
  &__pagination {
    display: flex;
    justify-content: flex-end;

    :deep(.el-pagination) {
      --el-pagination-bg-color: var(--app-bg-card);
      --el-pagination-button-bg-color: var(--app-bg-card);
    }
  }

  // Preview Dialog
  &__preview {
    display: flex;
    justify-content: center;
  }

  &__preview-phone {
    width: 320px;
    background: #fff;
    border: 2px solid #E8DED0;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  }

  &__preview-header {
    background: var(--app-primary-color);
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  &__preview-notch {
    width: 80px;
    height: 6px;
    background: #fff;
    border-radius: 3px;
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
  }

  &__preview-title {
    color: #fff;
    font-weight: 600;
    font-size: 15px;
  }

  &__preview-body {
    padding: 20px;
    min-height: 200px;
  }

  &__preview-card {
    background: var(--app-bg-color);
    border-radius: 12px;
    padding: 20px;
  }

  &__preview-card-title {
    font-family: var(--app-font-heading);
    font-size: 16px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin: 0 0 12px;
  }

  &__preview-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__preview-duration {
    font-size: 12px;
    color: var(--app-text-secondary);
  }

  &__preview-content {
    font-size: 13px;
    color: var(--app-text-regular);
    line-height: 1.6;
    margin: 0 0 16px;
  }

  &__preview-stats {
    display: flex;
    gap: 24px;
    padding-top: 12px;
    border-top: 1px solid var(--app-border-light);
  }

  &__preview-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__preview-stat-label {
    font-size: 11px;
    color: var(--app-text-secondary);
  }

  &__preview-stat-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text-primary);
  }
}
</style>
