<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, RefreshRight } from '@element-plus/icons-vue'
import { systemApi } from '@/api/modules/system'

interface ILoginLog {
  id: number
  loginTime: string
  ip: string
  device: string
  result: string
}

const logList = ref<ILoginLog[]>([])
const tableLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

// Date range filter
const dateRange = ref<[string, string] | null>(null)

function getResultTagType(result: string) {
  return result === '成功' ? 'success' : 'danger'
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
    const res = await systemApi.getLoginLogs(params as { page: number; pageSize: number })
    if (res.code === 0) {
      const data = res.data as { list: ILoginLog[]; total: number }
      logList.value = data.list
      total.value = data.total
    } else {
      ElMessage.error(res.message || '获取登录日志失败')
    }
  } catch {
    ElMessage.error('获取登录日志失败，请稍后重试')
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

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <div class="login-logs-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="login-logs-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统配置</el-breadcrumb-item>
      <el-breadcrumb-item>账号设置</el-breadcrumb-item>
      <el-breadcrumb-item>登录日志</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Title -->
    <h2 class="login-logs-page__title">登录日志</h2>

    <!-- Filter Card -->
    <div class="login-logs-page__filter-card">
      <div class="login-logs-page__filter-row">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="login-logs-page__date-picker"
        />
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- Table Card -->
    <div class="login-logs-page__table-card">
      <el-table
        v-loading="tableLoading"
        :data="logList"
        row-key="id"
        class="login-logs-page__table"
      >
        <el-table-column prop="loginTime" label="登录时间" width="200" />
        <el-table-column prop="ip" label="IP地址" width="180" />
        <el-table-column prop="device" label="设备/浏览器" min-width="200" show-overflow-tooltip />
        <el-table-column label="登录结果" width="120" align="center">
          <template #default="{ row }: { row: ILoginLog }">
            <el-tag :type="getResultTagType(row.result)" size="small">
              {{ row.result }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- Empty State -->
      <div v-if="!tableLoading && logList.length === 0" class="login-logs-page__empty">
        <div class="login-logs-page__empty-icon">
          <svg viewBox="0 0 80 80" width="48" height="48">
            <rect width="80" height="80" rx="40" fill="#F5EDE3"/>
            <path d="M36 28h8v24h-8zM36 56h8v4h-8z" fill="#DAD0C0"/>
          </svg>
        </div>
        <p class="login-logs-page__empty-text">暂无登录日志</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="login-logs-page__pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- Bottom Note -->
    <p class="login-logs-page__note">最多展示最近 50 条记录</p>
  </div>
</template>

<style scoped lang="scss">
.login-logs-page {
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
    width: 280px;
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
}
</style>
