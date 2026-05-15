<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { operationApi } from '@/api/modules/operation'

interface IPushRecord {
  id: number
  pushTime: string
  type: string
  title: string
  method: string
  targetDesc: string
  expectedCount: number
  deliveredCount: number
  openedCount: number
  openRate: string
}

interface IFilterParams {
  type: string
  keyword: string
}

const records = ref<IPushRecord[]>([])
const total = ref(0)
const loading = ref(false)
const pagination = reactive({
  page: 1,
  pageSize: 10
})

const filters = reactive<IFilterParams>({
  type: '',
  keyword: ''
})

function getMethodTagType(method: string): 'primary' | 'success' {
  return method === '自动' ? 'success' : 'primary'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await operationApi.getPushRecords({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    const data = res.data as { list: IPushRecord[]; total: number }
    records.value = data.list
    total.value = data.total
  } catch {
    ElMessage.error('获取推送记录失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  filters.type = ''
  filters.keyword = ''
  pagination.page = 1
  fetchData()
}

function handleSizeChange(val: number) {
  pagination.pageSize = val
  pagination.page = 1
  fetchData()
}

function handlePageChange(val: number) {
  pagination.page = val
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="msg-records-page">
    <el-breadcrumb class="msg-records-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>消息推送</el-breadcrumb-item>
      <el-breadcrumb-item>推送记录</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="msg-records-page__header">
      <h2 class="msg-records-page__title">推送记录</h2>
      <p class="msg-records-page__desc">查看所有消息推送历史记录及送达数据</p>
    </div>

    <!-- Filter -->
    <div class="msg-records-page__filter">
      <div class="msg-records-page__filter-row">
        <el-select
          v-model="filters.type"
          placeholder="消息类型"
          size="small"
          style="width: 160px"
          clearable
        >
          <el-option label="学习提醒" value="学习提醒" />
          <el-option label="复习提醒" value="复习提醒" />
          <el-option label="活动通知" value="活动通知" />
          <el-option label="积分变动" value="积分变动" />
          <el-option label="成就解锁" value="成就解锁" />
          <el-option label="文具掉落" value="文具掉落" />
        </el-select>
        <el-input
          v-model="filters.keyword"
          placeholder="搜索推送标题"
          size="small"
          style="width: 200px"
          clearable
        />
        <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
        <el-button size="small" @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- Table -->
    <div v-loading="loading" class="msg-records-page__table-wrap">
      <el-empty v-if="!loading && records.length === 0" description="暂无推送记录" />
      <el-table v-else :data="records" style="width: 100%">
        <el-table-column label="推送时间" prop="pushTime" width="170" />
        <el-table-column label="消息类型" width="110" align="center" prop="type" />
        <el-table-column label="推送标题" prop="title" min-width="160" />
        <el-table-column label="推送方式" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getMethodTagType(row.method)" size="small">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标用户描述" prop="targetDesc" min-width="130" />
        <el-table-column label="预计送达数" width="110" align="center">
          <template #default="{ row }">
            {{ row.expectedCount.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="实际送达数" width="110" align="center">
          <template #default="{ row }">
            {{ row.deliveredCount.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="打开数" width="90" align="center">
          <template #default="{ row }">
            {{ row.openedCount.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="打开率" width="100" align="center">
          <template #default="{ row }">
            <span class="msg-records-page__rate">{{ row.openRate }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="total > 0" class="msg-records-page__pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.msg-records-page {
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

  &__header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-family: var(--app-font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__desc {
    font-size: 13px;
    color: var(--app-text-secondary);
    margin: 0;
  }

  &__filter {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 16px 20px;
  }

  &__filter-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__table-wrap {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;

    :deep(.el-table) {
      --el-table-border-color: var(--app-border-light);
      --el-table-header-bg-color: var(--app-bg-color);
      --el-table-row-hover-bg-color: #FDFAF5;
    }

    :deep(.el-table th.el-table__cell) {
      font-size: 13px;
      font-weight: 600;
      color: var(--app-text-regular);
    }
  }

  &__rate {
    font-weight: 600;
    color: var(--app-primary-color);
  }

  &__pagination {
    padding: 16px 20px;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid var(--app-border-light);
  }
}
</style>
