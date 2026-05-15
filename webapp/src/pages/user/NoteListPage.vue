<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshRight, View, WarningFilled } from '@element-plus/icons-vue'
import { noteApi } from '@/api/modules/user'

interface INoteItem {
  id: number
  title: string
  content: string
  cardName: string
  authorId: number
  authorName: string
  createdAt: string
  auditStatus: string
  aiConfidence: number
}

const router = useRouter()

const noteList = ref<INoteItem[]>([])
const tableLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const selectedIds = ref<number[]>([])

const searchKeyword = ref('')
const filterAuditStatus = ref('')

const hasSelection = computed(() => selectedIds.value.length > 0)

const pendingCount = computed(() => noteList.value.filter((n) => n.auditStatus === '审核存疑').length)

const showWarningBanner = computed(() => pendingCount.value > 0)

const auditStatusOptions = [
  { label: '全部', value: '' },
  { label: '审核通过', value: '审核通过' },
  { label: '审核存疑', value: '审核存疑' },
  { label: '已删除', value: '已删除' }
]

function getAuditStatusTagType(status: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (status) {
    case '审核通过': return 'success'
    case '审核存疑': return 'warning'
    case '已删除': return 'info'
    default: return 'info'
  }
}

function isPendingAudit(status: string): boolean {
  return status === '审核存疑'
}

