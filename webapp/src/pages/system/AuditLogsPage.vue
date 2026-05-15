<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, RefreshRight, Download } from '@element-plus/icons-vue'
import { systemApi } from '@/api/modules/system'

interface IAuditLog {
  id: number
  operateTime: string
  operator: string
  module: string
  type: string
  target: string
  content: string
  ip: string
  sensitive?: boolean
}

const logList = ref<IAuditLog[]>([])
const tableLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

// Filters
const dateRange = ref<[string, string] | null>(null)
const filterModule = ref<string[]>([])
const filterType = ref<string[]>([])
const filterOperator = ref('')

// Content detail dialog
const contentDialogVisible = ref(false)
const contentDialogData = ref<IAuditLog | null>(null)

const moduleOptions = [
  { label: '全部', value: '' },
  { label: '数据看板', value: '数据看板' },
  { label: '内容管理', value: '内容管理' },
  { label: '用户管理', value: '用户管理' },
  { label: '运营管理', value: '运营管理' },
  { label: '系统配置', value: '系统配置' }
]

const typeOptions = [
  { label: '全部', value: '' },
  { label: '登录', value: '登录' },
  { label: '新增', value: '新增' },
  { label: '编辑', value: '编辑' },
  { label: '删除', value: '删除' },
  { label: '上架', value: '上架' },
  { label: '下架', value: '下架' },
  { label: '导出', value: '导出' },
  { label: '禁用', value: '禁用' },
  { label: '其他', value: '其他' }
]

// Sensitive operation types
const sensitiveTypes = ['批量删除', '用户禁用', '积分调整']

function isSensitive(row: IAuditLog): boolean {
  return row.sensitive === true || sensitiveTypes.includes(row.type) || sensitiveTypes.includes(row.target)
}

function getTypeTagType(type: string): 'success' | 'warning' | 'danger' | 'info' {
  const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    '登录': 'info',
    '新增': 'success',
    '编辑': 'info',
    '删除': 'danger',
    '上架': 'success',
    '下架': 'warning',
    '导出': 'info',
    '禁用': 'danger',
    '其他': 'info'
  }
  return typeMap[type] || 'info'
}

function truncateContent(content: string, maxLen = 40): string {
  if (content.length <= maxLen) return content
  return content.slice(0, maxLen) + '...'
}

function showContentDetail(row: IAuditLog) {
  contentDialogData.value = row
  contentDialogVisible.value = true
}

function handleContentDialogClose() {
  contentDialogVisible.value = false
  contentDialogData.value = null
}

