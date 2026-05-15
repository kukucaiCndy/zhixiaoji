<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Upload, Download, Edit, Delete } from '@element-plus/icons-vue'
import { questionApi } from '@/api/modules/content'

interface IQuestionItem {
  id: number
  content: string
  type: string
  difficulty: string
  relatedCard: string
  correctRate: number
  answerCount: number
  status: string
  updatedAt: string
}

const router = useRouter()

const questionList = ref<IQuestionItem[]>([])
const tableLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const selectedIds = ref<number[]>([])

const searchContent = ref('')
const filterType = ref<string[]>([])
const filterDifficulty = ref('')
const filterStatus = ref<string[]>([])

const typeOptions = [
  { label: '单选题', value: '单选题' },
  { label: '多选题', value: '多选题' },
  { label: '判断题', value: '判断题' }
]

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

function getTypeTagType(type: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (type) {
    case '单选题': return 'primary'
    case '多选题': return 'success'
    case '判断题': return 'warning'
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

function formatAnswerCount(count: number): string {
  return count > 0 ? count.toLocaleString() : '-'
}

function truncateContent(content: string, maxLen = 40): string {
  if (content.length > maxLen) {
    return content.slice(0, maxLen) + '...'
  }
  return content
}

async function fetchQuestions() {
  tableLoading.value = true
  try {
    const params: Record<string, unknown> = {
      page: page.value,
      pageSize: pageSize.value
    }
    if (searchContent.value) {
      params.content = searchContent.value
    }
    if (filterType.value.length === 1) {
      params.type = filterType.value[0]
    }
    if (filterDifficulty.value) {
      params.difficulty = filterDifficulty.value
    }
    if (filterStatus.value.length === 1) {
      params.status = filterStatus.value[0]
    }

    const res = await questionApi.getQuestions(params as {
      page: number
      pageSize: number
      type?: string
      difficulty?: string
      status?: string
    })
    if (res.code === 0) {
      const data = res.data as { list: IQuestionItem[]; total: number }
      questionList.value = data.list
      total.value = data.total
    } else {
      ElMessage.error(res.message || '获取题目列表失败')
    }
  } catch {
    ElMessage.error('获取题目列表失败，请稍后重试')
  } finally {
    tableLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchQuestions()
}

function handleReset() {
  searchContent.value = ''
  filterType.value = []
  filterDifficulty.value = ''
  filterStatus.value = []
  page.value = 1
  fetchQuestions()
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchQuestions()
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  fetchQuestions()
}

function handleSelectionChange(selection: IQuestionItem[]) {
  selectedIds.value = selection.map((item) => item.id)
}

function handleCreate() {
  router.push('/content/questions/create')
}

function handleImport() {
  router.push('/content/questions/import')
}

async function handleExport() {
  try {
    const res = await questionApi.exportQuestions()
    if (res.code === 0) {
      const data = res.data as { url: string }
      ElMessage.success('导出成功，正在下载...')
      if (data.url) {
        window.open(data.url, '_blank')
      }
    } else {
      ElMessage.error(res.message || '导出失败')
    }
  } catch {
    ElMessage.error('导出失败，请稍后重试')
  }
}

function handleEdit(question: IQuestionItem) {
  router.push(`/content/questions/${question.id}/edit`)
}

async function handleDelete(question: IQuestionItem) {
  try {
    await ElMessageBox.confirm(
      `确定要删除题目「${truncateContent(question.content)}」吗？此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await questionApi.deleteQuestion(question.id)
    if (res.code === 0) {
      ElMessage.success('题目删除成功')
      fetchQuestions()
    } else {
      ElMessage.error(res.message || '删除失败')
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
      const res = await questionApi.batchUpdateStatus(selectedIds.value, action)
      if (res.code === 0) {
        ElMessage.success(`${label}操作成功`)
        selectedIds.value = []
        fetchQuestions()
      } else {
        ElMessage.error(res.message || `${label}失败`)
      }
    } else if (action === 'delete') {
      const results = await Promise.allSettled(
        selectedIds.value.map((id) => questionApi.deleteQuestion(id))
      )
      const failed = results.filter((r) => r.status === 'rejected').length
      if (failed === 0) {
        ElMessage.success('批量删除成功')
      } else {
        ElMessage.warning(`部分删除失败：${failed} 条记录删除失败`)
      }
      selectedIds.value = []
      fetchQuestions()
    }
  } catch {
    // user cancelled
  }
}

onMounted(() => {
  fetchQuestions()
})
</script>

<template>
  <div class="question-list-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="question-list-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>内容管理</el-breadcrumb-item>
      <el-breadcrumb-item>题目管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Top Bar -->
    <div class="question-list-page__top-bar">
      <h2 class="question-list-page__title">题目管理</h2>
      <div class="question-list-page__top-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          新增题目
        </el-button>
        <el-button :icon="Upload" @click="handleImport">
          批量导入
        </el-button>
        <el-button :icon="Download" @click="handleExport">
          批量导出
        </el-button>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="question-list-page__filter-card">
      <div class="question-list-page__filter-row">
        <el-input
          v-model="searchContent"
          placeholder="搜索题目内容..."
          :prefix-icon="Search"
          clearable
          class="question-list-page__search-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      </div>
      <div class="question-list-page__filter-row question-list-page__filter-row--second">
        <div class="question-list-page__filter-item">
          <span class="question-list-page__filter-label">题目类型</span>
          <el-select
            v-model="filterType"
            placeholder="全部类型"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="2"
            @change="handleSearch"
          >
            <el-option
              v-for="opt in typeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
        <div class="question-list-page__filter-item">
          <span class="question-list-page__filter-label">难度</span>
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
        <div class="question-list-page__filter-item">
          <span class="question-list-page__filter-label">状态</span>
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
    <div v-if="hasSelection" class="question-list-page__batch-bar">
      <span class="question-list-page__batch-info">
        已选 {{ selectedIds.length }} 项
      </span>
      <el-button @click="handleBatchAction('已上架')">批量上架</el-button>
      <el-button @click="handleBatchAction('已下架')">批量下架</el-button>
      <el-button type="danger" plain @click="handleBatchAction('delete')">批量删除</el-button>
    </div>

    <!-- Table -->
    <div class="question-list-page__table-card">
      <el-table
        v-loading="tableLoading"
        :data="questionList"
        row-key="id"
        class="question-list-page__table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />

        <el-table-column label="题目内容" min-width="260" show-overflow-tooltip>
          <template #default="{ row }: { row: IQuestionItem }">
            <el-tooltip :content="row.content" placement="top" :show-after="500">
              <span class="question-list-page__content-text">
                {{ truncateContent(row.content) }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="题目类型" width="100" align="center">
          <template #default="{ row }: { row: IQuestionItem }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="relatedCard" label="关联卡片" width="180" show-overflow-tooltip />

        <el-table-column label="难度" width="80" align="center">
          <template #default="{ row }: { row: IQuestionItem }">
            <el-tag :type="getDifficultyTagType(row.difficulty)" size="small">
              {{ row.difficulty }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="答题人数" width="100" align="center">
          <template #default="{ row }: { row: IQuestionItem }">
            {{ formatAnswerCount(row.answerCount) }}
          </template>
        </el-table-column>

        <el-table-column label="正确率" width="90" align="center">
          <template #default="{ row }: { row: IQuestionItem }">
            <span
              class="question-list-page__correct-rate"
              :class="{
                'question-list-page__correct-rate--high': row.correctRate >= 85,
                'question-list-page__correct-rate--mid': row.correctRate >= 60 && row.correctRate < 85,
                'question-list-page__correct-rate--low': row.correctRate > 0 && row.correctRate < 60
              }"
            >
              {{ formatCorrectRate(row.correctRate) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }: { row: IQuestionItem }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }: { row: IQuestionItem }">
            <div class="question-list-page__actions">
              <el-button link type="primary" size="small" :icon="Edit" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Pagination -->
    <div class="question-list-page__pagination">
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
  </div>
</template>

<style scoped lang="scss">
.question-list-page {
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

  &__content-text {
    color: var(--app-text-regular);
    cursor: default;
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
}
</style>