async function fetchNotes() {
  tableLoading.value = true
  try {
    const params: Record<string, unknown> = {
      page: page.value,
      pageSize: pageSize.value
    }
    if (searchKeyword.value) {
      params.title = searchKeyword.value
    }
    if (filterAuditStatus.value) {
      params.auditStatus = filterAuditStatus.value
    }
    const res = await noteApi.getNotes(params as {
      page: number
      pageSize: number
      title?: string
      auditStatus?: string
    })
    if (res.code === 0) {
      const data = res.data as { list: INoteItem[]; total: number }
      noteList.value = data.list
      total.value = data.total
    } else {
      ElMessage.error(res.message || '获取笔记列表失败')
    }
  } catch {
    ElMessage.error('获取笔记列表失败，请稍后重试')
  } finally {
    tableLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchNotes()
}

function handleReset() {
  searchKeyword.value = ''
  filterAuditStatus.value = ''
  page.value = 1
  fetchNotes()
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchNotes()
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  fetchNotes()
}

function handleSelectionChange(selection: INoteItem[]) {
  selectedIds.value = selection.map((item) => item.id)
}

function handleViewDetail(row: INoteItem) {
  router.push(`/user/notes/${row.id}`)
}

function handleCardClick(row: INoteItem) {
  router.push(`/user/notes/${row.id}`)
}

function handleAuthorClick(row: INoteItem) {
  router.push(`/user/${row.authorId}/detail`)
}

async function handleDelete(row: INoteItem) {
  try {
    await ElMessageBox.confirm(
      `确定要删除笔记「${row.title || '无标题'}」吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const res = await noteApi.deleteNote(row.id)
    if (res.code === 0) {
      ElMessage.success('笔记删除成功')
      fetchNotes()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择笔记')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 条笔记吗？此操作不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const res = await noteApi.batchDelete(selectedIds.value)
    if (res.code === 0) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchNotes()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // user cancelled
  }
}

function getDefaultAvatar(nickname: string): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' rx='16' fill='%23D4916E'%3E%3C/rect%3E%3Ctext x='16' y='21' text-anchor='middle' fill='white' font-size='14' font-family='sans-serif'%3E${encodeURIComponent(nickname.charAt(0))}%3C/text%3E%3C/svg%3E`
}

function tableRowClassName({ row }: { row: INoteItem }) {
  if (isPendingAudit(row.auditStatus)) {
    return 'note-list-page__row--pending'
  }
  return ''
}

function formatContentPreview(content: string): string {
  if (content.length > 60) {
    return content.substring(0, 60) + '...'
  }
  return content
}

onMounted(() => {
  fetchNotes()
})
</script>

<template>
  <div class="note-list-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="note-list-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>笔记管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Title -->
    <div class="note-list-page__top-bar">
      <h2 class="note-list-page__title">笔记管理</h2>
    </div>

    <!-- Warning Banner -->
    <div v-if="showWarningBanner" class="note-list-page__warning-banner">
      <el-icon :size="18" class="note-list-page__warning-icon"><WarningFilled /></el-icon>
      <span>有 {{ pendingCount }} 条笔记待人工审核，请及时处理</span>
    </div>

    <!-- Filter Card -->
    <div class="note-list-page__filter-card">
      <div class="note-list-page__filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索笔记标题或内容..."
          :prefix-icon="Search"
          clearable
          class="note-list-page__filter-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="filterAuditStatus"
          placeholder="审核状态"
          clearable
          class="note-list-page__filter-select"
          @change="handleSearch"
        >
          <el-option
            v-for="opt in auditStatusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- Batch Action Bar -->
    <div v-if="hasSelection" class="note-list-page__batch-bar">
      <span class="note-list-page__batch-info">已选 {{ selectedIds.length }} 项</span>
      <el-button type="danger" plain @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- Table -->
    <div class="note-list-page__table-card">
      <el-table
        v-loading="tableLoading"
        :data="noteList"
        row-key="id"
        class="note-list-page__table"
        :row-class-name="tableRowClassName"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />

        <el-table-column label="笔记标题" min-width="180" show-overflow-tooltip>
          <template #default="{ row }: { row: INoteItem }">
            <el-button link type="primary" @click="handleViewDetail(row)">
              {{ row.title || '(无标题)' }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="内容预览" min-width="220" show-overflow-tooltip>
          <template #default="{ row }: { row: INoteItem }">
            <span class="note-list-page__content-preview">{{ formatContentPreview(row.content) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="所属卡片" width="160" show-overflow-tooltip>
          <template #default="{ row }: { row: INoteItem }">
            <el-button link type="info" @click="handleCardClick(row)">
              {{ row.cardName }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="作者" width="140">
          <template #default="{ row }: { row: INoteItem }">
            <div class="note-list-page__author" @click="handleAuthorClick(row)">
              <el-avatar :size="24" :src="getDefaultAvatar(row.authorName)" />
              <span class="note-list-page__author-name">{{ row.authorName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="150" align="center" />

        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }: { row: INoteItem }">
            <el-tag :type="getAuditStatusTagType(row.auditStatus)" size="small">
              {{ row.auditStatus }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }: { row: INoteItem }">
            <div class="note-list-page__actions">
              <el-button link type="primary" size="small" :icon="View" @click="handleViewDetail(row)">
                查看详情
              </el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Empty State -->
      <div v-if="!tableLoading && noteList.length === 0" class="note-list-page__empty">
        <p class="note-list-page__empty-text">暂无笔记数据</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="note-list-page__pagination">
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
.note-list-page {
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

  // Warning Banner
  &__warning-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    background: #FDF5E8;
    border: 1px solid #F0D5A0;
    border-radius: 10px;
    font-size: 14px;
    color: #B87A2B;
  }

  &__warning-icon {
    color: #E6A23C;
    flex-shrink: 0;
  }

  // Filter
  &__filter-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 20px 24px;
  }

  &__filter-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__filter-input {
    width: 300px;
  }

  &__filter-select {
    width: 150px;
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

  // Pending row highlight
  :deep(.note-list-page__row--pending) {
    td {
      background-color: #FDF5E8 !important;
    }

    &:hover > td {
      background-color: #FDF0D5 !important;
    }
  }

  &__content-preview {
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    &:hover .note-list-page__author-name {
      color: var(--app-primary-color);
    }
  }

  &__author-name {
    font-size: 13px;
    color: var(--app-text-primary);
    transition: color 0.2s;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: center;
    flex-wrap: wrap;
  }

  // Empty
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
  }

  &__empty-text {
    font-size: 14px;
    color: var(--app-text-secondary);
    margin: 0;
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