async function fetchLogs() {
  tableLoading.value = true
  try {
    const params: Record<string, unknown> = {
      page: page.value,
      pageSize: pageSize.value
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    if (filterModule.value.length > 0 && filterModule.value[0] !== '') {
      params.module = filterModule.value[0]
    }
    if (filterType.value.length > 0 && filterType.value[0] !== '') {
      params.type = filterType.value[0]
    }
    if (filterOperator.value) {
      params.operator = filterOperator.value
    }
    const res = await systemApi.getAuditLogs(params as {
      page: number
      pageSize: number
      module?: string
      type?: string
      operator?: string
    })
    if (res.code === 0) {
      const data = res.data as { list: IAuditLog[]; total: number }
      logList.value = data.list
      total.value = data.total
    } else {
      ElMessage.error(res.message || '获取操作日志失败')
    }
  } catch {
    ElMessage.error('获取操作日志失败，请稍后重试')
  } finally {
    tableLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchLogs()
}

function handleReset() {
  dateRange.value = null
  filterModule.value = []
  filterType.value = []
  filterOperator.value = ''
  page.value = 1
  fetchLogs()
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchLogs()
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  fetchLogs()
}

function handleExport() {
  ElMessage.info('正在导出操作日志...')
}

function getRowClassName({ row }: { row: IAuditLog }): string {
  return isSensitive(row) ? 'audit-logs-page__row--sensitive' : ''
}

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <div class="audit-logs-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="audit-logs-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统配置</el-breadcrumb-item>
      <el-breadcrumb-item>日志审计</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Title -->
    <h2 class="audit-logs-page__title">日志审计</h2>

    <!-- Filter Card -->
    <div class="audit-logs-page__filter-card">
      <div class="audit-logs-page__filter-row">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="audit-logs-page__date-picker"
        />
        <el-select
          v-model="filterModule"
          placeholder="操作模块"
          clearable
          multiple
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="1"
          class="audit-logs-page__filter-select"
        >
          <el-option
            v-for="opt in moduleOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-select
          v-model="filterType"
          placeholder="操作类型"
          clearable
          multiple
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="1"
          class="audit-logs-page__filter-select"
        >
          <el-option
            v-for="opt in typeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-input
          v-model="filterOperator"
          placeholder="操作人员"
          clearable
          class="audit-logs-page__filter-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
        <div class="audit-logs-page__filter-spacer" />
        <el-button :icon="Download" plain @click="handleExport">导出日志</el-button>
      </div>
    </div>

    <!-- Table Card -->
    <div class="audit-logs-page__table-card">
      <el-table
        v-loading="tableLoading"
        :data="logList"
        row-key="id"
        :row-class-name="getRowClassName"
        class="audit-logs-page__table"
      >
        <el-table-column prop="operateTime" label="操作时间" width="180" />
        <el-table-column prop="operator" label="操作人员" width="120" />
        <el-table-column prop="module" label="操作模块" width="120" align="center" />
        <el-table-column label="操作类型" width="100" align="center">
          <template #default="{ row }: { row: IAuditLog }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="操作对象" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作内容" min-width="200">
          <template #default="{ row }: { row: IAuditLog }">
            <span
              class="audit-logs-page__content-text"
              :class="{ 'audit-logs-page__content-text--link': row.content.length > 40 }"
              @click="row.content.length > 40 && showContentDetail(row)"
            >
              {{ truncateContent(row.content) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" width="160" />
      </el-table>

      <!-- Empty State -->
      <div v-if="!tableLoading && logList.length === 0" class="audit-logs-page__empty">
        <div class="audit-logs-page__empty-icon">
          <svg viewBox="0 0 80 80" width="48" height="48">
            <rect width="80" height="80" rx="40" fill="#F5EDE3"/>
            <path d="M36 28h8v24h-8zM36 56h8v4h-8z" fill="#DAD0C0"/>
          </svg>
        </div>
        <p class="audit-logs-page__empty-text">暂无操作日志</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="audit-logs-page__pagination">
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

    <!-- Bottom Note -->
    <p class="audit-logs-page__note">系统保留最近 180 天操作日志，超期自动归档</p>

    <!-- Content Detail Dialog -->
    <el-dialog
      v-model="contentDialogVisible"
      title="操作详情"
      width="480px"
      :close-on-click-modal="false"
      @close="handleContentDialogClose"
    >
      <template v-if="contentDialogData">
        <div class="audit-logs-page__detail">
          <div class="audit-logs-page__detail-row">
            <span class="audit-logs-page__detail-label">操作时间</span>
            <span class="audit-logs-page__detail-value">{{ contentDialogData.operateTime }}</span>
          </div>
          <div class="audit-logs-page__detail-row">
            <span class="audit-logs-page__detail-label">操作人员</span>
            <span class="audit-logs-page__detail-value">{{ contentDialogData.operator }}</span>
          </div>
          <div class="audit-logs-page__detail-row">
            <span class="audit-logs-page__detail-label">操作模块</span>
            <span class="audit-logs-page__detail-value">{{ contentDialogData.module }}</span>
          </div>
          <div class="audit-logs-page__detail-row">
            <span class="audit-logs-page__detail-label">操作类型</span>
            <span class="audit-logs-page__detail-value">
              <el-tag :type="getTypeTagType(contentDialogData.type)" size="small">
                {{ contentDialogData.type }}
              </el-tag>
            </span>
          </div>
          <div class="audit-logs-page__detail-row">
            <span class="audit-logs-page__detail-label">操作对象</span>
            <span class="audit-logs-page__detail-value">{{ contentDialogData.target }}</span>
          </div>
          <div class="audit-logs-page__detail-row">
            <span class="audit-logs-page__detail-label">IP地址</span>
            <span class="audit-logs-page__detail-value">{{ contentDialogData.ip }}</span>
          </div>
          <div class="audit-logs-page__detail-divider" />
          <div class="audit-logs-page__detail-row audit-logs-page__detail-row--block">
            <span class="audit-logs-page__detail-label">操作内容</span>
            <span class="audit-logs-page__detail-value audit-logs-page__detail-value--block">
              {{ contentDialogData.content }}
            </span>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.audit-logs-page {
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

  &__title {
    font-family: var(--app-font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0;
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

  &__date-picker {
    width: 260px;
  }

  &__filter-select {
    width: 150px;
  }

  &__filter-input {
    width: 160px;
  }

  &__filter-spacer {
    flex: 1;
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
      .el-table__cell {
        border-bottom: 1px solid var(--app-border-light);
        padding: 14px 0;
      }
    }

    :deep(.el-table__empty-text) {
      color: var(--app-text-secondary);
    }
  }

  // Sensitive row highlight
  &__row--sensitive {
    background-color: #FDF0EF !important;

    &:hover > td {
      background-color: #FBE8E6 !important;
    }
  }

  // Content text
  &__content-text {
    color: var(--app-text-regular);

    &--link {
      color: var(--app-info-color);
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  // Empty State
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    gap: 16px;
  }

  &__empty-icon {
    opacity: 0.6;
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

  // Note
  &__note {
    font-size: 12px;
    color: var(--app-text-secondary);
    text-align: center;
    margin: 0;
    padding-top: 4px;
  }

  // Detail Dialog
  &__detail {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__detail-row {
    display: flex;
    align-items: center;

    &--block {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }

  &__detail-label {
    font-size: 13px;
    color: var(--app-text-secondary);
    width: 80px;
    flex-shrink: 0;
  }

  &__detail-value {
    font-size: 14px;
    color: var(--app-text-regular);

    &--block {
      width: 100%;
      padding: 10px 14px;
      background: var(--app-bg-color);
      border-radius: 8px;
      line-height: 1.6;
    }
  }

  &__detail-divider {
    height: 1px;
    background: var(--app-border-light);
    margin: 4px 0;
  }
}
</style>
